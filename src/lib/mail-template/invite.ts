const BRAND = {
  normalBlue: "#0891a6",
  darker: "#03333a",
  mutedText: "#8892a3",
  lightBg: "#f3f5f8",
  lightBlue: "#e6f4f6",
  lightText: "#ffffff",
  border: "#e5e7eb",
} as const;

const DEFAULT_PLATFORM_NAME = "Neptune EHSS";
const DEFAULT_SENDER_EMAIL = "Notification@neptune-ehss.com";
const DEFAULT_EXPIRATION_DAYS = 7;

export type InviteEmailTemplateData = Readonly<{
  recipientName: string;
  recipientEmail: string;
  inviterName: string;
  organizationName: string;
  roleName: string;
  setupUrl: string;
  expirationDays?: number;
  platformName?: string;
  senderEmail?: string;
}>;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveInviteEmailData(data: InviteEmailTemplateData) {
  return {
    recipientName: escapeHtml(data.recipientName.trim() || "there"),
    recipientEmail: escapeHtml(data.recipientEmail.trim()),
    inviterName: escapeHtml(data.inviterName.trim()),
    organizationName: escapeHtml(data.organizationName.trim()),
    roleName: escapeHtml(data.roleName.trim()),
    setupUrl: escapeHtml(data.setupUrl.trim()),
    expirationDays: data.expirationDays ?? DEFAULT_EXPIRATION_DAYS,
    platformName: escapeHtml(data.platformName?.trim() || DEFAULT_PLATFORM_NAME),
    senderEmail: escapeHtml(data.senderEmail?.trim() || DEFAULT_SENDER_EMAIL),
  };
}

export function getInviteEmailSubject(data: InviteEmailTemplateData) {
  const organizationName = data.organizationName.trim() || "your workspace";
  const platformName = data.platformName?.trim() || DEFAULT_PLATFORM_NAME;

  return `You're invited to join ${organizationName} on ${platformName}`;
}

export function renderInviteEmailText(data: InviteEmailTemplateData) {
  const resolved = resolveInviteEmailData(data);

  return [
    `You're invited to join ${resolved.organizationName} on ${resolved.platformName}`,
    "",
    `Hi ${resolved.recipientName},`,
    "",
    `${resolved.inviterName} has invited you to ${resolved.organizationName}'s safety workspace. You've been added as ${resolved.roleName} on ${resolved.organizationName}'s ${resolved.platformName} workspace.`,
    "",
    `${resolved.roleName} - ${resolved.organizationName}`,
    `Invited by ${resolved.inviterName}`,
    "",
    "Click below to set up your account — you'll manage incidents, run investigations and own compliance across your sites.",
    "",
    resolved.setupUrl,
    "",
    `This invite was sent to ${resolved.recipientEmail} and expires in ${resolved.expirationDays} days. If you weren't expecting it, you can ignore this email.`,
  ].join("\n");
}

function renderShieldIcon() {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td
          width="40"
          height="40"
          align="center"
          valign="middle"
          style="width:40px;height:40px;background-color:${BRAND.normalBlue};border-radius:10px;"
        >
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3Cpath d='m9 12 2 2 4-4'/%3E%3C/svg%3E"
            width="22"
            height="22"
            alt=""
            style="display:block;border:0;outline:none;"
          />
        </td>
      </tr>
    </table>
  `;
}

export function renderInviteEmailHtml(data: InviteEmailTemplateData) {
  const resolved = resolveInviteEmailData(data);
  const roleHeading = `${resolved.roleName} - ${resolved.organizationName}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(getInviteEmailSubject(data))}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BRAND.lightBg};font-family:Inter,Arial,Helvetica,sans-serif;color:${BRAND.darker};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:linear-gradient(135deg,#f8fafb 0%,#eef7f8 45%,#f3f5f8 100%);">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="max-width:640px;width:100%;background-color:${BRAND.lightText};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(3,51,58,0.08);"
          >
            <tr>
              <td style="padding:32px 32px 24px;background:linear-gradient(180deg,#f8fcfd 0%,#ffffff 100%);">
                <h1 style="margin:0 0 24px;font-size:28px;line-height:1.25;font-weight:700;color:${BRAND.darker};">
                  You&rsquo;re invited to join ${resolved.organizationName} on ${resolved.platformName}
                </h1>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle" style="padding-right:12px;">
                      ${renderShieldIcon()}
                    </td>
                    <td valign="middle">
                      <p style="margin:0;font-size:16px;line-height:1.3;font-weight:700;color:${BRAND.darker};">
                        ${resolved.platformName}
                      </p>
                      <p style="margin:4px 0 0;font-size:14px;line-height:1.4;color:${BRAND.mutedText};">
                        ${resolved.senderEmail}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 32px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.darker};">
                  Hi ${resolved.recipientName}
                </p>

                <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:${BRAND.darker};">
                  ${resolved.inviterName} has invited you to ${resolved.organizationName}&rsquo;s safety workspace.
                  You&rsquo;ve been added as ${resolved.roleName} on ${resolved.organizationName}&rsquo;s
                  ${resolved.platformName} workspace.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding:0 0 28px;">
                      <p style="margin:0 0 6px;font-size:18px;line-height:1.4;font-weight:700;color:${BRAND.darker};">
                        ${roleHeading}
                      </p>
                      <p style="margin:0;font-size:14px;line-height:1.5;color:${BRAND.mutedText};">
                        Invited by ${resolved.inviterName}
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:${BRAND.darker};">
                  Click below to set up your account &mdash; you&rsquo;ll manage incidents, run investigations
                  and own compliance across your sites.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding:0 0 32px;">
                      <a
                        href="${resolved.setupUrl}"
                        style="display:inline-block;padding:14px 28px;background-color:${BRAND.normalBlue};color:${BRAND.lightText};font-size:16px;line-height:1.2;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 10px 24px rgba(8,145,166,0.28);"
                      >
                        Accept Invitation &amp; Set up
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0;font-size:14px;line-height:1.7;color:${BRAND.mutedText};">
                  This invite was sent to ${resolved.recipientEmail} and expires in ${resolved.expirationDays} days.
                  If you weren&rsquo;t expecting it, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
