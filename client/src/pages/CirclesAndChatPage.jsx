import { useState } from 'react'

// ── Mock data (unchanged) ────────────────────────────────────────────────────

const CLINICAL_CONTACTS = [
  { id: 1, name: 'Dr. Selamawit Tadesse', role: 'Child Neuropsychologist', preview: 'Dr. Selamawit: Here is the sensory …', time: '10:42 AM', unread: 2, online: true },
  { id: 2, name: 'Dr. Dawit Haile', role: 'Pediatrician & Feeding Specialist', preview: 'The dosage guide for the teething drop…', time: 'Yesterday', unread: 0, online: false },
]

const COMMUNITY_CIRCLES = [
  { id: 'c1', name: 'Toddler Years (1–4 Yrs)', members: '1.2k parents active', preview: 'Meron: Has anyone tried the 2-choice…', time: '4m', color: 'bg-terracotta/15 text-terracotta', initial: 'T' },
  { id: 'c2', name: "Fathers' Parenting Circle", members: '650 active dads', preview: 'Yonas: Organizing a weekend soccer g…', time: '15m', color: 'bg-sage/30 text-charcoal', initial: 'F' },
  { id: 'c3', name: 'School Readiness & Anxiety', members: '820 members · Counselors', preview: '', time: '2h', color: 'bg-blue-100 text-blue-700', initial: 'S' },
  { id: 'c4', name: 'Diaspora Ethiopian Families', members: '1.4k members · Multilingual', preview: '', time: '1d', color: 'bg-amber-100 text-amber-700', initial: 'D' },
]

const MESSAGES = [
  { id: 1, sender: 'system', text: 'Confidential & HIPAA-compliant telehealth consultation between Dr. Selamawit and Hanna G.', time: 'Today, November 14', isSystem: true },
  { id: 2, sender: 'dr', name: 'Dr. Selamawit', text: "Hello Hanna, wonderful to speak with you earlier today. Remember that resistance to putting shoes on at age 3 is developmental autonomy testing, not disrespect. Let's start with the visual cue card approach.", time: '10:38 AM', isSystem: false },
  { id: 3, sender: 'attachment', fileName: 'Toddler_Visual_Bedtime_Routine_Amharic_…', fileSize: '2.4 MB · Printable Visual Routine Guide', time: null, isSystem: false },
  { id: 4, sender: 'user', text: "Thank you so much Dr. Selamawit! We tried giving him the choice between the blue sneakers and the brown sandals and the shouting stopped completely! He even picked them up himself.", time: '10:41 AM', isSystem: false },
]

const CARE_PLAN = [
  { done: true, text: 'Offer 2 bounded morning choices (shoes & jacket).' },
  { done: true, text: 'Deploy visual routine poster 20 min before bedtime.' },
  { done: false, text: 'Log 3-day tantrum trigger log before Nov 21 session.' },
]

// ── Small helpers ────────────────────────────────────────────────────────────

function Avatar({ name, size = 9, color = 'bg-terracotta/10 text-terracotta' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className={`w-${size} h-${size} ${color} rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0`} aria-hidden="true">
      {initials}
    </div>
  )
}

