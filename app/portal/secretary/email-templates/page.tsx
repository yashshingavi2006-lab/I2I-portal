import { createClient } from "@/lib/supabase/server";
import { EmailTemplatesPanel } from "@/components/secretary/email-templates-panel";

export default async function EmailTemplatesPage() {
  const supabase = await createClient();

  const { data: overrides } = await supabase
    .from("email_templates")
    .select("notification_type, subject, body, updated_at");

  return <EmailTemplatesPanel initialOverrides={overrides ?? []} />;
}
