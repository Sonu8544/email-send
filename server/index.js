import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Test transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log("Error with email configuration:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World from server");
});

// Contact endpoint
app.post("/contact", async (req, res) => {
  try {
    const { name, contact, message } = req.body;

    // Validate required fields
    if (!name || !contact || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, contact, and message",
      });
    }

    // Email options
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: process.env.SENDER_EMAIL || process.env.SMTP_MAIL, // Send to configured recipient email
      subject: `Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      text: `
        New Contact Form Submission
        Name: ${name}
        Contact: ${contact}
        Message: ${message}
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
