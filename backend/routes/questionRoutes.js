const express = require("express");
const { client } = require("../db"); // Import database client

const router = express.Router();

// Save a new question
router.post("/save", async (req, res) => {
    const { question, options, correctOptions } = req.body;

    if (!question || !options || !correctOptions) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const db = client.db("questions");
        const questionsCollection = db.collection("quizquestions");

        // Insert new question
        const result = await questionsCollection.insertOne({
            question,
            options,
            correctOptions,
            createdAt: new Date(),
        });

        res.status(201).json({ success: true, message: "Question saved successfully", questionId: result.insertedId });
    } catch (error) {
        console.error("❌ Error saving question:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

module.exports = router;
