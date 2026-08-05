import type { Metadata } from 'next'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Spotlight } from '@/components/spotlight'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/sections/footer'
import { Section, SectionHeader } from '@/components/section'

export const metadata: Metadata = {
  title: 'Guidelines & Policies — I2I',
}

const REIMBURSEMENT_RULES = [
  'Ignited Innovators of India is a techno-social initiative under COEP Technological University and, with the help of Eaton India Foundation, has extended funding support to shortlisted participants.',
  'Ignited Innovators of India assumes no responsibility for claims related to funding and support in instances where oral agreements or improperly documented records are involved.',
  'Ignited Innovators of India would only reimburse amounts that are billed on GST or have a tax invoice dated in the financial year 2025–2026.',
  'In case of non-GST bills, only up to ₹1,000 is permitted by the government, and such bills would be sent to a higher authority whose decision would be final.',
  'If a project misuses the amount reimbursed, the team would be solely responsible, and that team would be debarred from any further opportunities.',
  'The project team leader and members should be residents of India and strictly a student at a registered institution in India.',
  'A minimum of 2 members and a maximum of 3 members can register as a project team; failure to comply may result in project disqualification.',
  'Teams must submit three quotations for each required item/service before making any purchase.',
  'All bills or quotations must be submitted before the official deadline. Late submissions will not be accepted.',
]

export default function GuidelinesPage() {
  return (
    <div className="theme-v0">
      <SmoothScroll>
        <Spotlight />
        <Navbar />
        <main className="relative overflow-x-clip bg-background text-foreground">
          <Section id="guidelines" className="!pt-40">
            <SectionHeader
              eyebrow="Guidelines & Policies"
              title="Reimbursement Procedure Policy"
              description="The rules governing funding, billing, and reimbursement for every I2I project team."
            />

            <div className="glass mt-14 rounded-2xl p-6 sm:p-10">
              <ol className="flex flex-col gap-5">
                {REIMBURSEMENT_RULES.map((rule, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/12 font-mono text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {rule}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </Section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  )
}
