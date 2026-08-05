import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/page-shell";

export default function LoginPage() {
  return (
    <PageShell theme="v0" className="flex flex-1 items-center justify-center px-4 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </PageShell>
  );
}
