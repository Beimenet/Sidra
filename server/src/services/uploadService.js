/**
 * uploadService.js — Cloudinary upload utilities
 *
 * Sidra uses the SIGNED, DIRECT-FROM-BROWSER (unsigned=false) upload flow:
 *
 *   1. Admin browser requests a signature from the backend:
 *        POST /api/media/sign  →  { signature, timestamp, api_key, ... }
 *
 *   2. Browser POSTs the file directly to Cloudinary's upload endpoint
 *      using the signed parameters. The file bytes NEVER transit our server.
 *      This is the correct approach for large videos.
 *
 *   3. Cloudinary responds with the asset metadata (public_id, secure_url, etc.)
 *
 *   4. Browser sends the metadata to our backend:
 *        POST /api/media/confirm  →  updates DB record
 *
 * The API secret is used only in step 1 (signing) and never leaves the server.
 *
 * For deletion (step: admin clicks "Remove media"), the backend calls
 * cloudinary.uploader.destroy() directly — the browser never has the secret.
 */

import crypto from 'crypto'
import cloudinary, { isCloudinaryConfigured, FOLDERS, MAX_BYTES, ALLOWED_MIME } from '../config/cloudinary.js'

const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env

/**
 * Generate a signed upload signature.
 *
 * @param {'thumbnail'|'video'} uploadType
 * @param {object} [extra]  additional Cloudinary upload params to lock in
 * @returns {{ signature, timestamp, api_key, cloud_name, folder, upload_preset?, ... }}
 */
export function generateSignature(uploadType, extra = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured on this server.')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder    = FOLDERS[uploadType]

  // These params are included in the signature — any tampering by the browser
  // will cause Cloudinary to reject the upload.
  const paramsToSign = {
    folder,
    timestamp,
    // For videos: allow chunked uploads (required for files > 100 MB)
    ...(uploadType === 'video' ? { chunk_size: 20_000_000 } : {}),  // 20 MB chunks
    ...extra,
  }

  // Sort keys alphabetically before signing (Cloudinary requirement)
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join('&')

  const signature = crypto
    .createHash('sha256')
    .update(sortedParams + CLOUDINARY_API_SECRET)
    .digest('hex')

  return {
    signature,
    timestamp,
    api_key:    CLOUDINARY_API_KEY,
    cloud_name: CLOUDINARY_CLOUD_NAME,
    folder,
    ...paramsToSign,
  }
}

/**
 * Delete a Cloudinary asset by public_id.
 * Called from our backend only — never exposed directly to the browser.
 *
 * @param {string} publicId     e.g. "sidra/courses/thumbnails/abc123"
 * @param {'image'|'video'} resourceType
 * @returns {Promise<{result: string}>}
 */
export async function deleteCloudinaryAsset(publicId, resourceType = 'image') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured on this server.')
  }
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate:    true,   // purge from CDN edge caches
  })
  return result
}

/**
 * Validate the asset metadata returned by Cloudinary after a direct upload.
 * Throws if the upload doesn't match the expected type, size, or folder.
 *
 * @param {'thumbnail'|'video'} uploadType
 * @param {object} cloudinaryResult   — the JSON Cloudinary returned to the browser
 */
export function validateUploadResult(uploadType, cloudinaryResult) {
  const { public_id, resource_type, bytes, format } = cloudinaryResult ?? {}

  if (!public_id || typeof public_id !== 'string') {
    throw new Error('Invalid upload result: missing public_id.')
  }

  // Verify the file landed in our expected folder
  const expectedFolder = FOLDERS[uploadType]
  if (!public_id.startsWith(expectedFolder + '/')) {
    throw new Error(`Upload landed in unexpected folder: ${public_id}`)
  }

  // Check resource type
  const expectedRt = uploadType === 'thumbnail' ? 'image' : 'video'
  if (resource_type !== expectedRt) {
    throw new Error(`Expected resource_type '${expectedRt}', got '${resource_type}'.`)
  }

  // Check size (Cloudinary reports bytes)
  if (bytes > MAX_BYTES[uploadType]) {
    throw new Error(
      `File too large: ${Math.round(bytes / 1024 / 1024)} MB exceeds the ` +
      `${Math.round(MAX_BYTES[uploadType] / 1024 / 1024)} MB limit.`
    )
  }
}
