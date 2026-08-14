import { NextRequest, NextResponse } from "next/server";
import { sendViaSmtp } from "@/lib/notifications/providers/email-smtp";

const RECIPIENT = "i2i.coeptech.2026@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body.message ?? "").trim();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!message) {
      return NextResponse.json({ error: "Write your query before submitting." }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Query is too long (max 5000 characters)." }, { status: 400 });
    }

    const subject = `I2I query from registration page${name ? ` — ${name}` : ""}`;
    const text = [name && `Name: ${name}`, email && `Reply to: ${email}`, "", message]
      .filter(Boolean)
      .join("\n");

    await sendViaSmtp(RECIPIENT, subject, text);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Raise query failed:", e);
    return NextResponse.json(
      { error: "Couldn't send your query right now. Try again in a moment." },
      { status: 500 }
    );
  }
}
