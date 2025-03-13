const express = require("express");
const router = express.Router();
const { client } = require("../db"); // Import client from db.js
const { verifyAdminToken } = require("../middleware/verifyToken"); // Ensure verifyAdminToken is correctly imported

const db = client.db("quiz"); // Changed from "restrictedEmails" to "quiz" to be consistent

const restrictedEmails = db.collection("restrictedEmails");

// Add a new restricted email
router.post("/restricted-emails", verifyAdminToken, async (req, res) => {
  // Add verifyAdminToken middleware
  console.log("Endpoint hit"); // Check if the endpoint is being hit
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    console.log("email", email); // Check if the email is being logged
    
    // Check if email already exists
    const existingEmail = await restrictedEmails.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already restricted" });
    }
    
    await restrictedEmails.insertOne({ email }); // Insert the email into the collection
    res.status(201).json({ message: "Email added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add email", error });
  }
});

// Get all restricted emails
router.get("/restricted-emails", verifyAdminToken, async (req, res) => {
  try {
    const emails = await restrictedEmails.find().toArray();
    // Map the emails to just return the email strings as the frontend expects
    const emailStrings = emails.map(item => item.email);
    res.status(200).json(emailStrings);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve emails", error });
  }
});

// Delete a restricted email
router.delete("/restricted-emails/:email", verifyAdminToken, async (req, res) => {
  const { email } = req.params;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  
  try {
    const result = await restrictedEmails.deleteOne({ email });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Email not found" });
    }
    
    res.status(200).json({ message: "Email removed successfully" });
  } catch (error) {
    console.error("Error removing email:", error);
    res.status(500).json({ message: "Failed to remove email", error });
  }
});

module.exports = router;
