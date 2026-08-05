// Provider: Meta WhatsApp Cloud API. Free tier: 1,000 conversations/month.
// Requires a WhatsApp Business account + phone number set up in Meta's
// developer console (developers.facebook.com/apps -> WhatsApp product).
// Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in your environment.

export async function sendViaWhatsApp(toPhone: string, message: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  // Meta requires E.164 format without a leading '+' (e.g. 919876543210)
  const formattedPhone = toPhone.replace(/[^0-9]/g, "");

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: { body: message },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp send failed: ${err}`);
  }
}
