import dotenv from "dotenv";
import { Resend } from "resend";
dotenv.config();
// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email
const DEFAULT_FROM =
  process.env.DEFAULT_FROM_EMAIL || "birthday@yourdomain.com";

/**
 * Send a birthday email to a user
 * @param {Object} user - User object with email and username
 * @returns {Promise} - Email send result
 */
export const sendBirthdayEmail = async (user) => {
  try {
    console.log(`Sending birthday email to ${user.username} (${user.email})`);

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: user.email,
      subject: "Happy Birthday!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h1 style="color: #5c6ac4;">Happy Birthday, ${user.username}! 🎉</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Wishing you a fantastic birthday filled with joy and happiness!
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            May all your wishes come true today and always.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666; font-size: 14px;">
            Sent with ❤️ from Birthday Reminder App
          </div>
        </div>
      `,
    });

    console.log(`Email sent successfully to ${user.email}, ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error(
      `Failed to send birthday email to ${user.email}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Send a custom birthday email to a user
 * @param {Object} user - User object with email and username
 * @param {Object} options - Custom email options
 * @returns {Promise} - Email send result
 */
export const sendCustomBirthdayEmail = async (user, options = {}) => {
  try {
    const {
      subject = "Happy Birthday!",
      templateType = "default",
      customMessage = "",
    } = options;

    console.log(
      `Sending custom birthday email to ${user.username} (${user.email})`
    );

    // Select template based on templateType
    let htmlContent;

    if (templateType === "fancy") {
      htmlContent = getFancyTemplate(user.username, customMessage);
    } else if (templateType === "simple") {
      htmlContent = getSimpleTemplate(user.username, customMessage);
    } else {
      htmlContent = getDefaultTemplate(user.username, customMessage);
    }

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: user.email,
      subject: subject,
      html: htmlContent,
    });

    console.log(
      `Custom email sent successfully to ${user.email}, ID: ${data.id}`
    );
    return data;
  } catch (error) {
    console.error(
      `Failed to send custom birthday email to ${user.email}: ${error.message}`
    );
    throw error;
  }
};

// Template functions
const getDefaultTemplate = (username, customMessage) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h1 style="color: #5c6ac4;">Happy Birthday, ${username}! 🎉</h1>
      <p style="font-size: 16px; line-height: 1.5; color: #333;">
        Wishing you a fantastic birthday filled with joy and happiness!
      </p>
      ${
        customMessage
          ? `<p style="font-size: 16px; line-height: 1.5; color: #333;">${customMessage}</p>`
          : ""
      }
      <p style="font-size: 16px; line-height: 1.5; color: #333;">
        May all your wishes come true today and always.
      </p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666; font-size: 14px;">
        Sent with ❤️ from Birthday Reminder App
      </div>
    </div>
  `;
};

const getFancyTemplate = (username, customMessage) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 10px; background-color: #f9f9f9; background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4a6fa5; font-size: 32px; margin-bottom: 10px;">🎂 Happy Birthday, ${username}! 🎂</h1>
        <div style="font-size: 18px; color: #666;">It's your special day!</div>
      </div>
      
      <div style="background-color: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 20px;">
          On this wonderful day, we want to wish you the happiest of birthdays filled with love, laughter, and all the things that bring you joy!
        </p>
        
        ${
          customMessage
            ? `<p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 20px; border-left: 4px solid #4a6fa5; padding-left: 15px; font-style: italic;">${customMessage}</p>`
            : ""
        }
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 24px;">🎁 🎈 🎉 🥂 🎊</div>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
          May the year ahead bring you countless blessings, incredible adventures, and beautiful memories.
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <div style="margin-bottom: 10px;">With warmest wishes,</div>
        <div style="font-weight: bold; color: #4a6fa5;">Birthday Reminder App</div>
      </div>
    </div>
  `;
};

const getSimpleTemplate = (username, customMessage) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Happy Birthday ${username}!</h2>
      <p style="font-size: 16px; color: #333;">
        We hope you have a wonderful birthday today.
      </p>
      ${
        customMessage
          ? `<p style="font-size: 16px; color: #333;">${customMessage}</p>`
          : ""
      }
      <p style="font-size: 16px; color: #333; margin-top: 20px;">
        Best wishes,<br>
        Birthday Reminder App
      </p>
    </div>
  `;
};

export default { sendBirthdayEmail, sendCustomBirthdayEmail };
