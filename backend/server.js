const express = require("express");
const cors = require("cors"); // Import CORS package
const cron = require("node-cron");
require("dotenv").config();
const { client, connectDB } = require("./db"); // Import client from db.js
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();
app.use(express.json());

// ✅ Enable CORS for frontend (Adjust in production)
app.use(cors({ origin: "http://localhost:3000" })); // Allow frontend to access API

// ✅ Connect to MongoDB
connectDB();

const db = client.db("questions");
const quizCodesCollection = db.collection("quizcodes");

// ✅ Function to generate a random quiz code
const generateQuizCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: "A1B2C3"
};

// ✅ Function to insert a new quiz code and delete old ones
const generateAndStoreQuizCode = async () => {
    const newQuizCode = generateQuizCode();
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await quizCodesCollection.deleteMany({}); // Delete old quiz codes
    await quizCodesCollection.insertOne({
        quizCode: newQuizCode,
        expiresAt: expirationTime,
        createdAt: new Date(),
    });

    console.log(`🔄 New Quiz Code Generated: ${newQuizCode} (Valid until ${expirationTime})`);
};

// ✅ Schedule to run every hour (at the beginning of the hour)
cron.schedule("0 * * * *", async () => {
    await generateAndStoreQuizCode();
});

// ✅ Generate first quiz code on server start
generateAndStoreQuizCode();

// ✅ Use quizRoutes for API endpoints
app.use("/api/quiz", quizRoutes);
app.use("/api/question", questionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
