import { Hero } from "@/components/landing/hero";
import { PortalSection } from "@/components/landing/portal-section";
import { StatCounter } from "@/components/landing/stat-counter";
import { Countdown } from "@/components/landing/countdown";
import { ReachNetwork } from "@/components/landing/reach-network";
import { PhaseJourney } from "@/components/landing/phase-journey";
import { CursorTrail } from "@/components/landing/cursor-trail";

export default function HomePage() {
  return (
    <main className="theme-ember flex-1">
      <CursorTrail />
      <Hero />

      <section className="border-y border-ember-line px-4 py-16">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
          <StatCounter value={800} suffix="+" label="Participants" />
          <StatCounter value={6} label="Sectors" />
          <StatCounter value={4} label="Phases" />
          <StatCounter value={1} label="Valedictory" />
        </div>
      </section>

      <PhaseJourney />

      <section className="border-y border-ember-line px-4 py-16">
        <Countdown />
      </section>

      <PortalSection />

      <ReachNetwork />

      <footer className="border-t border-ember-line px-4 py-8 text-center text-xs text-ember-muted">
        I2I — Ignited Innovators of India · Bhau Institute of Innovation, Entrepreneurship
        &amp; Leadership · COEP Technological University, Pune
      </footer>
    </main>
  );
}
