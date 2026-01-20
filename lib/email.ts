import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface SendRegistrationEmailParams {
  to: string;
  fullName: string;
  qrCode: string;
  qrCodeDataUrl: string;
  registrationId: string;
  qid: string;
  ageGroup: string;
}

export async function sendRegistrationEmail({
  to,
  fullName,
  qrCode,
  qrCodeDataUrl,
  registrationId,
  qid,
  ageGroup,
}: SendRegistrationEmailParams) {
  const resend = getResend();

  if (!resend) {
    console.warn("Email service not configured - skipping email send");
    return null;
  }

  const maskedQid = `${qid.slice(0, 3)}-XXXX-${qid.slice(7)}`;

  const ageGroupLabels: Record<string, string> = {
    KIDS: "Kids (Under 12)",
    YOUTH: "Youth (12-17)",
    ADULT: "Adult (18-45)",
    SENIOR: "Senior (45+)",
  };

  // Extract base64 data from data URL
  const base64Data = qrCodeDataUrl.split(",")[1];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background-color: #E60000; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Sports Village 2026</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">National Sport Day</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #E60000; margin: 0 0 20px 0; font-size: 22px;">Registration Confirmed!</h2>

              <p style="color: #4A4D4E; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>${fullName}</strong>,
              </p>

              <p style="color: #4A4D4E; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for registering for the Sports Village event. Your registration has been confirmed. Please present the QR code below at the event entrance for quick check-in.
              </p>

              <!-- QR Code -->
              <div style="text-align: center; margin: 30px 0; padding: 30px; background-color: #f9f9f9; border-radius: 12px;">
                <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 4px solid #E60000; border-radius: 8px;" />
                <p style="color: #E60000; font-weight: bold; margin: 15px 0 0 0; font-size: 18px;">${qrCode}</p>
              </div>

              <!-- Event Details -->
              <div style="background-color: #f0f0f0; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #E60000; margin: 0 0 15px 0; font-size: 16px;">Event Details</h3>
                <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; color: #4A4D4E; width: 100px;"><strong>Event:</strong></td>
                    <td style="padding: 8px 0; color: #4A4D4E;">Sports Village - National Sport Day 2026</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4A4D4E;"><strong>Date:</strong></td>
                    <td style="padding: 8px 0; color: #4A4D4E;">Tuesday, 10 February 2026</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4A4D4E;"><strong>Time:</strong></td>
                    <td style="padding: 8px 0; color: #4A4D4E;">7:30 AM - 4:30 PM</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4A4D4E;"><strong>Location:</strong></td>
                    <td style="padding: 8px 0; color: #4A4D4E;"><a href="https://share.google/wSJgqfIyYScjsx5uo" style="color: #E60000; text-decoration: underline;">Downtown Msheireb, Barahat Msheireb</a></td>
                  </tr>
                </table>
              </div>

              <!-- Registration Details -->
              <div style="border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #4A4D4E; margin: 0 0 15px 0; font-size: 14px;">Your Registration Details</h3>
                <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;">Registration Code:</td>
                    <td style="padding: 5px 0; color: #4A4D4E; font-size: 14px; font-weight: bold;">${qrCode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;">QID:</td>
                    <td style="padding: 5px 0; color: #4A4D4E; font-size: 14px;">${maskedQid}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666; font-size: 14px;">Age Group:</td>
                    <td style="padding: 5px 0; color: #4A4D4E; font-size: 14px;">${ageGroupLabels[ageGroup] || ageGroup}</td>
                  </tr>
                </table>
              </div>

              <!-- Instructions -->
              <div style="background-color: #fff8f8; border-left: 4px solid #E60000; padding: 15px 20px; margin: 30px 0;">
                <p style="color: #4A4D4E; margin: 0; line-height: 1.6; font-size: 14px;">
                  <strong>Important:</strong> Please bring this QR code (printed or on your phone) to the event for quick check-in at the entrance.
                </p>
              </div>

              <p style="color: #4A4D4E; line-height: 1.6; margin: 30px 0 0 0; font-size: 14px;">
                We look forward to seeing you at the event!
              </p>

              <p style="color: #4A4D4E; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                Best regards,<br/>
                <strong style="color: #E60000;">Vodafone Qatar</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #4A4D4E; padding: 25px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 12px; opacity: 0.8;">
                © 2026 Vodafone Qatar. All rights reserved.
              </p>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 12px; opacity: 0.6;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    console.log(`[Email] Attempting to send email to: ${to}`);
    console.log(`[Email] From: ${process.env.EMAIL_FROM || "Sports Village <noreply@vodafone.qa>"}`);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Sports Village <noreply@vodafone.qa>",
      to: [to],
      subject: "Your Sports Village 2026 Registration is Confirmed!",
      html: htmlContent,
      attachments: [
        {
          filename: "qrcode.png",
          content: Buffer.from(base64Data, "base64"),
          content_type: "image/png",
        },
      ],
      headers: {
        "X-Entity-Ref-ID": registrationId,
      },
    });

    if (error) {
      console.error("[Email] Failed to send email:", error);
      throw error;
    }

    console.log("[Email] Successfully sent! ID:", data?.id);
    return data;
  } catch (error) {
    console.error("[Email] Sending error:", error);
    throw error;
  }
}
