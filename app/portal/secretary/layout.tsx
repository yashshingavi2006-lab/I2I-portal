import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { SecretarySidebar } from "@/components/secretary-sidebar";

export default async function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!staff || staff.role !== "secretary") redirect("/dashboard");

  return (
    <PageShell particles={false} theme="v0" scene3d className="flex min-h-screen">
      <SecretarySidebar name={staff.full_name} email={staff.email} />
      <main className="min-w-0 flex-1 px-6 py-8 sm:px-10">{children}</main>
    </PageShell>
  );
}