function OnlineDot({ className = '' }) {
  return <span className={`w-2.5 h-2.5 rounded-full bg-sage border-2 border-white ${className}`} aria-label="Online" />
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CirclesAndChatPage() {
  const [activeContact, setActiveContact] = useState(CLINICAL_CONTACTS[0])
  const [activeTab, setActiveTab] = useState('1-on-1')  // '1-on-1' | 'circles'
  const [message, setMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctorOpen, setDoctorOpen] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  function sendMessage(e) {
    e.preventDefault()
    setMessage('')
  }

  return (
    <main id="main-content" tabIndex={-1} className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Thin status bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-5 py-2 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" aria-hidden="true" />
          <span className="text-xs text-warm-gray">Telehealth &amp; Parent Network · Session <span className="font-medium text-charcoal">#SD–8821</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-warm-gray">
            <svg className="w-3.5 h-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            HIPAA Protected
          </span>
          <button type="button" className="text-xs text-warm-gray hover:text-charcoal border border-border px-3 py-1 rounded-lg hover:bg-cream transition-colors">
            Schedule
          </button>
        </div>
      </div>

      {/* ── Three-column layout ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════════════ */}
        <aside
          className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-60 lg:w-64 bg-white border-r border-border flex-shrink-0`}
          aria-label="Conversations"
        >
          {/* Tab toggle */}
          <div className="p-3 border-b border-border">
            <div className="flex bg-cream rounded-xl p-1 gap-1">
              {[
                { id: '1-on-1', label: '1-on-1 Care' },
                { id: 'circles', label: 'Circles' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-charcoal shadow-sm' : 'text-warm-gray hover:text-charcoal'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-2.5 border-b border-border">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-gray/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="search"
                placeholder="Search…"
                className="w-full pl-9 pr-3 py-2 text-xs bg-cream border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-terracotta placeholder:text-warm-gray/60"
                aria-label="Search conversations"
              />
            </div>
          </div>

          {/* Lists */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === '1-on-1' ? (
              <>
                <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-warm-gray uppercase tracking-wider">Clinical Care</p>
                <ul role="list">
                  {CLINICAL_CONTACTS.map(c => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setActiveContact(c)}
                        className={`w-full text-left px-4 py-3 flex gap-3 transition-colors border-l-2 ${activeContact.id === c.id ? 'border-terracotta bg-terracotta/5' : 'border-transparent hover:bg-cream'
                          }`}
                        aria-current={activeContact.id === c.id ? 'true' : undefined}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar name={c.name} />
                          {c.online && <OnlineDot className="absolute -bottom-0.5 -right-0.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="text-xs font-semibold text-charcoal truncate">{c.name}</p>
                            <span className="text-[10px] text-warm-gray flex-shrink-0">{c.time}</span>
                          </div>
                          <p className="text-[11px] text-warm-gray truncate">{c.preview}</p>
                        </div>
                        {c.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5" aria-label={`${c.unread} unread`}>
                            {c.unread}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-warm-gray uppercase tracking-wider">Community Circles</p>
                <ul role="list">
                  {COMMUNITY_CIRCLES.map(circle => (
                    <li key={circle.id}>
                      <button type="button" className="w-full text-left px-4 py-3 flex gap-3 hover:bg-cream transition-colors">
                        <div className={`w-9 h-9 rounded-xl ${circle.color} font-bold text-xs flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                          {circle.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
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
              </>
            )}
          </div>

          {/* User bar */}
          <div className="border-t border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sage/20 text-sage font-bold text-xs flex items-center justify-center" aria-hidden="true">H</div>
              <span className="text-xs text-warm-gray font-medium">Hanna G.</span>
            </div>
            <button type="button" aria-label="Settings" className="text-warm-gray hover:text-charcoal transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ══ CENTRE: Chat ══════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 bg-cream">

          {/* Chat header */}
          <div className="bg-white border-b border-border px-5 py-3 flex items-center gap-3 flex-shrink-0">
            <button type="button" onClick={() => setSidebarOpen(o => !o)} className="md:hidden p-1.5 rounded-lg text-warm-gray hover:bg-cream" aria-label="Toggle sidebar">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="relative flex-shrink-0">
              <Avatar name={activeContact.name} size={10} />
              {activeContact.online && <OnlineDot className="absolute -bottom-0.5 -right-0.5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-charcoal">{activeContact.name}</h1>
                <svg className="w-3.5 h-3.5 text-sage flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified" role="img">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-warm-gray">{activeContact.online ? 'Online · Clinical Session Active' : activeContact.role}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button type="button" className="hidden sm:flex items-center gap-1.5 bg-terracotta text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-terracotta-hover transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Video Call
              </button>
              <button type="button" aria-label="Download notes" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              {/* Toggle doctor panel on lg screens */}
              <button type="button" onClick={() => setDoctorOpen(o => !o)} aria-label="Toggle doctor info" className="hidden xl:flex p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5" role="log" aria-label="Chat messages" aria-live="polite">
            {MESSAGES.map(msg => {
              if (msg.isSystem) return (
                <div key={msg.id} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-warm-gray bg-white border border-border px-4 py-1.5 rounded-full">{msg.time}</span>
                  <p className="text-xs text-warm-gray/60 text-center max-w-sm">{msg.text}</p>
                </div>
              )
              if (msg.sender === 'attachment') return (
                <div key={msg.id} className="flex justify-start">
                  <div className="bg-white border border-border rounded-2xl p-3.5 flex items-center gap-3 max-w-xs shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <svg className="w-5 h-5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-charcoal truncate">{msg.fileName}</p>
                      <p className="text-[11px] text-warm-gray mt-0.5">{msg.fileSize}</p>
                    </div>
                    <button type="button" className="text-xs font-semibold text-terracotta hover:underline flex-shrink-0" aria-label="Save file">↓</button>
                  </div>
                </div>
              )
              const isUser = msg.sender === 'user'
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                  {!isUser && <Avatar name={activeContact.name} size={8} />}
                  <div className={`max-w-xs sm:max-w-md flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser ? 'bg-terracotta text-white rounded-tr-sm' : 'bg-white border border-border text-charcoal rounded-tl-sm'
                      }`}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-warm-gray px-1">{msg.time}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Message input */}
          <div className="bg-white border-t border-border px-5 py-3 flex-shrink-0">
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <button type="button" aria-label="Attach file" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
              </button>
              <button type="button" aria-label="Voice message" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Message Dr. Selamawit…"
                  className="w-full px-4 py-2.5 pr-12 text-sm bg-cream border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta placeholder:text-warm-gray/60"
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-terracotta text-white rounded-lg flex items-center justify-center hover:bg-terracotta-hover transition-colors"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </form>
            <p className="text-[10px] text-warm-gray/50 mt-1.5 px-1">End-to-end encrypted · Private Family Room</p>
          </div>
        </div>

        {/* ══ RIGHT: Specialist panel (collapsible) ═════════════════════════════ */}
        {doctorOpen && (
          <aside className="hidden xl:flex flex-col w-60 bg-white border-l border-border flex-shrink-0 overflow-y-auto" aria-label="Session details">
            <div className="p-5 space-y-5">

              {/* Doctor card */}
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Avatar name={activeContact.name} size={14} color="bg-terracotta/10 text-terracotta" />
                </div>
                <h2 className="text-sm font-bold text-charcoal">{activeContact.name}</h2>
                <p className="text-xs text-terracotta font-medium mt-0.5">PhD, Pediatric Neuropsychology</p>
                <p className="text-xs text-warm-gray mt-2 leading-relaxed">Early childhood emotional regulation &amp; neurodivergence.</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sage bg-sage/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" aria-hidden="true" />
                  Accepting Questions
                </span>
              </div>

              <hr className="border-border" />

              {/* Next session */}
              <details open>
                <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
                  <span>Upcoming Session</span>
                  <svg className="w-3.5 h-3.5 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="bg-cream rounded-xl p-3 flex gap-3 items-start mb-2">
                  <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex flex-col items-center justify-center text-terracotta flex-shrink-0">
                    <span className="text-[9px] font-semibold uppercase leading-none">Thu</span>
                    <span className="text-lg font-bold leading-tight">21</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal">Thursday, Nov 21</p>
                    <p className="text-[11px] text-warm-gray">4:00 – 4:45 PM (EAT)</p>
                    <p className="text-[11px] text-sage mt-0.5">Video confirmed</p>
                  </div>
                </div>
                <button type="button" className="w-full text-xs font-medium text-warm-gray border border-border rounded-lg py-1.5 hover:bg-cream transition-colors">
                  Reschedule
                </button>
              </details>

              <hr className="border-border" />

              {/* Care plan */}
              <details open>
                <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
                  <span>Care Plan <span className="text-warm-gray font-normal normal-case">2/4</span></span>
                  <svg className="w-3.5 h-3.5 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <ul className="space-y-2.5" role="list">
                  {CARE_PLAN.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${item.done ? 'bg-sage border-sage' : 'border-border'}`} aria-hidden="true">
                        {item.done && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <p className={`text-xs leading-relaxed ${item.done ? 'text-warm-gray line-through' : 'text-charcoal'}`}>{item.text}</p>
                    </li>
                  ))}
                </ul>
              </details>

              <hr className="border-border" />

              {/* Memo */}
              <div>
                <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Specialist Memo</p>
                <p className="text-xs text-warm-gray italic leading-relaxed">"Hanna is making rapid progress recognizing early signs of overstimulation."</p>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ── Live audio banner (dismissible) ─────────────────────────────────── */}
      {!bannerDismissed && (
        <div className="bg-white border-t border-border px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg className="w-3.5 h-3.5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-charcoal truncate">Live circle: "Navigating Big Feelings Without Shouting" · Fri 7 PM</p>
            <p className="text-[11px] text-warm-gray truncate">Hosted by Dr. Selamawit &amp; the Toddler Circle</p>
          </div>
          <button type="button" className="flex-shrink-0 text-xs font-semibold border border-terracotta text-terracotta px-3 py-1.5 rounded-lg hover:bg-terracotta/5 transition-colors">
            RSVP
          </button>
          <button type="button" onClick={() => setBannerDismissed(true)} aria-label="Dismiss banner" className="p-1 text-warm-gray hover:text-charcoal transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

    </main>
  )
}
