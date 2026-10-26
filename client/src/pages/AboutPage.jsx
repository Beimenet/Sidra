import { Link } from 'react-router-dom'
import aboutPic from '../assets/about pic.PNG'

// ── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '4,200+', label: 'Families Served', icon: '👨‍👩‍👧' },
  { value: '24', label: 'Countries Reached', icon: '🌍' },
  { value: '120k+', label: 'Weekly Sessions', icon: '📅' },
  { value: '24/7', label: 'Expert-Led Support', icon: '💬' },
]

const PILLARS = [
  {
    num: '01',
    color: 'terracotta',
    title: 'Culturally Grounded',
    desc: 'Every resource, guide, and professional on Sidra is selected for their deep understanding of Ethiopian family culture, language, and traditions.',
    link: 'Explore Professionals →',
    href: '/professionals',
  },
  {
    num: '02',
    color: 'sage',
    title: 'Science-Led Guidance',
    desc: 'Our content is developed by licensed child development specialists and reviewed against the latest international pediatric research standards.',
    link: 'Browse Our Courses →',
    href: '/courses',
  },
  {
    num: '03',
    color: 'terracotta',
    title: 'Community at the Centre',
    desc: 'Sidra brings parents together in peer circles, guided discussion groups, and live audio events hosted by practicing specialists.',
    link: 'Join a Circle →',
    href: '/circles',
  },
  {
    num: '04',
    color: 'sage',
    title: 'Accessible & Affordable',
    desc: 'We believe every Ethiopian family deserves access to quality child development support — regardless of location or income.',
    link: 'View Pricing →',
    href: '/courses',
  },
]

const TEAM = [
  {
    name: 'Dr. Selamawit Tadesse, PhD',
    role: 'Lead Child Psychologist & Clinical Strategist',
    bio: 'Specialist in emotional regulation, neurodivergence, and culturally responsive parenting frameworks.',
    initials: 'ST',
  },
  {
    name: 'Dr. Dawit Haile, MD',
    role: 'Pediatrician & Developmental Medicine Lead',
    bio: 'Pioneering pediatric healthcare for Ethiopian children through preventive care and family-centred clinical education.',
    initials: 'DH',
  },
  {
    name: 'Bethlehem Tadesse, MSW',
    role: 'Community Engagement & Family Therapist',
    bio: 'Licensed systemic family therapist supporting community resilience through culturally-grounded and intersectional practice.',
    initials: 'BT',
  },
  {
    name: 'Yohannes Bekele, MSc',
    role: 'Curriculum Architect & Adolescent Coach',
    bio: 'Expert in transformative learning frameworks for adolescent development and purpose-driven parent coaching across the diaspora.',
    initials: 'YB',
  },
]

