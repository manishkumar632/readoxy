const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Explicitly define host
  port: 587, // Change port to 587
  secure: false, // Use STARTTLS (not SSL)
  auth: {
    user: "terabhaiheckerhai@gmail.com",
    pass: "ivuo nqmf pdoc nryz", // Make sure this is an App Password, NOT your Gmail password
  },
  tls: {
    rejectUnauthorized: false, // Bypass SSL/TLS errors
  },
});

transporter.sendMail({
  from: "terabhaiheckerhai@gmail.com",
  to: "manishmu632@gmail.com",
  subject: "Test Email",
  text: "Hello, this is a test email!",
}, (error, info) => {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});