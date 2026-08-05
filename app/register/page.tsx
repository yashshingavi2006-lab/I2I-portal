import { RegistrationWizard } from "@/components/registration-wizard";
import { PageShell } from "@/components/page-shell";

export default function RegisterPage() {
  return (
    <PageShell particles={false} theme="v0" className="flex-1 px-4 py-12 sm:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-marigold">
          I2I 2026-27 Registrations
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          Register your project
        </h1>
        <p className="mt-3 text-sm text-muted">
          Ignited Innovators of India — Bhau Institute, COEP Technological University
        </p>
      </div>
      <RegistrationWizard />
    </PageShell>
  );
}
