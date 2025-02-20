const express = require("express");
const { client } = require("../db"); // Import client from db.js

const router = express.Router();

// Verify Quiz Code
router.post("/verify", async (req, res) => {
    const { quizCode } = req.body;

    try {
        const db = client.db("questions");
        const quizCodesCollection = db.collection("quizcodes");

        const quiz = await quizCodesCollection.findOne({ quizCode });

        if (quiz) {
            return res.status(200).json({ success: true, message: "Valid quiz code" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid or expired quiz code" });
        }
    } catch (error) {
        console.error("❌ Error verifying quiz code:", error);
        return res.status(500).json({ message: "Server Error", error });
    }
});

// Get the latest quiz code
router.get("/latest", async (req, res) => {
    try {
        const db = client.db("questions");
        const quizCodesCollection = db.collection("quizcodes");

        // Fetch the most recent quiz code (sorted by `createdAt` in descending order)
        const latestQuiz = await quizCodesCollection.find().sort({ createdAt: -1 }).limit(1).toArray();

        if (latestQuiz.length > 0) {
            res.status(200).json({ quizCode: latestQuiz[0].quizCode });
        } else {
            res.status(404).json({ message: "No quizzes found" });
        }
    } catch (error) {
        console.error("❌ Error fetching latest quiz code:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

// Verify submitted answers
router.post("/:quizCode/verify", async (req, res) => {
    const { quizCode } = req.params;
    const { userAnswers } = req.body;

    try {
        const db = client.db("questions");
        const questionsCollection = db.collection("quizquestions");

        // Fetch all questions for this quiz
        const questions = await questionsCollection.find({}).toArray();

        // Compare user answers with correct answers
        const results = questions.map((question) => {
            const correctAnswers = question.correctOptions.map((opt) => parseInt(opt)); // Convert correctOptions to numbers
            const userSelected = userAnswers[question._id] || [];

            return {
                questionId: question._id,
                question: question.question,
                options: question.options,
                correctOptions: correctAnswers,
                userSelected: userSelected,
                isCorrect: JSON.stringify(correctAnswers) === JSON.stringify(userSelected), // Check if answers match
            };
        });

        res.status(200).json({ results });
    } catch (error) {
        console.error("❌ Error verifying answers:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});
// Get questions for a specific quiz
router.get("/:quizCode", async (req, res) => {
    const { quizCode } = req.params;
    try {
        const db = client.db("questions");
        const questionsCollection = db.collection("quizquestions");

        // ✅ Use `await` to properly fetch data
        const questions = await questionsCollection.find({}).toArray();

        if (questions.length > 0) {
            const modifiedQuestions = questions.map(question => {
                const totalCorrectOptions = question.correctOptions.length;
                return {
                    ...question,
                    totalCorrectOptions,
                    correctOptions: undefined,
                    createdAt: undefined
                };
            });
            res.status(200).json(modifiedQuestions);
        } else {
            res.status(404).json({ message: "No questions found" });
        }
    } catch (error) {
        console.error("❌ Error fetching quiz questions:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});


module.exports = router;
