/**
 * AdminCoursesPage.jsx — Course & Lesson Management
 *
 * Connected to the real backend API:
 *   - Lists all courses (incl. drafts) from GET /api/courses/all
 *   - Create / edit / delete courses
 *   - Publish / unpublish courses
 *   - Add / edit / delete lessons per course
 *   - Upload course thumbnails via Cloudinary (MediaUploader)
 *   - Upload lesson videos via Cloudinary (MediaUploader)
 *   - Remove uploaded media
 *
 * Preserves the existing DashboardLayout and design system.
 * Does NOT touch static data files or public-facing course pages.
 */

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout.jsx'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader.jsx'
import DashboardEmptyState from '../../components/dashboard/DashboardEmptyState.jsx'
import MediaUploader from '../../components/dashboard/MediaUploader.jsx'
import { adminApi, mediaApi, coursesApi } from '../../services/api.js'

const breadcrumb = [{ label: 'Admin', to: '/admin' }, { label: 'Course Management' }]

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])
  const cls = type === 'success'
    ? 'bg-sage/20 border-sage/40 text-charcoal'
    : 'bg-red-50 border-red-200 text-red-700'
  return (
    <div role="status" className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 border rounded-xl px-4 py-3 shadow-lg text-sm font-medium max-w-sm ${cls}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100" aria-label="Dismiss">✕</button>
    </div>
  )
}

// ── Confirm dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, danger = false, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 id="confirm-title" className="text-lg font-bold text-charcoal">{title}</h2>
        <p className="text-sm text-warm-gray leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
          <button
            type="button"
            onClick={onConfirm}
            className={`py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${danger
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'btn-primary'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Field wrapper ──────────────────────────────────────────────────────────
function Field({ label, error, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-warm-gray">{hint}</p>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent'

// ── Course form (create / edit) ────────────────────────────────────────────
function CourseForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? '',
    price_etb: initial?.price_etb ?? '0',
    published: initial?.published ?? false,
  })
  const [errors, setErrors] = useState({})

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim() || form.title.trim().length < 3)
      e.title = 'Title must be at least 3 characters.'
    if (!form.description.trim() || form.description.trim().length < 10)
      e.description = 'Description must be at least 10 characters.'
    if (!form.category.trim())
      e.category = 'Category is required.'
    if (isNaN(Number(form.price_etb)) || Number(form.price_etb) < 0)
      e.price_etb = 'Price must be a non-negative number.'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price_etb: Number(form.price_etb),
      published: form.published,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Title" error={errors.title}>
        <input className={INPUT_CLS} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Understanding Child Development" />
      </Field>
      <Field label="Description" error={errors.description}>
        <textarea className={`${INPUT_CLS} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe what learners will gain…" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category" error={errors.category}>
          <input className={INPUT_CLS} value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Child Development" />
        </Field>
        <Field label="Price (ETB)" error={errors.price_etb} hint="Set 0 for a free course.">
          <input className={INPUT_CLS} type="number" min="0" step="0.01" value={form.price_etb} onChange={e => set('price_etb', e.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-charcoal cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)}
          className="w-4 h-4 rounded accent-terracotta" />
        Publish immediately (visible to learners)
      </label>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm py-2 px-4">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4 disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Course'}
        </button>
      </div>
    </form>
  )
}

