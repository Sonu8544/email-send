import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// Log environment variables (without sensitive data)
console.log("Environment check:");
console.log("SMTP_HOST:", process.env.SMTP_HOST || "not set");
console.log("SMTP_PORT:", process.env.SMTP_PORT || "not set");
console.log("SMTP_MAIL:", process.env.SMTP_MAIL ? "set" : "not set");
console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "set" : "not set");
console.log("SENDER_EMAIL:", process.env.SENDER_EMAIL || "not set");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure nodemailer transporter
// Trim values to handle spaces in .env file
const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const smtpPort = parseInt((process.env.SMTP_PORT || "465").trim());
const smtpMail = process.env.SMTP_MAIL ? process.env.SMTP_MAIL.trim() : null;
const smtpPassword = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.trim() : null;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: true, // true for 465, false for other ports
  auth: {
    user: smtpMail,
    pass: smtpPassword,
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

// Test endpoint to check server and email config
app.get("/test", (req, res) => {
  res.json({
    status: "Server is running",
    smtpConfigured: !!(smtpMail && smtpPassword),
    smtpHost: smtpHost,
    smtpPort: smtpPort,
  });
});

// Helper function to escape HTML
const escapeHtml = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Contact endpoint
app.post("/contact", async (req, res) => {
  try {
    console.log("Received contact form submission:", req.body);

    const {
      fullName,
      contactNumber,
      portfolioLink,
      education,
      noticePeriod,
      email,
      linkedinUrl,
      currentCTC,
      experience,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !contactNumber ||
      !education ||
      !noticePeriod ||
      !email ||
      !currentCTC ||
      !experience
    ) {
      console.log("Validation failed - missing required fields");
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check if SMTP credentials are configured
    if (!smtpMail || !smtpPassword) {
      console.error("SMTP credentials not configured");
      return res.status(500).json({
        success: false,
        message: "Email service not configured. Please contact administrator.",
      });
    }

    // Escape HTML to prevent XSS and template issues
    const safeFullName = escapeHtml(fullName);
    const safeContactNumber = escapeHtml(contactNumber);
    const safeEmail = escapeHtml(email);
    const safeEducation = escapeHtml(education);
    const safeExperience = escapeHtml(experience);
    const safeCurrentCTC = escapeHtml(currentCTC);
    const safeNoticePeriod = escapeHtml(noticePeriod);
    const safePortfolioLink = portfolioLink ? escapeHtml(portfolioLink) : "";
    const safeLinkedinUrl = linkedinUrl ? escapeHtml(linkedinUrl) : "";

    // Email options
    const recipientEmail = (process.env.SENDER_EMAIL || smtpMail).trim();
    const mailOptions = {
      from: smtpMail,
      to: recipientEmail,
      subject: `Application Form Submission from ${safeFullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">New Application Form Submission</h2>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color: #3b82f6; margin-top: 0;">Personal Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 40%;">Full Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${safeFullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Contact Number:</td>
                <td style="padding: 8px 0; color: #1f2937;">${safeContactNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email Address:</td>
                <td style="padding: 8px 0; color: #1f2937;">${safeEmail}</td>
              </tr>
              ${safePortfolioLink ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Portfolio/Resume Link:</td>
                <td style="padding: 8px 0; color: #1f2937;"><a href="${safePortfolioLink}" style="color: #3b82f6; text-decoration: none;">${safePortfolioLink}</a></td>
              </tr>
              ` : ''}
              ${safeLinkedinUrl ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">LinkedIn URL:</td>
                <td style="padding: 8px 0; color: #1f2937;"><a href="${safeLinkedinUrl}" style="color: #3b82f6; text-decoration: none;">${safeLinkedinUrl}</a></td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="color: #3b82f6; margin-top: 0;">Professional Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 40%;">Highest Education:</td>
                <td style="padding: 8px 0; color: #1f2937;">${safeEducation}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Experience:</td>
                <td style="padding: 8px 0; color: #1f2937;">${safeExperience}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Current CTC:</td>
                <td style="padding: 8px 0; color: #1f2937;">${safeCurrentCTC}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Notice Period:</td>
                <td style="padding: 8px 0; color: #1f2937;">${safeNoticePeriod}</td>
              </tr>
            </table>
          </div>
        </div>
      `,
      text: `
        New Application Form Submission
        
        Personal Information:
        Full Name: ${fullName}
        Contact Number: ${contactNumber}
        Email Address: ${email}
        ${portfolioLink ? `Portfolio/Resume Link: ${portfolioLink}` : ''}
        ${linkedinUrl ? `LinkedIn URL: ${linkedinUrl}` : ''}
        
        Professional Information:
        Highest Education: ${education}
        Experience: ${experience}
        Current CTC: ${currentCTC}
        Notice Period: ${noticePeriod}
      `,
    };

    console.log("Sending email to:", recipientEmail);
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error stack:", error.stack);
    
    // Provide more detailed error message
    let errorMessage = "Failed to send email";
    if (error.code === "EAUTH") {
      errorMessage = "Email authentication failed. Please check your SMTP credentials.";
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Could not connect to email server. Please check your SMTP settings.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