const GUARANTEES = [
  { icon: '🔒', title: 'HIPAA-Compliant Platform', desc: 'All clinical consultations, session notes, and family data are encrypted and stored in compliance with health privacy standards.' },
  { icon: '✅', title: 'Ministry-Certified Professionals', desc: 'Every professional is verified through the Ethiopian Ministry of Health and holds active licensure in their field.' },
  { icon: '💳', title: 'Full Session Guarantee', desc: 'Not satisfied after your first consultation? We offer a 100% money-back guarantee — no questions asked.' },
  { icon: '🌐', title: 'Bilingual & Inclusive', desc: 'Resources, guides, and professionals available in Amharic, English, Oromo, and Tigrinya to serve every Ethiopian family.' },
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function TeamCard({ member }) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="w-20 h-20 rounded-2xl bg-terracotta/10 text-terracotta font-bold text-xl flex items-center justify-center" aria-hidden="true">
        {member.initials}
      </div>
      <div>
        <h3 className="text-sm font-bold text-charcoal leading-snug">{member.name}</h3>
        <p className="text-xs text-terracotta font-medium mt-0.5">{member.role}</p>
      </div>
      <p className="text-xs text-warm-gray leading-relaxed">{member.bio}</p>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-cream border-b border-border" aria-labelledby="about-heading">
        <div className="section-container py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-warm-gray mb-5">
                <Link to="/" className="hover:text-terracotta transition-colors">Home</Link>
                <svg className="w-3.5 h-3.5 text-warm-gray/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-charcoal font-medium">About Sidra</span>
              </nav>

              <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
              <h1
                id="about-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal leading-tight"
              >
                Rooted in Culture,{' '}
                <span className="text-terracotta italic">Guided by Science.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-warm-gray leading-relaxed">
                Sidra was born from the profound belief that families at home and across the diaspora
                deserve accessible, culturally grounded, and evidence-based parenting guidance for
                every season of childhood.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/professionals" className="btn-primary">
                  Meet Our Specialists
                </Link>
                <Link to="/courses" className="btn-secondary">
                  Explore Learning
                </Link>
              </div>
            </div>

            {/* Right — stat grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Hero image */}
              <div className="col-span-2 relative rounded-2xl overflow-hidden aspect-video">
                <img
                  src={aboutPic}
                  alt="Ethiopian family together — Sidra guidance for every family"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" aria-hidden="true" />
                <p className="absolute bottom-0 left-0 right-0 p-5 text-white text-sm font-semibold leading-snug max-w-sm">
                  Bridging the generations and wisdom of wise elders with evidence-based science.
                </p>
              </div>

              {STATS.map((s) => (
                <div key={s.label} className="card p-5 text-center">
                  <p className="text-2xl font-bold text-charcoal">{s.value}</p>
                  <p className="text-xs text-warm-gray mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What is Sidra? ─────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border" aria-labelledby="what-heading">
        <div className="section-container">
          <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">What is Sidra?</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Sidra meaning */}
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-charcoal">ስድ—ራ</span>
                <span className="tag">Amharic Origin</span>
              </div>
              <p className="text-warm-gray text-sm leading-relaxed mb-4">
                For generations, the word "Sidra/ስድራ" meant an extended community of trust — the village
                that raised the child. For parents who feel isolated or overwhelmed by the weight of the
                parenting journey, Sidra rebuilds the same community in a modern, accessible, and
                multilingual context.
              </p>
              <p className="text-warm-gray text-sm leading-relaxed">
                Find experts on Sidra and the professionals that the Sidra platform trusts. <strong className="text-charcoal">Visit Monthly</strong> to stay
                connected with globally grounded child development knowledge, practitioner articles,
                community guides, and digital classrooms.
              </p>
            </div>

            {/* The Sidra Promise */}
            <div className="card p-6">
              <h3 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-terracotta/10 flex items-center justify-center text-sm" aria-hidden="true">✨</span>
                The Sidra Two-Charge
              </h3>
              <p className="text-sm text-warm-gray mb-4">
                "We believe a parenting village, calling you, and guiding your plan and
                centering our traditional Ethiopian family, always remains."
              </p>
              <ul className="space-y-2 text-sm text-warm-gray">
                {[
                  'Showing parents alternative viewpoints',
                  'Proven clinically-grounded resources',
                  'Giving parents a global community of peers',
                  'Leading parents by transparent accountability',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-border grid grid-cols-3 gap-3 text-center text-xs text-warm-gray">
                <div><p className="font-bold text-charcoal text-base">18+</p><p>Courses</p></div>
                <div><p className="font-bold text-charcoal text-base">24</p><p>Countries</p></div>
                <div><p className="font-bold text-charcoal text-base">100%</p><p>PhD Moderated</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Four Pillars ───────────────────────────────────────────────────── */}
      <section className="bg-cream py-16 border-b border-border" aria-labelledby="pillars-heading">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-2">Our Framework</p>
              <h2 id="pillars-heading" className="text-2xl sm:text-3xl font-bold text-charcoal">
                Four Pillars of Thoughtful Guidance
              </h2>
            </div>
            <p className="text-sm text-warm-gray max-w-sm">
              These principles guide every decision we make — from the professionals we vet
              to the content we publish.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((p) => (
              <div key={p.num} className="card p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.color === 'terracotta' ? 'bg-terracotta/10 text-terracotta' : 'bg-sage/20 text-charcoal'}`}>
                    {p.num}
                  </span>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${p.color === 'terracotta' ? 'text-terracotta' : 'text-sage'}`}>
                    {p.color === 'terracotta' ? 'CORE BELIEF' : 'OUR METHOD'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-charcoal leading-snug">{p.title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed flex-1">{p.desc}</p>
                <Link to={p.href} className="text-xs font-semibold text-terracotta hover:underline">
                  {p.link}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership & Advisory Council ──────────────────────────────────── */}
      <section className="py-16 border-b border-border" aria-labelledby="team-heading">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-2">Who We Are</p>
              <h2 id="team-heading" className="text-2xl sm:text-3xl font-bold text-charcoal">
                Leadership &amp; Advisory Council
              </h2>
            </div>
            <p className="text-sm text-warm-gray max-w-sm">
              Our team of clinicians and educators are practitioners — not just advisors.
              They work with families on Sidra every week.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((m) => <TeamCard key={m.name} member={m} />)}
          </div>
        </div>
      </section>

      {/* ── Clinical & Ethical Guarantee ───────────────────────────────────── */}
      <section className="bg-charcoal py-16 border-b border-border" aria-labelledby="guarantee-heading">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-terracotta flex items-center justify-center" aria-hidden="true">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </span>
                <span className="text-terracotta text-sm font-semibold uppercase tracking-widest">Our Promise</span>
              </div>
              <h2 id="guarantee-heading" className="text-2xl sm:text-3xl font-bold text-white">
                Our Clinical &amp; Ethical Guarantee
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <span className="text-2xl mb-3 block" aria-hidden="true">{g.icon}</span>
                <h3 className="text-sm font-bold text-white mb-2">{g.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join CTA ───────────────────────────────────────────────────────── */}
      <section className="py-16 bg-cream" aria-labelledby="join-heading">
        <div className="section-container text-center max-w-2xl mx-auto">
          <p className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3">Get Started</p>
          <h2 id="join-heading" className="text-2xl sm:text-3xl font-bold text-charcoal mb-4">
            Join the Sidra Family Today
          </h2>
          <p className="text-warm-gray text-sm leading-relaxed mb-8">
            Thousands of Ethiopian families trust Sidra for specialist-led guidance in
            child development. Equip your parenting journey with evidence-based learning above.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary">
              Get Started for Free →
            </Link>
            <Link to="/professionals" className="btn-secondary">
              Explore the Professionals
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
