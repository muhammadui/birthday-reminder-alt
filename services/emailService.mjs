import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(
  process.env.RESEND_API_KEY || "re_EknxDYq3_KoWAx1etkF99pvtWGBeNozmc"
);

// Function to send birthday email
export const sendBirthdayEmail = async (user) => {
  try {
    const { email, username } = user;

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "birthday@yourbusiness.com",
      to: email,
      subject: `Happy Birthday, ${username}!`,
      html: getBirthdayEmailTemplate(username),
    });

    console.log(`Birthday email sent to ${username} (${email})`);
    return data;
  } catch (error) {
    console.error(`Failed to send birthday email: ${error.message}`);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Email template for birthday wishes
const getBirthdayEmailTemplate = (username) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 10px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #6a1b9a;
          color: white;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          background-color: white;
          border-radius: 0 0 8px 8px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #777;
        }
        h1 {
          color: #6a1b9a;
        }
        .cake {
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Happy Birthday! 🎉</h1>
        </div>
        <div class="content">
          <p>Dear ${username},</p>
          <p>We wanted to take a moment to wish you a very happy birthday! 🎂</p>
          
          <div class="cake">🎂</div>
          
          <p>Thank you for being a valued customer. As a token of our appreciation, we're offering you a special birthday discount on your next purchase!</p>
          
          <p>We hope your day is filled with joy, laughter, and wonderful memories.</p>
          
          <p>Best wishes,</p>
          <p>The Team at Your Business</p>
        </div>
        <div class="footer">
          <p>This email was sent as part of our birthday celebration program.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
