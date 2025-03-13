require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSendGridEmail() {
  try {
    console.log('Testing SendGrid email service...');
    console.log(`Using email: ${process.env.EMAIL_USER}`);
    
    // Create a SendGrid transporter
    // Note: You need to set SENDGRID_API_KEY in your .env file
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey', // This is literally the string 'apikey'
        pass: process.env.SENDGRID_API_KEY // Your SendGrid API Key
      }
    });
    
    // Send a test email
    const result = await transporter.sendMail({
      from: `"Readoxy Quiz" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email from Readoxy Quiz (SendGrid)',
      text: 'This is a test email from Readoxy Quiz application using SendGrid.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Readoxy Quiz Email Test (SendGrid)</h2>
          <p>This is a test email to verify that your SendGrid email configuration is working correctly.</p>
          <p>If you're seeing this, your email service is properly configured!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
            <p>Readoxy Quiz - Learn and grow every day</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully using SendGrid!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Error sending email with SendGrid:', error);
    
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set in your .env file.');
      console.error('To use SendGrid:');
      console.error('1. Sign up for a free account at https://sendgrid.com/');
      console.error('2. Create an API key in your SendGrid dashboard');
      console.error('3. Add SENDGRID_API_KEY=your_api_key to your .env file');
    } else {
      console.error('Check your SendGrid API key and configuration.');
    }
    
    process.exit(1);
  }
}

testSendGridEmail(); 