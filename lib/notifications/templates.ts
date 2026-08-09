// Central place for all notification copy. Keep this the ONLY place wording
// lives, so changing a message doesn't mean hunting through trigger logic.

type Payload = Record<string, unknown>;

export function emailTemplate(type: string, payload: Payload): { subject: string; body: string } {
  switch (type) {
    case "registration_confirmed":
      // NOTE: this includes the plaintext password in the email body, per
      // explicit product decision (avoid any dependency on the participant
      // receiving/clicking an email to access their portal). This is a
      // known security tradeoff — anyone with access to this inbox later
      // (or a compromised mail account) also gets portal access. If you
      // revisit this, the safer version omits payload.login_password and
      // just confirms the login email, since the participant already set
      // the password themselves during registration and should remember it.
      return {
        subject: `Registration confirmed — ${payload.project_code}`,
        body: `Your team's registration for I2I 2026-27 is confirmed.\n\nProject code: ${payload.project_code}\nTeam: ${payload.team_name}\n\nYour portal login:\nEmail: ${payload.login_email}\nPassword: ${payload.login_password}\n\nLog in at: ${process.env.NEXT_PUBLIC_SITE_URL}/login?portal=participant\n\nKeep this email for your records. We recommend changing your password after your first login.`,
      };
    case "leader_invite":
      return {
        subject: "Welcome to I2I — set your portal password",
        body: `Your team has been registered for I2I 2026-27.\n\nProject code: ${payload.project_code}\nTeam: ${payload.team_name}\n\nClick this link to set your password and access the portal:\n${payload.link}\n\nThis link is valid for a limited time — if it expires, use "Forgot password" on the login page.`,
      };
    case "phase2_shortlisted":
      return {
        subject: `Your project ${payload.project_code} has been shortlisted for Phase 2`,
        body: `Congratulations! ${payload.team_name} (${payload.project_code}) has been shortlisted. Log in to the I2I portal to complete your Phase 2 submission — bills, pitch details, and bank information.`,
      };
    case "mentor_assigned":
      return {
        subject: `You've been assigned as mentor for ${payload.project_code}`,
        body: `Hi ${payload.staff_name}, you've been assigned as mentor for project ${payload.project_code} — "${payload.team_name}". Log in to the portal to view the project details.`,
      };
    case "ambassador_assigned":
      return {
        subject: `You've been assigned as ambassador for ${payload.project_code}`,
        body: `Hi ${payload.staff_name}, you've been assigned as ambassador for project ${payload.project_code} — "${payload.team_name}". Log in to the portal to view the project details.`,
      };
    case "funding_status_update":
      return {
        subject: `Funding update for ${payload.project_code}`,
        body: `Your funding request status for ${payload.project_code} is now: ${payload.status}.${
          payload.amount_approved ? ` Approved amount: ₹${payload.amount_approved}.` : ""
        }`,
      };
    case "phase3_shortlisted":
      return {
        subject: `🎉 ${payload.project_code} has been selected for Phase 3!`,
        body: `Congratulations! ${payload.team_name} (${payload.project_code}) has been selected for Phase 3 — Development. Log in to the I2I portal to see your assigned mentor and ambassador, and start logging your daily progress.`,
      };
    default:
      return { subject: "I2I Portal Update", body: "You have a new update on the I2I portal." };
  }
}

export function whatsappTemplate(type: string, payload: Payload): string {
  switch (type) {
    case "team_notified_of_mentor":
      return `Your ${payload.role} for project ${payload.project_code} is ${payload.staff_name}. Log in to the I2I portal for details.`;
    case "phase2_shortlisted":
      return `Congrats! Your project ${payload.project_code} has been shortlisted for Phase 2. Log in to the I2I portal to continue.`;
    case "phase3_shortlisted":
      return `🎉 Your project ${payload.project_code} has been selected for Phase 3! Log in to the I2I portal to see your mentor and ambassador.`;
    default:
      return "You have a new update on the I2I portal.";
  }
}
