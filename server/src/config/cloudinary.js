/**
 * cloudinary.js — Cloudinary SDK configuration
 *
 * Centralised Cloudinary config so every part of the backend uses the same
 * credentials. The SDK is configured once at import time; subsequent imports
 * get the already-configured instance.
 *
 * Required environment variables:
 *   CLOUDINARY_CLOUD_NAME   — your Cloudinary cloud name
 *   CLOUDINARY_API_KEY      — your Cloudinary API key
 *   CLOUDINARY_API_SECRET   — your Cloudinary API secret (NEVER sent to browser)
 *
 * These must only ever be read server-side. They are NOT exposed to React.
 */

import { v2 as cloudinary } from 'cloudinary'

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    '[cloudinary] WARNING: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or ' +
    'CLOUDINARY_API_SECRET is not set. Upload endpoints will return 503 ' +
    'until these variables are configured.'
  )
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,   // always use https:// URLs
})

export default cloudinary

/**
 * Returns true when all three required Cloudinary variables are present.
 * Used by upload endpoints to return a clean 503 instead of crashing.
 */
export function isCloudinaryConfigured() {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
}

/**
 * Upload folders — keep assets organised in Cloudinary.
 * Never let callers choose arbitrary folders.
 */
export const FOLDERS = {
  thumbnail: 'sidra/courses/thumbnails',
  video: 'sidra/courses/lessons',
}

/**
 * Allowed MIME types per upload type.
 * Validated against the Content-Type header set by the browser before the
 * signed upload is even issued.
 */
export const ALLOWED_MIME = {
  thumbnail: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
}

/**
 * Maximum file sizes in bytes.
 *  thumbnail: 5 MB   (images compress well; no reason to allow larger)
 *  video:     500 MB (typical lecture video; Cloudinary free plan limit is 100 MB)
 */
export const MAX_BYTES = {
  thumbnail: 5 * 1024 * 1024,
  video: 500 * 1024 * 1024,
}
