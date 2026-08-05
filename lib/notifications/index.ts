import type { SupabaseClient } from "@supabase/supabase-js";
import { sendViaResend } from "./providers/email-resend";
import { sendViaSmtp } from "./providers/email-smtp";
import { sendViaWhatsApp } from "./providers/whatsapp";
import { emailTemplate, renderCustomTemplate, whatsappTemplate } from "./templates";

type QueueItem = {
  id: string;
  type: string;
  channel: "email" | "whatsapp";
  recipient_email: string | null;
  recipient_phone: string | null;
  payload: Record<string, unknown>;
};

// admin is optional so existing callers/tests that don't need DB-editable
// templates still work — without it, dispatch just falls back to the
// hardcoded defaults in templates.ts.
export async function dispatchNotification(item: QueueItem, admin?: SupabaseClient): Promise<void> {
  if (item.channel === "email") {
    if (!item.recipient_email) throw new Error("Missing recipient_email");

    let subject: string, body: string;
    const override = admin
      ? (
          await admin
            .from("email_templates")
            .select("subject, body")
            .eq("notification_type", item.type)
            .maybeSingle()
        ).data
      : null;

    if (override) {
      const payloadWithSiteUrl = { site_url: process.env.NEXT_PUBLIC_SITE_URL, ...item.payload };
      ({ subject, body } = renderCustomTemplate(override.subject, override.body, payloadWithSiteUrl));
    } else {
      ({ subject, body } = emailTemplate(item.type, item.payload));
    }

    const provider = process.env.EMAIL_PROVIDER || "resend";
    if (provider === "smtp") {
      await sendViaSmtp(item.recipient_email, subject, body);
    } else {
      await sendViaResend(item.recipient_email, subject, body);
    }
    return;
  }

  if (item.channel === "whatsapp") {
    if (!item.recipient_phone) throw new Error("Missing recipient_phone");
    const message = whatsappTemplate(item.type, item.payload);
    await sendViaWhatsApp(item.recipient_phone, message);
    return;
  }

  throw new Error(`Unknown channel: ${item.channel}`);
}
