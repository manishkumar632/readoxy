require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { client, connectToDatabase } = require("./db"); // Import client from db.js
const apiRoutes = require("./routes/routes"); // Import the updated routes
const restrictionRoutes = require("./routes/restriction"); // Import the updated routes
const superAdminRoutes = require("./routes/superAdminRoutes"); // Import the superAdminRoutes
const app = express();
const port = process.env.PORT || 5000;

// Update CORS configuration to allow requests from both ports
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
const profileImagesDir = path.join(uploadsDir, "profile-images");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir);
}

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
const db = client.db("quiz");
const quizCodesCollection = db.collection("quizcodes");
const questionsCollection = db.collection("questions");
const dailyQuizCollection = db.collection("dailyQuiz");

// ✅ Function to generate a random quiz code
const generateQuizCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase(); // Example: "A1B2C3"
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

  console.log(
    `🔄 New Quiz Code Generated: ${newQuizCode} (Valid until ${expirationTime})`
  );
};

// Function to generate daily quiz questions
const generateDailyQuiz = async () => {
  try {
    // Get the current date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if we already have a quiz for today
    const existingDailyQuiz = await dailyQuizCollection.findOne({
      date: { $gte: today },
    });

    if (existingDailyQuiz) {
      console.log("📝 Daily quiz already exists for today");
      return;
    }

    // Get 10 random questions for the daily quiz
    const randomQuestions = await questionsCollection
      .aggregate([{ $sample: { size: 10 } }])
      .toArray();

    // Extract just the question IDs
    const questionIds = randomQuestions.map((q) => q._id);

    // Create the daily quiz entry
    await dailyQuizCollection.insertOne({
      date: today,
      questionIds: questionIds,
      isManuallySelected: false,
      createdAt: new Date(),
    });

    console.log(
      "✅ Daily quiz generated successfully for",
      today.toDateString()
    );
  } catch (error) {
    console.error("❌ Error generating daily quiz:", error);
  }
};

// ✅ Schedule to run every hour (at the beginning of the hour)
const cron = require("node-cron");
cron.schedule("0 * * * *", async () => {
  await generateAndStoreQuizCode();
});

// Schedule to run at midnight every day to generate the daily quiz
cron.schedule("0 0 * * *", async () => {
  await generateDailyQuiz();
});

// ✅ Generate first quiz code on server start
generateAndStoreQuizCode();

// Generate daily quiz on server start if not already generated for today
generateDailyQuiz();

// ✅ Use quizRoutes and apiRoutes for API endpoints
app.use("/api", apiRoutes); // Use the updated routes
app.use("/api", restrictionRoutes); // Use the updated routes
app.use("/api/superadmin", superAdminRoutes); // Use the superAdminRoutes

// Start the server
async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
