// Provider: Resend. Used when EMAIL_PROVIDER=resend (the default).
// Swap to smtp.ts (Workspace/Gmail SMTP) by setting EMAIL_PROVIDER=smtp —
// no other code needs to change, see lib/notifications/index.ts.

export async function sendViaResend(to: string, subject: string, body: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.NOTIFICATION_FROM_EMAIL || "I2I Portal <noreply@i2i-coep.org>",
      to,
      subject,
      text: body,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend send failed: ${err}`);
  }
}
