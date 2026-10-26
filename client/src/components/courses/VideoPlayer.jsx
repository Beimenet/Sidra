/**
 * VideoPlayer.jsx — Cloudinary-hosted video player
 *
 * Uses the native HTML5 <video> element for maximum browser compatibility.
 * Displays:
 *   - A Cloudinary-hosted video via src (secure_url)
 *   - An auto-generated poster frame (video_poster_url)
 *   - Loading indicator while buffering
 *   - Error state with a retry button
 *   - A placeholder when no video URL is provided yet
 *
 * Cloudinary adaptive streaming (HLS) can be wired in later by adding
 * a <source type="application/x-mpegURL"> for .m3u8 URLs alongside the
 * existing mp4 source. No new dependency required for plain mp4 playback.
 */

import { useState, useRef } from 'react'

// ── No-video placeholder ──────────────────────────────────────────────────────
function VideoPlaceholder({ message }) {
  return (
    <div className="relative bg-charcoal rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center gap-3 border border-border">
      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <p className="text-white/50 text-sm px-6 text-center">{message ?? 'No video available yet'}</p>
    </div>
  )
}

export default function VideoPlayer({
  src,            // Cloudinary secure_url
  poster,         // video_poster_url (optional, auto-generated from Cloudinary)
  title,          // lesson or section title for aria-label
  className = '',
}) {
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const videoRef = useRef(null)

  if (!src) {
    return <VideoPlaceholder message="No video has been uploaded for this lesson yet." />
  }

  function handleCanPlay() {
    setLoading(false)
    setError(false)
  }

  function handleError() {
    setLoading(false)
    setError(true)
  }

  function handleRetry() {
    setError(false)
    setLoading(true)
    setRetryKey((k) => k + 1)
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-charcoal aspect-video ${className}`}>

      {/* Loading spinner — shown until canplay fires */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-charcoal" aria-hidden="true">
          <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-charcoal px-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-white/70 text-sm text-center">Could not load video. Check your connection.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* The actual video element */}
      <video
        key={retryKey}
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        controls
        preload="metadata"
        className={`w-full h-full object-contain transition-opacity duration-300 ${loading || error ? 'opacity-0' : 'opacity-100'}`}
        aria-label={title ? `Video: ${title}` : 'Lesson video'}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onLoadStart={() => { setLoading(true); setError(false) }}
        playsInline
      >
        <p>Your browser does not support HTML5 video. <a href={src} className="underline text-white/70">Download the video</a> instead.</p>
      </video>
    </div>
  )
}
