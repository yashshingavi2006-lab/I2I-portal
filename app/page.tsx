import { SmoothScroll } from '@/components/smooth-scroll'
import { Spotlight } from '@/components/spotlight'
import { Navbar } from '@/components/navbar'
import { IntroSplash } from '@/components/intro-splash'
import { ScrollProgress } from '@/components/scroll-progress'
import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { Reach } from '@/components/sections/reach'
import { Journey } from '@/components/sections/journey'
import { Awards } from '@/components/sections/awards'
import { Portals } from '@/components/sections/portals'
import { Statistics } from '@/components/sections/statistics'
import { Startups } from '@/components/sections/startups'
import { Mentors } from '@/components/sections/mentors'
import { AnnualTimeline } from '@/components/sections/annual-timeline'
import { Testimonials } from '@/components/sections/testimonials'
import { Sponsors } from '@/components/sections/sponsors'
import { Footer } from '@/components/sections/footer'

export default function Page() {
  return (
    <div className="theme-v0">
      <IntroSplash />
      <ScrollProgress />
      <SmoothScroll>
        <Spotlight />
        <Navbar />
        <main className="relative overflow-x-clip bg-background text-foreground">
          <Hero />
          <About />
          <Reach />
          <Journey />
          <Awards />
          <Portals />
          <Statistics />
          <Startups />
          <Mentors />
          <AnnualTimeline />
          <Testimonials />
          <Sponsors />
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  )
}
