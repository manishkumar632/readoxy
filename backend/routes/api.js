const express = require("express");
const router = express.Router();
const { client } = require("../db");
const { ObjectId } = require("mongodb");

// Utility function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Route to save a quiz question
router.post("/question/save", async (req, res) => {
    const { question, options } = req.body;

    if (!question || !options || !Array.isArray(options)) {
        return res.status(400).json({ message: "Invalid data" });
    }

    try {
        const db = client.db("quiz");
        const questionsCollection = db.collection("questions");

        const newQuestion = {
            question,
            options,
            createdAt: new Date(),
        };

        const result = await questionsCollection.insertOne(newQuestion);

        res.status(201).json({ message: "Question saved successfully", id: result.insertedId });
    } catch (error) {
        console.error("❌ Error saving question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to verify quiz code
router.post("/quiz/verify", async (req, res) => {
    const { quizCode } = req.body;

    if (!quizCode) {
        return res.status(400).json({ message: "Quiz code is required" });
    }

    try {
        const db = client.db("quiz");
        const quizCodesCollection = db.collection("quizcodes");

        const quizCodeDoc = await quizCodesCollection.findOne({ quizCode });

        if (!quizCodeDoc) {
            console.log("❌ Quiz code not found:", quizCode);
            return res.status(400).json({ message: "Invalid quiz code" });
        }

        if (new Date() > quizCodeDoc.expiresAt) {
            console.log("❌ Quiz code expired:", quizCode);
            return res.status(400).json({ message: "Expired quiz code" });
        }

        res.status(200).json({ message: "Quiz code is valid" });
    } catch (error) {
        console.error("❌ Error verifying quiz code:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/quiz/:quizCode", async (req, res) => {
    const { quizCode } = req.params;

    try {
        const db = client.db("quiz");
        const questionsCollection = db.collection("questions");

        let questions = await questionsCollection.find().toArray();

        // Shuffle questions and their options
        questions = shuffleArray(questions).map((question) => {
            const correctOptionCount = question.options.filter(opt => opt.isCorrect).length;

            return {
                ...question,
                options: shuffleArray(question.options.map(({ value }) => ({ value }))), // Remove `isCorrect`
                correctOptionCount, // Include number of correct options
            };
        });

        // Select only 15 random questions
        questions = questions.slice(0, 15);

        res.status(200).json(questions);
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Route to get all saved questions along with options
router.get("/questions", async (req, res) => {
    try {
        const db = client.db("quiz");
        const questionsCollection = db.collection("questions");

        const questions = await questionsCollection.find().toArray();

        res.status(200).json(questions);
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to verify answers
router.post("/quiz/:quizCode/verify", async (req, res) => {
    const { quizCode } = req.params;
    const { userAnswers } = req.body;

    try {
        const db = client.db("quiz");
        const questionsCollection = db.collection("questions");

        const questions = await questionsCollection.find().toArray();

        const results = questions
            .filter(question => userAnswers.hasOwnProperty(question._id))
            .map((question) => {
                const correctOptions = question.options
                    .filter((option) => option.isCorrect)
                    .map((option) => option.value);

                const userSelectedOptions = userAnswers[question._id] || [];

                console.log("Question:", question.question);
                console.log("Correct Options:", correctOptions);
                console.log("User Selected Options:", userSelectedOptions);

                const isCorrect =
                    correctOptions.length === userSelectedOptions.length &&
                    correctOptions.every((opt) => userSelectedOptions.includes(opt));

                return {
                    questionId: question._id,
                    question: question.question,
                    options: question.options.map(option => option.value),
                    correctOptions,
                    userSelected: userSelectedOptions,
                    isCorrect,
                };
            });

        res.status(200).json({ results });
    } catch (error) {
        console.error("❌ Error verifying answers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to fetch a specific question by ID
router.get("/question/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const db = client.db("quiz");
        const questionsCollection = db.collection("questions");

        const question = await questionsCollection.findOne({ _id: new ObjectId(id) });

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json(question);
    } catch (error) {
        console.error("❌ Error fetching question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to delete a specific question by ID
router.delete("/question/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const db = client.db("quiz");
        const questionsCollection = db.collection("questions");

        const result = await questionsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to update a specific question by ID
router.put("/question/:id", async (req, res) => {
    const { id } = req.params;
    const { question, options } = req.body;

    if (!question || !options || !Array.isArray(options)) {
        return res.status(400).json({ message: "Invalid data" });
    }

    try {
        const db = client.db("quiz");
        const questionsCollection = db.collection("questions");

        const updatedQuestion = {
            question,
            options,
            updatedAt: new Date(),
        };

        const result = await questionsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedQuestion }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json(updatedQuestion);
    } catch (error) {
        console.error("❌ Error updating question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
