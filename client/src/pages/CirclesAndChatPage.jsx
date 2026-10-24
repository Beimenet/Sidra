import { useState } from 'react'
import { Link } from 'react-router-dom'

// ── Mock data ────────────────────────────────────────────────────────────────

const CLINICAL_CONTACTS = [
  {
    id: 1,
    name: 'Dr. Selamawit Tadesse',
    role: 'Child Neuropsychologist',
    preview: 'Dr. Selamawit: Here is the sensory …',
    time: '10:42 AM',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Dr. Dawit Haile',
    role: 'Pediatrician & Feeding Specialist',
    preview: 'The dosage guide for the teething drop…',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
]

const COMMUNITY_CIRCLES = [
  { id: 'c1', name: 'Toddler Years (1–4 Yrs)', members: '1.2k parents active', preview: 'Meron: Has anyone tried the 2-choice…', time: '4m ago', color: 'bg-terracotta/20 text-terracotta', initial: 'T' },
  { id: 'c2', name: "Fathers' Parenting Circle", members: '650 active dads', preview: 'Yonas: Organizing a weekend soccer g…', time: '15m ago', color: 'bg-sage/30 text-charcoal', initial: 'F' },
  { id: 'c3', name: 'School Readiness & Anxiety', members: '820 members · Led by Counselors', preview: '', time: '2h ago', color: 'bg-blue-100 text-blue-700', initial: 'S' },
  { id: 'c4', name: 'Diaspora Ethiopian Families', members: '1.4k members · Multilingual focus', preview: '', time: '1d ago', color: 'bg-amber-100 text-amber-700', initial: 'D' },
]

const MESSAGES = [
  {
    id: 1,
    sender: 'system',
    text: 'Confidential & HIPAA-compliant telehealth consultation between Dr. Selamawit and Hanna G.',
    time: 'Today, November 14',
    isSystem: true,
  },
  {
    id: 2,
    sender: 'dr',
    name: 'Dr. Selamawit',
    text: 'Hello Hanna, wonderful to speak with you earlier today. Remember that resistance to putting shoes on at age 3 is developmental autonomy testing, not disrespect. Let\'s start with the visual cue card approach.',
    time: '10:38 AM · Dr. Selamawit',
    isSystem: false,
    highlight: false,
  },
  {
    id: 3,
    sender: 'attachment',
    fileName: 'Toddler_Visual_Bedtime_Routine_Amharic_…',
    fileSize: '2.4 MB · Printable Visual Routine Guide',
    time: null,
    isSystem: false,
    highlight: false,
  },
  {
    id: 4,
    sender: 'user',
    text: "Thank you so much Dr. Selamawit! We tried giving him the choice between the blue sneakers and the brown sandals and the shouting stopped completely! He even picked them up himself.",
    time: '10:41 AM',
    isSystem: false,
    highlight: true,
  },
]

const CARE_PLAN = [
  { done: true, text: 'Offer 2 bounded morning choices (shoes & jacket).' },
  { done: true, text: 'Deploy visual routine poster 20 min before bedtime.' },
  { done: false, text: 'Log 3-day tantrum trigger log before Nov 21 session.' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function InitialsAvatar({ name, size = 'sm', color = 'bg-terracotta/10 text-terracotta' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-xs'
  return (
    <div className={`${sizeClass} ${color} rounded-full font-bold flex items-center justify-center flex-shrink-0`} aria-hidden="true">
      {initials}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CirclesAndChatPage() {
  const [activeContact, setActiveContact] = useState(CLINICAL_CONTACTS[0])
  const [activeTab, setActiveTab] = useState('1-on-1') // '1-on-1' | 'circles'
  const [message, setMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <main id="main-content" tabIndex={-1} className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Top status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-4 py-2 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sage animate-pulse" aria-hidden="true" />
          <span className="text-xs font-semibold text-charcoal">Telehealth &amp; Parent Network</span>
          <span className="text-xs text-warm-gray">Session ID #SD–8821</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-warm-gray">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            End-to-End HIPAA &amp; Clinical Guard Protected
          </span>
          <button type="button" className="flex items-center gap-1 border border-border px-3 py-1 rounded-lg hover:bg-cream transition-colors font-medium text-charcoal">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Schedule
          </button>
        </div>
      </div>

      {/* ── Three-column layout ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-64 xl:w-72 bg-white border-r border-border flex-shrink-0 overflow-y-auto`} aria-label="Conversations">

          {/* Tab toggle */}
          <div className="p-3 border-b border-border flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('1-on-1')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === '1-on-1' ? 'bg-terracotta text-white' : 'text-warm-gray hover:bg-cream'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              1-on-1 Care
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('circles')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'circles' ? 'bg-terracotta text-white' : 'text-warm-gray hover:bg-cream'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              Parent Circles
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-gray/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Search chats, specialists…"
                className="w-full pl-9 pr-3 py-2 text-xs bg-cream border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-terracotta placeholder:text-warm-gray/60"
                aria-label="Search conversations"
              />
            </div>
          </div>

          {/* Contact list */}
          {activeTab === '1-on-1' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 py-2 flex items-center justify-between">
                <p className="text-[11px] font-bold text-warm-gray uppercase tracking-wider">Clinical Care ({CLINICAL_CONTACTS.length})</p>
                <span className="text-[11px] font-semibold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">Direct Access</span>
              </div>
              <ul role="list">
                {CLINICAL_CONTACTS.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActiveContact(c)}
                      className={`w-full text-left px-3 py-3 flex gap-3 hover:bg-cream transition-colors border-l-2 ${activeContact.id === c.id ? 'border-terracotta bg-terracotta/5' : 'border-transparent'}`}
                      aria-current={activeContact.id === c.id ? 'true' : undefined}
                    >
                      <div className="relative flex-shrink-0">
                        <InitialsAvatar name={c.name} />
                        {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-sage border-2 border-white" aria-label="Online" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-charcoal truncate">{c.name}</p>
                          <span className="text-[10px] text-warm-gray flex-shrink-0">{c.time}</span>
                        </div>
                        <p className="text-[11px] text-warm-gray truncate">{c.role}</p>
                        <p className="text-[11px] text-warm-gray/70 truncate">{c.preview}</p>
                      </div>
                      {c.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5" aria-label={`${c.unread} unread messages`}>
                          {c.unread}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 py-2 flex items-center justify-between">
                <p className="text-[11px] font-bold text-warm-gray uppercase tracking-wider">Community Circles ({COMMUNITY_CIRCLES.length})</p>
                <svg className="w-4 h-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <ul role="list">
                {COMMUNITY_CIRCLES.map((circle) => (
                  <li key={circle.id}>
                    <button type="button" className="w-full text-left px-3 py-3 flex gap-3 hover:bg-cream transition-colors">
                      <div className={`w-8 h-8 rounded-full ${circle.color} font-bold text-xs flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                        {circle.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-charcoal truncate">{circle.name}</p>
                          <span className="text-[10px] text-warm-gray flex-shrink-0">{circle.time}</span>
                        </div>
                        <p className="text-[11px] text-warm-gray truncate">{circle.members}</p>
                        {circle.preview && <p className="text-[11px] text-warm-gray/70 truncate">{circle.preview}</p>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom user bar */}
          <div className="border-t border-border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sage/20 text-sage font-bold text-xs flex items-center justify-center" aria-hidden="true">H</div>
              <span className="text-xs text-warm-gray font-medium">Hanna G. (Parent)</span>
            </div>
            <button type="button" aria-label="Settings" className="text-warm-gray hover:text-charcoal">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ── CENTRE: Chat panel ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-cream">

          {/* Chat header */}
          <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button type="button" onClick={() => setSidebarOpen((o) => !o)} className="md:hidden p-1.5 rounded-lg text-warm-gray hover:bg-cream" aria-label="Toggle sidebar">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="relative flex-shrink-0">
              <InitialsAvatar name={activeContact.name} size="lg" />
              {activeContact.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-sage border-2 border-white" aria-label="Online" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-charcoal">{activeContact.name}</h1>
                <svg className="w-4 h-4 text-sage" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified" role="img">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" aria-hidden="true" />
                <span className="text-xs text-warm-gray">Online · Clinical Session Active · 45-min Behavioral Follow-Up</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center gap-2 bg-terracotta text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-terracotta-hover transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Start Video Call
              </button>
              <button type="button" aria-label="Share screen" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
                </svg>
              </button>
              <button type="button" aria-label="Download notes" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
            {MESSAGES.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="text-center">
                    <span className="text-xs text-warm-gray bg-white border border-border px-4 py-1.5 rounded-full inline-block">
                      {msg.time}
                    </span>
                    <p className="text-xs text-warm-gray/70 mt-1">{msg.text}</p>
                  </div>
                )
              }
              if (msg.sender === 'attachment') {
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="card p-3 flex items-center gap-3 max-w-xs">
                      <div className="w-9 h-9 rounded-lg bg-terracotta/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <svg className="w-5 h-5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-charcoal truncate">{msg.fileName}</p>
                        <p className="text-[11px] text-warm-gray">{msg.fileSize}</p>
                      </div>
                      <button type="button" className="text-xs font-semibold text-terracotta hover:underline flex-shrink-0" aria-label="Save file">
                        ↓ Save
                      </button>
                    </div>
                  </div>
                )
              }
              const isUser = msg.sender === 'user'
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                  {!isUser && <InitialsAvatar name={activeContact.name} />}
                  <div className={`max-w-xs sm:max-w-md ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-terracotta text-white rounded-tr-sm'
                        : 'bg-white border border-border text-charcoal rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-warm-gray px-1">{msg.time}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-border p-3">
            <div className="relative flex items-center gap-2">
              <button type="button" aria-label="Attach file" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
              </button>
              <button type="button" aria-label="Voice message" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setMessage('') } }}
                  placeholder="Type your message or share an update with Dr."
                  className="w-full px-4 py-2.5 pr-12 text-sm bg-cream border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta placeholder:text-warm-gray/60"
                  aria-label="Message input"
                />
                <button
                  type="button"
                  onClick={() => setMessage('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-terracotta text-white rounded-lg flex items-center justify-center hover:bg-terracotta-hover transition-colors"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-warm-gray/60 mt-1 px-1">
              Press Return to send · Shift + Return for new line · <span className="text-warm-gray/50">Private Family Room</span>
            </p>
          </div>
        </div>

        {/* ── RIGHT: Specialist info + care plan ────────────────────────────── */}
        <aside className="hidden xl:flex flex-col w-64 bg-white border-l border-border flex-shrink-0 overflow-y-auto" aria-label="Session details">
          <div className="p-4 space-y-5">
            {/* Specialist card */}
            <div className="text-center">
              <InitialsAvatar name={activeContact.name} size="lg" color="bg-terracotta/10 text-terracotta" />
              <h2 className="text-sm font-bold text-charcoal mt-3">{activeContact.name}</h2>
              <p className="text-xs text-terracotta font-medium mt-0.5">PhD, Pediatric Neuropsychology</p>
              <p className="text-xs text-warm-gray mt-1 leading-relaxed">Specializing in early childhood emotional regulation, neurodivergence, and family connection.</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sage bg-sage/10 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" aria-hidden="true" />
                Accepting Follow-up Questions
              </span>
            </div>

            <hr className="border-border" />

            {/* Upcoming session */}
            <div>
              <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                Upcoming Session
              </p>
              <div className="card p-3 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex flex-col items-center justify-center text-terracotta flex-shrink-0">
                  <span className="text-[10px] font-semibold uppercase">Thu</span>
                  <span className="text-lg font-bold leading-none">21</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-charcoal">Thursday, Nov 21</p>
                  <p className="text-[11px] text-warm-gray">4:00 PM – 4:45 PM (EAT)</p>
                  <p className="text-[11px] text-sage mt-0.5">Video link confirmed</p>
                </div>
              </div>
              <button type="button" className="mt-2 w-full text-xs font-medium text-warm-gray border border-border rounded-lg py-2 hover:bg-cream transition-colors">
                Reschedule or Add to Cal
              </button>
            </div>

            <hr className="border-border" />

            {/* Care plan */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-charcoal uppercase tracking-wider">Care Plan Focus</p>
                <span className="text-[11px] font-semibold text-warm-gray bg-cream px-2 py-0.5 rounded-full">Stage 2/4</span>
              </div>
              <ul className="space-y-2.5" role="list">
                {CARE_PLAN.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${item.done ? 'bg-sage border-sage' : 'border-border'}`} aria-hidden="true">
                      {item.done && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                    <p className={`text-xs leading-relaxed ${item.done ? 'text-warm-gray line-through' : 'text-charcoal'}`}>{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-border" />

            {/* Specialist memo */}
            <div>
              <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Specialist Memo</p>
              <p className="text-xs text-warm-gray italic leading-relaxed">
                "Hanna is making rapid progress recognizing early signs of overstimulation."
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Live audio circle banner ─────────────────────────────────────────── */}
      <div className="bg-white border-t border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg className="w-4 h-4 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-charcoal truncate">
            Join this week's live audio circle: "Navigating Big Feelings Without Shouting"
          </p>
          <p className="text-[11px] text-warm-gray">
            Hosted by Dr. Selamawit &amp; fellow parents in the Toddler Circle · Friday at 7:00 PM
          </p>
        </div>
        <button type="button" className="flex-shrink-0 text-xs font-semibold border border-terracotta text-terracotta px-3 py-1.5 rounded-lg hover:bg-terracotta/5 transition-colors whitespace-nowrap">
          RSVP for Audio Circle
        </button>
      </div>

    </main>
  )
}
