import type { Metadata } from 'next'
import { MapPin, Phone, Mail } from 'lucide-react'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Spotlight } from '@/components/spotlight'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/sections/footer'
import { Section, SectionHeader } from '@/components/section'
import { RaiseQueryBox } from '@/components/raise-query-box'

export const metadata: Metadata = {
  title: 'Contact — I2I',
}

// Institutional contact details only — sourced from i2i.org.in/contact-us
// and bhau.org/contact, plus current committee phone numbers confirmed
// directly by the site owner.
type ContactDetail = {
  icon: typeof MapPin
  label: string
  value?: string
  href?: string
  contacts?: { name: string; number: string }[]
}

const DETAILS: ContactDetail[] = [
  {
    icon: MapPin,
    label: 'Address',
    value: "Bhau Institute, Beside COEP Boat Club, College of Engineering Pune Technological University, Shivajinagar, Pune, Maharashtra 411005",
  },
  {
    icon: Phone,
    label: 'Phone',
    contacts: [
      { name: 'Aditya Kasod', number: '9766820696' },
      { name: 'Vikas Kamble', number: '7350742541' },
    ],
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'i2i.coeptech.2026@gmail.com',
    href: 'mailto:i2i.coeptech.2026@gmail.com',
  },
]

export default function ContactPage() {
  return (
    <div className="theme-v0">
      <SmoothScroll>
        <Spotlight />
        <Navbar />
        <main className="relative overflow-x-clip bg-background text-foreground">
          <Section id="contact" className="!pt-40">
            <SectionHeader
              eyebrow="Contact Us"
              title="Get in touch with i2i"
              description="Reach the Bhau Institute team behind Ignited Innovators of India — in person, by phone, or by email."
            />

            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              <div className="glass flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
                {DETAILS.map((d) => (
                  <div key={d.label} className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
                      <d.icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {d.label}
                      </p>
                      {d.contacts ? (
                        <div className="mt-1 space-y-0.5">
                          {d.contacts.map((c) => (
                            <a
                              key={c.number}
                              href={`tel:+91${c.number}`}
                              className="block text-sm font-medium text-foreground hover:text-primary"
                            >
                              {c.name} — {c.number}
                            </a>
                          ))}
                        </div>
                      ) : d.href ? (
                        <a href={d.href} className="mt-1 block text-sm font-medium text-foreground hover:text-primary">
                          {d.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">{d.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-border">
                <iframe
                  title="Bhau Institute, COEP Technological University location"
                  src="https://maps.google.com/maps?q=Bhau%20Institute%2C%20COEP%20Technological%20University%2C%20Shivajinagar%2C%20Pune&output=embed"
                  className="h-full min-h-[320px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="mt-8">
              <RaiseQueryBox />
            </div>
          </Section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  )
}
