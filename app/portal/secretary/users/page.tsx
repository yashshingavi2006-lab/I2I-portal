import { createClient } from "@/lib/supabase/server";
import { UsersAccessPanel } from "@/components/secretary/users-access-panel";

export default async function UsersAccessPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("id, full_name, email, role, head_title, is_active")
    .order("created_at", { ascending: false });

  return <UsersAccessPanel initialStaff={staff ?? []} currentUserId={user?.id ?? null} />;
}