// ── Lesson form ────────────────────────────────────────────────────────────
function LessonForm({ initial, nextPosition, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    position: initial?.position ?? nextPosition ?? 1,
  })
  const [errors, setErrors] = useState({})

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim() || form.title.trim().length < 2)
      errs.title = 'Title must be at least 2 characters.'
    if (!Number.isInteger(Number(form.position)) || Number(form.position) < 1)
      errs.position = 'Position must be a positive integer.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ title: form.title.trim(), description: form.description.trim() || null, position: Number(form.position) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field label="Lesson title" error={errors.title}>
          <input className={INPUT_CLS} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Introduction" />
        </Field>
        <Field label="Position" error={errors.position}>
          <input className={`${INPUT_CLS} w-20`} type="number" min="1" value={form.position} onChange={e => set('position', e.target.value)} />
        </Field>
      </div>
      <Field label="Description (optional)">
        <input className={INPUT_CLS} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description" />
      </Field>
      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary text-sm py-2 px-3">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary text-sm py-2 px-4 disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? 'Saving…' : initial ? 'Update Lesson' : 'Add Lesson'}
        </button>
      </div>
    </form>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ published }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${published ? 'bg-sage/25 text-charcoal' : 'bg-amber-50 text-amber-700'
      }`}>
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

// ── LessonRow ──────────────────────────────────────────────────────────────
function LessonRow({ lesson, courseId, onEdit, onDelete, onUploadSuccess, onRemoveVideo }) {
  const [showUploader, setShowUploader] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeErr, setRemoveErr] = useState('')

  async function handleRemoveVideo() {
    setRemoving(true)
    setRemoveErr('')
    try {
      await mediaApi.remove('video', lesson.id)
      onRemoveVideo(lesson.id)
    } catch (err) {
      setRemoveErr(err.message ?? 'Remove failed.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3 border-t border-border hover:bg-cream/40 transition-colors">
      <div className="flex items-center gap-3">
        {/* Position badge */}
        <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-bold text-warm-gray flex-shrink-0">
          {lesson.position}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-charcoal truncate">{lesson.title}</p>
          {lesson.description && (
            <p className="text-xs text-warm-gray truncate">{lesson.description}</p>
          )}
        </div>
        {/* Video indicator */}
        {lesson.video_url && (
          <span className="text-xs font-semibold text-[#4389C7] flex items-center gap-1 flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
            </svg>
            Video
          </span>
        )}
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={() => setShowUploader(v => !v)}
            className="text-xs font-medium text-terracotta hover:text-terracotta-hover transition-colors">
            {lesson.video_url ? 'Replace video' : '+ Video'}
          </button>
          {lesson.video_url && (
            <button type="button" onClick={handleRemoveVideo} disabled={removing}
              className="text-xs font-medium text-warm-gray hover:text-red-600 transition-colors disabled:opacity-40">
              {removing ? '…' : 'Remove'}
            </button>
          )}
          <button type="button" onClick={() => onEdit(lesson)}
            className="text-xs font-medium text-warm-gray hover:text-charcoal transition-colors">
            Edit
          </button>
          <button type="button" onClick={() => onDelete(lesson)}
            className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {removeErr && <p className="text-xs text-red-600 pl-9">{removeErr}</p>}

      {showUploader && (
        <div className="pl-9 pr-2 pb-2">
          <MediaUploader
            uploadType="video"
            recordId={lesson.id}
            currentUrl={lesson.video_url}
            onSuccess={(result) => {
              setShowUploader(false)
              onUploadSuccess(lesson.id, result.lesson)
            }}
          />
        </div>
      )}
    </li>
  )
}

// ── CourseRow ──────────────────────────────────────────────────────────────
function CourseRow({ course, onEdit, onDelete, onTogglePublish, onLessonsChanged }) {
  const [expanded, setExpanded] = useState(false)
  const [lessons, setLessons] = useState(null)
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [lessonErr, setLessonErr] = useState('')
  const [addingLesson, setAddingLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [deleteLessonTarget, setDeleteLessonTarget] = useState(null)
  const [savingLesson, setSavingLesson] = useState(false)
  const [showThumbUploader, setShowThumbUploader] = useState(false)
  const [removingThumb, setRemovingThumb] = useState(false)
  const [thumbErr, setThumbErr] = useState('')
  const [localCourse, setLocalCourse] = useState(course)

  useEffect(() => { setLocalCourse(course) }, [course])

  async function loadLessons() {
    if (lessons !== null) return
    setLessonsLoading(true)
    try {
      const data = await coursesApi.get(course.id)
      setLessons(data.lessons ?? [])
    } catch (err) {
      setLessonErr(err.message ?? 'Could not load lessons.')
    } finally {
      setLessonsLoading(false)
    }
  }

  function handleExpand() {
    setExpanded(v => !v)
    if (!expanded) loadLessons()
  }

  async function handleAddLesson(fields) {
    setSavingLesson(true)
    try {
      const res = await adminApi.createLesson(course.id, fields)
      setLessons(prev => [...(prev ?? []), res.lesson].sort((a, b) => a.position - b.position))
      setAddingLesson(false)
      onLessonsChanged?.()
    } catch (err) {
      setLessonErr(err.message ?? 'Could not create lesson.')
    } finally {
      setSavingLesson(false)
    }
  }

  async function handleEditLesson(fields) {
    if (!editingLesson) return
    setSavingLesson(true)
    try {
      const res = await adminApi.updateLesson(course.id, editingLesson.id, fields)
      setLessons(prev => prev.map(l => l.id === editingLesson.id ? res.lesson : l).sort((a, b) => a.position - b.position))
      setEditingLesson(null)
    } catch (err) {
      setLessonErr(err.message ?? 'Could not update lesson.')
    } finally {
      setSavingLesson(false)
    }
  }

  async function handleDeleteLesson() {
    if (!deleteLessonTarget) return
    try {
      await adminApi.deleteLesson(course.id, deleteLessonTarget.id)
      setLessons(prev => prev.filter(l => l.id !== deleteLessonTarget.id))
      onLessonsChanged?.()
    } catch (err) {
      setLessonErr(err.message ?? 'Could not delete lesson.')
    } finally {
      setDeleteLessonTarget(null)
    }
  }

  function handleVideoUploadSuccess(lessonId, updatedLesson) {
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...updatedLesson } : l))
  }

  function handleVideoRemoved(lessonId) {
    setLessons(prev => prev.map(l =>
      l.id === lessonId ? { ...l, video_url: null, video_public_id: null } : l
    ))
  }

  function handleThumbSuccess(result) {
    setShowThumbUploader(false)
    setLocalCourse(prev => ({ ...prev, thumbnail_url: result.course?.thumbnail_url ?? prev.thumbnail_url }))
  }

  async function handleRemoveThumb() {
    setRemovingThumb(true)
    setThumbErr('')
    try {
      await mediaApi.remove('thumbnail', course.id)
      setLocalCourse(prev => ({ ...prev, thumbnail_url: null, thumbnail_public_id: null }))
    } catch (err) {
      setThumbErr(err.message ?? 'Remove failed.')
    } finally {
      setRemovingThumb(false)
    }
  }

  const nextPosition = (lessons?.length ?? 0) + 1

  return (
    <li className="card overflow-hidden">
      {/* Course header row */}
      <div className="flex items-start gap-3 p-4">
        {/* Thumbnail */}
        <div className="w-20 h-14 rounded-lg bg-border/40 overflow-hidden flex-shrink-0">
          {localCourse.thumbnail_url
            ? <img src={localCourse.thumbnail_url} alt="" className="w-full h-full object-cover" aria-hidden="true" />
            : <div className="w-full h-full flex items-center justify-center text-warm-gray/40">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-semibold text-charcoal leading-snug">{localCourse.title}</p>
            <StatusBadge published={localCourse.published} />
          </div>
          <p className="text-xs text-warm-gray">{localCourse.category} · ETB {localCourse.price_etb ?? 0}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <button type="button" onClick={handleExpand}
            className="text-xs font-medium text-terracotta hover:text-terracotta-hover transition-colors">
            {expanded ? '▲ Collapse' : '▼ Manage'}
          </button>
          <button type="button" onClick={() => onEdit(localCourse)}
            className="text-xs font-medium text-warm-gray hover:text-charcoal transition-colors">
            Edit
          </button>
          <button type="button" onClick={() => onTogglePublish(localCourse)}
            className="text-xs font-medium text-warm-gray hover:text-charcoal transition-colors">
            {localCourse.published ? 'Unpublish' : 'Publish'}
          </button>
          <button type="button" onClick={() => onDelete(localCourse)}
            className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-border">

          {/* Thumbnail section */}
          <div className="px-4 py-3 bg-cream/50 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide">Course Thumbnail</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowThumbUploader(v => !v)}
                  className="text-xs font-medium text-terracotta hover:text-terracotta-hover transition-colors">
                  {localCourse.thumbnail_url ? 'Replace' : '+ Upload'}
                </button>
                {localCourse.thumbnail_url && (
                  <button type="button" onClick={handleRemoveThumb} disabled={removingThumb}
                    className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                    {removingThumb ? '…' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
            {thumbErr && <p className="text-xs text-red-600 mb-2">{thumbErr}</p>}
            {showThumbUploader && (
              <MediaUploader
                uploadType="thumbnail"
                recordId={course.id}
                currentUrl={localCourse.thumbnail_url}
                onSuccess={handleThumbSuccess}
              />
            )}
          </div>

          {/* Lessons section */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-warm-gray uppercase tracking-wide">
                Lessons {lessons && `(${lessons.length})`}
              </p>
              {!addingLesson && (
                <button type="button" onClick={() => setAddingLesson(true)}
                  className="text-xs font-semibold text-terracotta hover:text-terracotta-hover transition-colors">
                  + Add Lesson
                </button>
              )}
            </div>

            {lessonErr && (
              <p role="alert" className="text-xs text-red-600 mb-2">{lessonErr}</p>
            )}

            {/* Add lesson form */}
            {addingLesson && (
              <div className="mb-3 p-3 bg-white rounded-xl border border-border">
                <p className="text-xs font-semibold text-charcoal mb-2">New Lesson</p>
                <LessonForm
                  nextPosition={nextPosition}
                  onSave={handleAddLesson}
                  onCancel={() => setAddingLesson(false)}
                  saving={savingLesson}
                />
              </div>
            )}

            {/* Edit lesson form */}
            {editingLesson && (
              <div className="mb-3 p-3 bg-white rounded-xl border border-border">
                <p className="text-xs font-semibold text-charcoal mb-2">Edit Lesson</p>
                <LessonForm
                  initial={editingLesson}
                  onSave={handleEditLesson}
                  onCancel={() => setEditingLesson(null)}
                  saving={savingLesson}
                />
              </div>
            )}

            {lessonsLoading && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 rounded-full border-2 border-terracotta/30 border-t-terracotta animate-spin" />
              </div>
            )}

            {!lessonsLoading && lessons?.length === 0 && !addingLesson && (
              <p className="text-xs text-warm-gray py-2">No lessons yet. Add one above.</p>
            )}

            {lessons && lessons.length > 0 && (
              <ul className="border border-border rounded-xl overflow-hidden">
                {lessons.map(lesson => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    courseId={course.id}
                    onEdit={setEditingLesson}
                    onDelete={setDeleteLessonTarget}
                    onUploadSuccess={handleVideoUploadSuccess}
                    onRemoveVideo={handleVideoRemoved}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Delete lesson confirm */}
      {deleteLessonTarget && (
        <ConfirmDialog
          title="Delete lesson?"
          message={`"${deleteLessonTarget.title}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete Lesson"
          danger
          onConfirm={handleDeleteLesson}
          onCancel={() => setDeleteLessonTarget(null)}
        />
      )}
    </li>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const loadCourses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.listAllCourses()
      setCourses(res.courses ?? [])
    } catch (err) {
      setError(err.message ?? 'Could not load courses.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCourses() }, [loadCourses])

  // ── Create ────────────────────────────────────────────────────────────
  async function handleCreate(fields) {
    setSaving(true)
    try {
      const res = await adminApi.createCourse(fields)
      setCourses(prev => [res.course, ...prev])
      setCreating(false)
      setToast({ message: `"${res.course.title}" created.`, type: 'success' })
    } catch (err) {
      setToast({ message: err.message ?? 'Create failed.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────
  async function handleEdit(fields) {
    if (!editTarget) return
    setSaving(true)
    try {
      const res = await adminApi.updateCourse(editTarget.id, fields)
      setCourses(prev => prev.map(c => c.id === editTarget.id ? res.course : c))
      setEditTarget(null)
      setToast({ message: 'Course updated.', type: 'success' })
    } catch (err) {
      setToast({ message: err.message ?? 'Update failed.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle publish ────────────────────────────────────────────────────
  async function handleTogglePublish(course) {
    try {
      const res = await adminApi.publishCourse(course.id, !course.published)
      setCourses(prev => prev.map(c => c.id === course.id ? res.course : c))
      setToast({ message: res.message ?? 'Status updated.', type: 'success' })
    } catch (err) {
      setToast({ message: err.message ?? 'Could not update status.', type: 'error' })
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await adminApi.deleteCourse(deleteTarget.id)
      setCourses(prev => prev.filter(c => c.id !== deleteTarget.id))
      setToast({ message: `"${deleteTarget.title}" deleted.`, type: 'success' })
    } catch (err) {
      setToast({ message: err.message ?? 'Delete failed.', type: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <DashboardLayout title="Course Management" breadcrumb={breadcrumb}>

      <DashboardPageHeader
        title="Courses"
        subtitle={loading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} in the database`}
        action={
          !creating && (
            <button type="button" onClick={() => setCreating(true)}
              className="btn-primary text-sm py-2.5 px-5">
              + New Course
            </button>
          )
        }
      />

      {/* Create form */}
      {creating && (
        <div className="card p-5 mb-6">
          <p className="text-sm font-semibold text-charcoal mb-4">New Course</p>
          <CourseForm
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
            saving={saving}
          />
        </div>
      )}

      {/* Edit form */}
      {editTarget && (
        <div className="card p-5 mb-6">
          <p className="text-sm font-semibold text-charcoal mb-4">Edit: {editTarget.title}</p>
          <CourseForm
            initial={editTarget}
            onSave={handleEdit}
            onCancel={() => setEditTarget(null)}
            saving={saving}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="mb-5 flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <span>⚠️</span>
          <span>{error} <button onClick={loadCourses} className="underline font-semibold">Retry</button></span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-terracotta/30 border-t-terracotta animate-spin" role="status" aria-label="Loading courses" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card overflow-hidden">
          <DashboardEmptyState
            title="No courses yet"
            message="Create your first course using the button above."
          />
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {courses.map(course => (
            <CourseRow
              key={course.id}
              course={course}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onTogglePublish={handleTogglePublish}
              onLessonsChanged={loadCourses}
            />
          ))}
        </ul>
      )}

      {/* Delete course confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete course?"
          message={`"${deleteTarget.title}" and all its lessons will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete Course"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

    </DashboardLayout>
  )
}
