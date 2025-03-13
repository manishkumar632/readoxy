const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadImage, deleteImage } = require("../utils/cloudinaryConfig");
const path = require("path");
const { client } = require("../db");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailService");
const {
  getPasswordUpdateTemplate,
  getEmailUpdateTemplate,
  getPasswordResetTemplate,
} = require("../utils/emailTemplates");

// Auth middleware
const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = client.db("quiz");
    const superAdmin = await db.collection("superAdmins").findOne({
      _id: new ObjectId(decoded.id),
    });

    if (!superAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = superAdmin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get profile route
router.get("/profile", authenticateSuperAdmin, async (req, res) => {
  try {
    const { password, ...profile } = req.user;
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Update profile route
router.put("/profile", authenticateSuperAdmin, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = client.db("quiz");

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await db
      .collection("superAdmins")
      .updateOne({ _id: req.user._id }, { $set: updateData });

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Request verification code for password/email update
router.post(
  "/request-verification",
  authenticateSuperAdmin,
  async (req, res) => {
    try {
      const { type, newEmail } = req.body;

      // Validate email for email change
      if (type === "email" && !newEmail) {
        return res.status(400).json({ message: "New email is required" });
      }

      const code = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const db = client.db("quiz");
      await db.collection("verificationCodes").insertOne({
        userId: req.user._id,
        type,
        code,
        expiresAt,
        newEmail: type === "email" ? newEmail : undefined,
      });

      const template =
        type === "password"
          ? getPasswordUpdateTemplate(code)
          : getEmailUpdateTemplate(code);

      // Send to current email for password change, new email for email change
      const recipientEmail = type === "email" ? newEmail : req.user.email;

      await sendEmail(recipientEmail, template.subject, template.html);

      res.json({
        message: "Verification code sent",
        sentTo: recipientEmail,
      });
    } catch (error) {
      console.error("Verification code send error:", error);
      res.status(500).json({
        message: "Failed to send verification code",
        error: error.message,
      });
    }
  }
);

// Verify code and update password/email
router.post("/verify-update", authenticateSuperAdmin, async (req, res) => {
  try {
    const { code, type, newPassword, newEmail } = req.body;
    const db = client.db("quiz");

    const verification = await db.collection("verificationCodes").findOne({
      userId: req.user._id,
      type,
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (type === "password") {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db
        .collection("superAdmins")
        .updateOne(
          { _id: req.user._id },
          { $set: { password: hashedPassword } }
        );
    } else if (type === "email") {
      await db
        .collection("superAdmins")
        .updateOne({ _id: req.user._id }, { $set: { email: newEmail } });
    }

    await db
      .collection("verificationCodes")
      .deleteOne({ _id: verification._id });

    res.json({
      message: `${
        type === "password" ? "Password" : "Email"
      } updated successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify and update" });
  }
});

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Handle profile image upload
router.post(
  "/profile/image",
  authenticateSuperAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const db = client.db("quiz");

      // Delete old image if exists
      if (req.user.profileImage) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = req.user.profileImage.split("/");
          const filename = urlParts[urlParts.length - 1];
          const publicId = `profile-images/${filename.split(".")[0]}`;
          await deleteImage(publicId);
        } catch (error) {
          console.error("Failed to delete old image:", error);
          // Continue with upload even if deletion fails
        }
      }

      const result = await uploadImage(req.file);

      await db
        .collection("superAdmins")
        .updateOne(
          { _id: req.user._id },
          { $set: { profileImage: result.secure_url } }
        );

      res.json({
        message: "Profile image updated successfully",
        imageUrl: result.secure_url,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        message: "Failed to upload image",
        error: error.message,
      });
    }
  }
);

// Forgot password request
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const db = client.db("quiz");

    const superAdmin = await db.collection("superAdmins").findOne({ email });
    if (!superAdmin) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await db.collection("passwordResets").insertOne({
      userId: superAdmin._id,
      token: resetToken,
      expiresAt: resetTokenExpiry,
    });

    const resetLink = `http://localhost:3000/superadmin/reset-password?token=${resetToken}`;
    const template = getPasswordResetTemplate(resetLink);

    await sendEmail(email, template.subject, template.html);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const db = client.db("quiz");

    const resetRequest = await db.collection("passwordResets").findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRequest) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .collection("superAdmins")
      .updateOne(
        { _id: resetRequest.userId },
        { $set: { password: hashedPassword } }
      );

    await db.collection("passwordResets").deleteOne({ _id: resetRequest._id });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;
