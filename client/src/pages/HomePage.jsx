import Hero from '../components/home/Hero.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import FeaturedCourses from '../components/home/FeaturedCourses.jsx'
import ProfessionalPreview from '../components/home/ProfessionalPreview.jsx'
import CallToAction from '../components/home/CallToAction.jsx'

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <HowItWorks />
      <FeaturedCourses />
      <ProfessionalPreview />
      <CallToAction />
    </main>
  )
}
