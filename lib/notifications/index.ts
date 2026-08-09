import { sendViaResend } from "./providers/email-resend";
import { sendViaSmtp } from "./providers/email-smtp";
import { sendViaWhatsApp } from "./providers/whatsapp";
import { emailTemplate, whatsappTemplate } from "./templates";

type QueueItem = {
  id: string;
  type: string;
  channel: "email" | "whatsapp";
  recipient_email: string | null;
  recipient_phone: string | null;
  payload: Record<string, unknown>;
};

export async function dispatchNotification(item: QueueItem): Promise<void> {
  if (item.channel === "email") {
    if (!item.recipient_email) throw new Error("Missing recipient_email");
    const { subject, body } = emailTemplate(item.type, item.payload);
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
