const getPasswordUpdateTemplate = (code) => ({
  subject: "Verify Password Change Request - Readoxy",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Change Verification</h2>
      <p>Your verification code for password change is:</p>
      <h1 style="color: #4F46E5; letter-spacing: 4px; text-align: center;">${code}</h1>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request this change, please ignore this email.</p>
    </div>
  `,
});

const getEmailUpdateTemplate = (code) => ({
  subject: "Verify Email Change Request - Readoxy",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Change Verification</h2>
      <p>Your verification code for email change is:</p>
      <h1 style="color: #4F46E5; letter-spacing: 4px; text-align: center;">${code}</h1>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request this change, please ignore this email.</p>
    </div>
  `,
});

const getPasswordResetTemplate = (resetLink) => ({
  subject: "Reset Your Password - Readoxy",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `,
});

module.exports = {
  getPasswordUpdateTemplate,
  getEmailUpdateTemplate,
  getPasswordResetTemplate,
};
