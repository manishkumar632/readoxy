require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailService() {
  console.log('\n🔍 Starting email service test...\n');
  
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Missing required environment variables:');
    console.error('Make sure EMAIL_USER and EMAIL_PASSWORD are set in your .env file');
    process.exit(1);
  }

  // Create test transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true,
    logger: true
  });

  try {
    console.log('📧 Testing email configuration...');
    console.log(`- Email: ${process.env.EMAIL_USER}`);
    console.log(`- Host: smtp.gmail.com`);
    console.log(`- Port: 587\n`);

    // Verify connection
    console.log('🔄 Verifying connection to SMTP server...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const result = await transporter.sendMail({
      from: `"Readoxy Quiz" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Readoxy Quiz',
      text: 'This is a test email from Readoxy Quiz application.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Readoxy Quiz Email Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <p>If you're seeing this, your email service is properly configured!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
            <p>Readoxy Quiz - Learn and grow every day</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📨 Message ID: ${result.messageId}\n`);
  } catch (error) {
    console.error('\n❌ Error occurred:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\n📝 Authentication Error:');
      console.error('1. Check that your Gmail App Password is correct');
      console.error('2. Verify 2-Step Verification is enabled');
      console.error('3. Make sure you\'re using an App Password, not your regular password');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.error('\n🌐 Network Error:');
      console.error('1. Check your internet connection');
      console.error('2. Try disabling firewall/antivirus temporarily');
      console.error('3. Test on a different network');
      console.error('4. Verify port 587 is not blocked');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🔌 Connection Error:');
      console.error('1. Verify SMTP settings (smtp.gmail.com:587)');
      console.error('2. Check if Gmail is accessible in your region');
      console.error('3. Try using a VPN if necessary');
    }
    
    process.exit(1);
  }
}

testEmailService(); 