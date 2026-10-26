/**
 * MediaUploader.jsx — Admin-only media upload widget
 *
 * Implements the signed, browser-to-Cloudinary direct upload flow:
 *
 *   1. Admin selects a file (image or video)
 *   2. Component fetches a signed upload signature from our backend
 *   3. File is POSTed directly to Cloudinary using XHR (for progress events)
 *   4. On success, metadata is confirmed to our backend (POST /api/media/confirm)
 *   5. onSuccess(result) is called with the DB record returned by the backend
 *
 * Props:
 *   uploadType   — 'thumbnail' | 'video'
 *   recordId     — course UUID (thumbnail) or lesson UUID (video)
 *   currentUrl   — existing media URL for preview/replacement
 *   onSuccess    — callback(result) after DB confirmation succeeds
 *   disabled     — grey out the widget when parent form is busy
 *
 * Security:
 *   The Cloudinary API key is returned in the signature response and used
 *   only to construct the upload payload — it is NOT a secret. The API
 *   secret never leaves the server.
 *
 * Retry:
 *   Network failures during the Cloudinary upload are retried automatically
 *   up to MAX_RETRIES times with exponential back-off.
 */

import { useState, useRef } from 'react'
import { mediaApi } from '../../services/api.js'

const MAX_RETRIES  = 2
const RETRY_DELAY  = 1500   // ms, doubles each retry
const UPLOAD_URL   = (cloudName) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`

const ACCEPTED = {
  thumbnail: 'image/jpeg,image/png,image/webp,image/gif',
  video:     'video/mp4,video/webm,video/quicktime,video/x-matroska',
}

const MAX_SIZE_LABEL = {
  thumbnail: '5 MB',
  video:     '500 MB',
}

// ── helpers ─────────────────────────────────────────────────────────────────

function humanSize(bytes) {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── component ─────────────────────────────────────────────────────────────────

export default function MediaUploader({
  uploadType,
  recordId,
  currentUrl,
  onSuccess,
  disabled = false,
}) {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [progress, setProgress] = useState(0)   // 0–100
  const [status, setStatus]     = useState('idle')  // idle | uploading | confirming | done | error
  const [errorMsg, setErrorMsg] = useState('')
  const [resultUrl, setResultUrl] = useState(null)

  const fileInputRef = useRef(null)
  const xhrRef       = useRef(null)

  const isImage = uploadType === 'thumbnail'

  // ── File selection ────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const selected = e.target.files?.[0]
    if (!selected) return

    // Client-side MIME check
    const allowedMimes = ACCEPTED[uploadType].split(',')
    if (!allowedMimes.includes(selected.type)) {
      setErrorMsg(`Invalid file type: ${selected.type}. Allowed: ${ACCEPTED[uploadType]}`)
      return
    }

    // Client-side size check (rough guard; server re-validates)
    const maxBytes = uploadType === 'thumbnail' ? 5 * 1024 * 1024 : 500 * 1024 * 1024
    if (selected.size > maxBytes) {
      setErrorMsg(`File too large (${humanSize(selected.size)}). Maximum: ${MAX_SIZE_LABEL[uploadType]}`)
      return
    }

    setFile(selected)
    setErrorMsg('')
    setStatus('idle')
    setProgress(0)
    setResultUrl(null)

    // Generate preview for images
    if (isImage) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(selected)
    } else {
      setPreview(null)
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file || !recordId) return
    setStatus('uploading')
    setErrorMsg('')
    setProgress(0)

    let attempt = 0
    let lastErr

    while (attempt <= MAX_RETRIES) {
      try {
        // 1. Get signature from our backend
        const signedParams = await mediaApi.sign(uploadType)

        // 2. Build multipart form for Cloudinary
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key',   signedParams.api_key)
        formData.append('timestamp', signedParams.timestamp)
        formData.append('signature', signedParams.signature)
        formData.append('folder',    signedParams.folder)

        // 3. Upload directly to Cloudinary with XHR for progress tracking
        const cloudResult = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhrRef.current = xhr

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 90))  // cap at 90 until confirmed
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText))
              } catch {
                reject(new Error('Cloudinary returned an invalid response.'))
              }
            } else {
              let msg = `Upload failed (HTTP ${xhr.status})`
              try {
                const body = JSON.parse(xhr.responseText)
                if (body.error?.message) msg = body.error.message
              } catch (_) {}
              reject(new Error(msg))
            }
          }

          xhr.onerror = () => reject(new Error('Network error during upload.'))
          xhr.onabort = () => reject(new Error('Upload cancelled.'))

          xhr.open('POST', UPLOAD_URL(signedParams.cloud_name))
          xhr.send(formData)
        })

        // 4. Confirm upload with our backend (saves to DB)
        setStatus('confirming')
        setProgress(95)

        const confirmResult = await mediaApi.confirm({
          upload_type:   uploadType,
          record_id:     recordId,
          public_id:     cloudResult.public_id,
          secure_url:    cloudResult.secure_url,
          resource_type: cloudResult.resource_type,
          bytes:         cloudResult.bytes,
          duration:      cloudResult.duration ?? null,
          poster_url:    cloudResult.poster_url ?? null,
        })

        // 5. Done
        setProgress(100)
        setStatus('done')
        setResultUrl(cloudResult.secure_url)
        if (onSuccess) onSuccess(confirmResult)
        return   // success — exit retry loop

      } catch (err) {
        lastErr = err
        attempt++
        if (attempt <= MAX_RETRIES) {
          const wait = RETRY_DELAY * Math.pow(2, attempt - 1)
          setErrorMsg(`Upload failed — retrying in ${wait / 1000}s… (${attempt}/${MAX_RETRIES})`)
          await delay(wait)
          setErrorMsg('')
        }
      }
    }

    // All retries exhausted
    setStatus('error')
    setErrorMsg(lastErr?.message ?? 'Upload failed after multiple attempts.')
    setProgress(0)
  }

  function handleCancel() {
    xhrRef.current?.abort()
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
  }

  function handleReset() {
    setFile(null)
    setPreview(null)
    setProgress(0)
    setStatus('idle')
    setErrorMsg('')
    setResultUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isUploading  = status === 'uploading' || status === 'confirming'
  const isDone       = status === 'done'
  const isError      = status === 'error'
  const displayUrl   = resultUrl ?? currentUrl

  return (
    <div className="flex flex-col gap-3">

      {/* Current / preview image */}
      {isImage && displayUrl && (
        <div className="relative">
          <img
            src={isDone ? displayUrl : (preview ?? displayUrl)}
            alt="Thumbnail preview"
            className="w-full h-40 object-cover rounded-xl border border-border"
          />
          {isDone && (
            <span className="absolute top-2 right-2 bg-sage text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Uploaded ✓
            </span>
          )}
        </div>
      )}

      {/* Video info */}
      {!isImage && file && (
        <div className="flex items-center gap-3 bg-cream rounded-xl px-4 py-3 border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-terracotta flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-charcoal truncate">{file.name}</p>
            <p className="text-xs text-warm-gray">{humanSize(file.size)}</p>
          </div>
          {isDone && <span className="text-xs font-semibold text-sage">Uploaded ✓</span>}
        </div>
      )}

      {/* File input */}
      {!isUploading && !isDone && (
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed border-border' : 'border-terracotta/40 hover:border-terracotta hover:bg-terracotta/5'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED[uploadType]}
            onChange={handleFileChange}
            disabled={disabled}
            className="sr-only"
            aria-label={`Select ${isImage ? 'thumbnail image' : 'lesson video'}`}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-warm-gray mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm font-semibold text-charcoal">
            {file ? file.name : `Select ${isImage ? 'image' : 'video'}`}
          </p>
          <p className="text-xs text-warm-gray mt-0.5">
            {isImage ? 'JPG, PNG, WebP · max 5 MB' : 'MP4, WebM, MOV · max 500 MB'}
          </p>
        </label>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-warm-gray">
            <span>{status === 'confirming' ? 'Saving to database…' : 'Uploading to Cloudinary…'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-terracotta h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Upload progress"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {/* Upload button — shown when file is selected and not yet uploading */}
        {file && !isUploading && !isDone && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={disabled}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImage ? 'Upload Thumbnail' : 'Upload Video'}
          </button>
        )}

        {/* Cancel during upload */}
        {isUploading && (
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary text-sm py-2 px-4"
          >
            Cancel
          </button>
        )}

        {/* Replace / reset after done */}
        {isDone && (
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary text-sm py-2 px-4"
          >
            Replace {isImage ? 'Thumbnail' : 'Video'}
          </button>
        )}

        {/* Retry after error */}
        {isError && file && (
          <button
            type="button"
            onClick={handleUpload}
            className="btn-primary text-sm py-2 px-4"
          >
            Retry Upload
          </button>
        )}
      </div>
    </div>
  )
}
