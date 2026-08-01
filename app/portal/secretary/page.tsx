import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/portal-header";
import { PageShell } from "@/components/page-shell";
import { SecretarySidebar } from "@/components/secretary/sidebar-nav";
import { RegistrationQueue } from "@/components/secretary/registration-queue";

export default async function SecretaryPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!staff || staff.role !== "secretary") redirect("/dashboard");

  return (
    <PageShell particles={false} className="flex min-h-screen flex-col">
      <PortalHeader portalLabel="Secretary" name={staff.full_name} roleLabel="Master access" />
      <div className="flex flex-1">
        <SecretarySidebar />
        <main className="flex-1 px-6 py-8 sm:px-10">
          <RegistrationQueue />
        </main>
      </div>
    </PageShell>
  );
}
