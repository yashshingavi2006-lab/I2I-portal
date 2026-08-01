// Central place for all notification copy. Keep this the ONLY place wording
// lives, so changing a message doesn't mean hunting through trigger logic.

type Payload = Record<string, unknown>;

export function emailTemplate(type: string, payload: Payload): { subject: string; body: string } {
  switch (type) {
    case "leader_invite":
      return {
        subject: "Welcome to I2I — set your portal password",
        body: `Your team has been registered for I2I 2026-27. Click the link in this email to set your password and access the portal.`,
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
    default:
      return "You have a new update on the I2I portal.";
  }
}
