const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendRegistrationEmail = async ({ to, name, eventTitle, eventDate, venue, qrImage }) => {
  try {
    await resend.emails.send({
      from: 'EventEntrance <onboarding@resend.dev>',
      to,
      subject: `Registration Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2>You're registered! 🎉</h2>
          <p>Hi ${name},</p>
          <p>Your registration for <strong>${eventTitle}</strong> is confirmed.</p>
          <p><strong>Date:</strong> ${new Date(eventDate).toDateString()}<br/>
          <strong>Venue:</strong> ${venue}</p>
          <p>Show this QR code at the entrance for check-in:</p>
          <img src="${qrImage}" alt="QR Code" style="width:200px;height:200px;" />
          <p style="color:#888;font-size:12px;">EventEntrance — QR-based attendance system</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

module.exports = sendRegistrationEmail;