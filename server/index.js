import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(cors({
  origin: ["https://email-send-three.vercel.app", "https://wellnessextract.com", "https://wellnessextract.in"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "resume-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

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

// Contact endpoint with error handling for multer
app.post("/contact", (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size too large. Maximum size is 5MB.",
          });
        }
        return res.status(400).json({
          success: false,
          message: "File upload error: " + err.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    next();
  });
}, async (req, res) => {
  let resumePath = null;
  
  try {
    console.log("=== Contact Form Submission ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    } : "No file uploaded");
    console.log("Body keys:", Object.keys(req.body));

    // Extract form data - handle both string and object formats
    const fullName = req.body.fullName || "";
    const contactNumber = req.body.contactNumber || "";
    const education = req.body.education || "";
    const noticePeriod = req.body.noticePeriod || "";
    const email = req.body.email || "";
    const linkedinUrl = req.body.linkedinUrl || "";
    const currentCTC = req.body.currentCTC || "";
    const experience = req.body.experience || "";

    console.log("Extracted values:", {
      fullName,
      contactNumber,
      education,
      noticePeriod,
      email,
      linkedinUrl,
      currentCTC,
      experience,
    });

    // Store resume file path if uploaded
    if (req.file) {
      resumePath = req.file.path;
    }

    // Validate required fields
    const missingFields = [];
    if (!fullName || fullName.trim() === "") missingFields.push("Full Name");
    if (!contactNumber || contactNumber.trim() === "") missingFields.push("Contact Number");
    if (!education || education.trim() === "") missingFields.push("Education");
    if (!noticePeriod || noticePeriod.trim() === "") missingFields.push("Notice Period");
    if (!email || email.trim() === "") missingFields.push("Email");
    if (!currentCTC || currentCTC.trim() === "") missingFields.push("Current CTC");
    if (!experience || experience.trim() === "") missingFields.push("Experience");

    if (missingFields.length > 0) {
      console.log("Validation failed - missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Please fill all required fields: ${missingFields.join(", ")}`,
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
    const safeFullName = escapeHtml(String(fullName || ""));
    const safeContactNumber = escapeHtml(String(contactNumber || ""));
    const safeEmail = escapeHtml(String(email || ""));
    const safeEducation = escapeHtml(String(education || ""));
    const safeExperience = escapeHtml(String(experience || ""));
    const safeCurrentCTC = escapeHtml(String(currentCTC || ""));
    const safeNoticePeriod = escapeHtml(String(noticePeriod || ""));
    const safeLinkedinUrl = linkedinUrl ? escapeHtml(String(linkedinUrl)) : "";

    // Email options
    const recipientEmail = (process.env.SENDER_EMAIL || smtpMail).trim();
    
    // Prepare attachments
    const attachments = [];
    if (resumePath && req.file && fs.existsSync(resumePath)) {
      attachments.push({
        filename: req.file.originalname || "resume.pdf",
        path: resumePath,
      });
      console.log("Resume attachment prepared:", req.file.originalname);
    }
    
    const mailOptions = {
      from: smtpMail,
      to: recipientEmail,
      subject: `Application Form Submission from ${safeFullName}`,
      attachments: attachments,
      html: `
        <h2>New Application Form Submission</h2>
        
        <h3>Personal Information</h3>
        <p><strong>Full Name:</strong> ${safeFullName}</p>
        <p><strong>Contact Number:</strong> ${safeContactNumber}</p>
        <p><strong>Email Address:</strong> ${safeEmail}</p>
        ${req.file ? `<p><strong>Resume:</strong> Attached (${req.file.originalname})</p>` : ''}
        ${safeLinkedinUrl ? `<p><strong>LinkedIn URL:</strong> <a href="${safeLinkedinUrl}">${safeLinkedinUrl}</a></p>` : ''}
        
        <h3>Professional Information</h3>
        <p><strong>Highest Education:</strong> ${safeEducation}</p>
        <p><strong>Experience:</strong> ${safeExperience}</p>
        <p><strong>Current CTC:</strong> ${safeCurrentCTC}</p>
        <p><strong>Notice Period:</strong> ${safeNoticePeriod}</p>
      `,
      text: `
        New Application Form Submission
        
        Personal Information:
        Full Name: ${fullName || "N/A"}
        Contact Number: ${contactNumber || "N/A"}
        Email Address: ${email || "N/A"}
        ${req.file ? `Resume: ${req.file.originalname} (attached)` : "Resume: Not provided"}
        ${linkedinUrl ? `LinkedIn URL: ${linkedinUrl}` : "LinkedIn URL: Not provided"}
        
        Professional Information:
        Highest Education: ${education || "N/A"}
        Experience: ${experience || "N/A"}
        Current CTC: ${currentCTC || "N/A"}
        Notice Period: ${noticePeriod || "N/A"}
      `,
    };

    console.log("Sending email to:", recipientEmail);
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    // Clean up uploaded file after sending email
    if (resumePath && fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
      console.log("Resume file deleted after sending email");
    }

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (resumePath && fs.existsSync(resumePath)) {
      try {
        fs.unlinkSync(resumePath);
        console.log("Resume file deleted due to error");
      } catch (unlinkError) {
        console.error("Error deleting resume file:", unlinkError);
      }
    }
    
    console.error("=== ERROR DETAILS ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", error);
    
    // Provide more detailed error message
    let errorMessage = "Failed to send email";
    if (error.code === "EAUTH") {
      errorMessage = "Email authentication failed. Please check your SMTP credentials.";
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Could not connect to email server. Please check your SMTP settings.";
    } else if (error.code === "ETIMEDOUT") {
      errorMessage = "Connection to email server timed out. Please try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      code: error.code,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
