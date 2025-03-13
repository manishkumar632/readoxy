const nodemailer = require("nodemailer");
require("dotenv").config();

// Debug logging for configuration
console.log("Email Service Configuration:");
console.log(`- Host: smtp.gmail.com`);
console.log(`- Port: 587`);
console.log(`- User: ${process.env.EMAIL_USER}`);

// Create reusable transporter
const createTransporter = () => {
  console.log("Creating transporter with user:", process.env.EMAIL_USER);
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content
 * @returns {Promise} - Nodemailer send result
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Validate recipient email
    if (!to) {
      throw new Error("Recipient email is required");
    }

    const transporter = createTransporter();

    // Convert html content to string if it's an object
    const html =
      typeof htmlContent === "object" ? htmlContent.html : htmlContent;

    const mailOptions = {
      from: {
        name: "Readoxy",
        address: process.env.EMAIL_USER,
      },
      to,
      subject,
      html,
      text: "Please use an HTML-capable email client to view this message.",
    };

    console.log("Sending email to:", to);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email send error details:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Send quiz code to user
 * @param {string} email - User email
 * @param {string} username - User's name (optional)
 * @param {string} quizCode - The quiz code
 * @param {Date} expiresAt - When the code expires (optional)
 * @returns {Promise} - Email send result
 */
const sendQuizCode = async (
  email,
  username = "",
  quizCode,
  expiresAt = null
) => {
  const expiryText = expiresAt
    ? `This code will expire on ${new Date(expiresAt).toLocaleString()}.`
    : "This code is valid for 24 hours.";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4F46E5;">Your Quiz Code</h2>
      <p>Hello ${username || "there"},</p>
      <p>Here is your quiz code:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
        ${quizCode}
      </div>
      <p>${expiryText}</p>
      <p>Good luck with your quiz!</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
  `;

  return sendEmail(email, "Your Readoxy Quiz Code", html);
};

/**
 * Send welcome email to new user
 * @param {string} email - User email
 * @param {string} username - User's name
 * @returns {Promise} - Email send result
 */
const sendWelcomeEmail = async (email, username) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4F46E5;">Welcome to Readoxy!</h2>
      <p>Hello ${username},</p>
      <p>Thank you for joining Readoxy! We're excited to have you as part of our community.</p>
      <p>With your new account, you can:</p>
      <ul>
        <li>Take quizzes to test your knowledge</li>
        <li>Track your progress and scores</li>
        <li>Compete with others on the leaderboard</li>
      </ul>
      <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
      <p>Happy learning!</p>
      <p>The Readoxy Team</p>
    </div>
  `;

  return sendEmail(email, "Welcome to Readoxy!", html);
};

// For backward compatibility
const sendEmailNew = sendEmail;
const sendQuizCodeNew = (email, quizCode) => sendQuizCode(email, "", quizCode);
const sendWelcomeEmailNew = sendWelcomeEmail;

module.exports = {
  sendEmail,
  sendQuizCode,
  sendWelcomeEmail,
  // For backward compatibility
  sendEmailNew,
  sendQuizCodeNew,
  sendWelcomeEmailNew,
};
