const express = require("express");
const cors = require("cors");
const router = express.Router();
const { client } = require("../db"); // Import client from db.js
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendQuizCode, sendWelcomeEmail, sendEmail } = require('../utils/emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage, deleteImage } = require('../utils/cloudinaryConfig');

// Enable CORS
router.use(cors());

const db = client.db("quiz");
const quizCodesCollection = db.collection("quizcodes");
const questionsCollection = db.collection("questions");
const adminsCollection = db.collection("admins");
const superAdminsCollection = db.collection("superAdmins");
const usersCollection = db.collection("users");
const dailyQuizCollection = db.collection("dailyQuiz");
const userScoresCollection = db.collection("userScores");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/profile-images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Middleware to verify super admin JWT token
const verifySuperAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized as super admin" });
    }
    req.superAdminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Import the verifyAdminToken middleware from the middleware directory
const { verifyAdminToken } = require("../middleware/verifyToken");

// Admin registration route
router.post("/admin/register", async (req, res) => {
  try {
    const { username, password, secretKey } = req.body;
    
    // Validate admin secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: "Invalid secret key" });
    }
    
    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new admin
    const newAdmin = {
      username,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const result = await adminsCollection.insertOne(newAdmin);
    
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin login route
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin
    const admin = await adminsCollection.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Update last login timestamp
    await adminsCollection.updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date() } }
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    res.json({ token, admin: { id: admin._id, username: admin.username, role: "admin" } });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Route to verify quiz code
router.post("/quiz/verify/quizcode", async (req, res) => {
  try {
    const { quizcode } = req.body; // ✅ Use req.body instead of req.params
    const quizCode = await quizCodesCollection.findOne({ quizCode: quizcode });
    if (!quizCode) {
      return res.status(404).json({ message: "Invalid quiz code" });
    }
    const currentTime = new Date();
    if (currentTime > quizCode.expiresAt) {
      return res.status(403).json({ message: "Quiz code expired" });
    }
    res.json({ message: "Quiz code verified" });
  } catch (error) {
    console.error("Error verifying quiz code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Route to fetch all questions from the database
router.get("/quiz/:quizcode", async (req, res) => {
  try {
    // Verify quiz code
    const { quizcode } = req.params;
    const userEmail = req.query.email; // Get user email from query parameter
    
    const quizCode = await quizCodesCollection.findOne({ quizCode: quizcode });
    if (!quizCode) {
      return res.status(404).json({ message: "Invalid quiz code" });
    }
    const currentTime = new Date();
    if (currentTime > quizCode.expiresAt) {
      return res.status(403).json({ message: "Quiz code expired" });
    }

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user email is in restricted list
    let isRestricted = false;
    if (userEmail) {
      const restrictedEmail = await db.collection("restrictedEmails").findOne({ email: userEmail });
      isRestricted = !!restrictedEmail;
    }
    
    // Find today's quiz
    const dailyQuiz = await dailyQuizCollection.findOne({
      date: { $gte: today }
    });
    
    // If there's no daily quiz or user is not restricted, serve random questions
    if (!dailyQuiz || !isRestricted) {
      // Serve 15 random questions
      const questions = await questionsCollection
        .aggregate([{ $sample: { size: 15 } }])
        .toArray();
      return prepareQuestionsForClient(questions, res, false);
    }
    
    // If user is restricted and there is a daily quiz, serve admin-set questions
    const objectIds = dailyQuiz.questionIds.map(id => new ObjectId(id.toString()));
    const questions = await questionsCollection
      .find({ _id: { $in: objectIds } })
      .toArray();
    
    return prepareQuestionsForClient(questions, res, true);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Helper function to prepare questions for client
function prepareQuestionsForClient(questions, res, isAdminSet = false) {
  // Shuffle options within each question
  questions.forEach((question) => {
    question.options = question.options.sort(() => Math.random() - 0.5);
  });

  // Remove "isCorrect" field from options and add totalCorrect
  questions.forEach((question) => {
    let totalCorrect = 0;
    question.options.forEach((option) => {
      if (option.isCorrect) {
        totalCorrect++;
      }
      delete option.isCorrect;
    });
    question.totalCorrect = totalCorrect;
  });

  res.json({
    questions: questions,
    isAdminSet: isAdminSet
  });
}

// ✅ Route to fetch questions based on IDs
router.post("/quiz/questions", async (req, res) => {
  try {
    const { questionIds } = req.body;

    // Convert each questionId to ObjectId using the new signature
    const objectIds = questionIds.map((id) => new ObjectId(id.toString()));

    const questions = await questionsCollection
      .find({ _id: { $in: objectIds } })
      .toArray();

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/all/questions", async (req, res) => {
  try {
    const questions = await questionsCollection.find().toArray();
    
    // Ensure each question has a createdAt field for sorting
    const questionsWithDates = questions.map(question => {
      if (!question.createdAt) {
        question.createdAt = new Date().toISOString();
      } else if (typeof question.createdAt === 'object') {
        // Convert Date object to ISO string if needed
        question.createdAt = question.createdAt.toISOString();
      }
      return question;
    });
    
    res.json(questionsWithDates);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Route to create a new question
router.post("/question/save", async (req, res) => {
    const { question, tags, options } = req.body;

    // Validate the request body
    if (!question || !options || options.length === 0) {
        return res.status(400).json({ message: "Invalid input data" });
    }

    try {
        const newQuestion = {
            question,
            tags: tags || "", // Add tags at the question level
            options: options.map((option) => ({
                value: option.value,
                isCorrect: option.isCorrect,
            })),
            createdAt: new Date() // Save the current time
        };
        const result = await questionsCollection.insertOne(newQuestion);
        res.status(201).json(result.insertedId);
    } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Route to update an existing question
router.put("/question/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuestion = req.body;
    delete updatedQuestion._id; // Exclude _id from the update operation
    const result = await questionsCollection.updateOne(
      { _id: new ObjectId(id.toString()) },
      { $set: updatedQuestion }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ message: "Question updated successfully" });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Route to delete a question
router.delete("/question/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await questionsCollection.deleteOne({
      _id: new ObjectId(id.toString()),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get today's daily quiz
router.get("/daily-quiz", async (req, res) => {
  try {
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's quiz
    const dailyQuiz = await dailyQuizCollection.findOne({
      date: { $gte: today }
    });
    
    if (!dailyQuiz) {
      return res.status(404).json({ message: "No daily quiz found for today" });
    }
    
    // Convert question IDs to ObjectId
    const objectIds = dailyQuiz.questionIds.map(id => new ObjectId(id.toString()));
    
    // Fetch the questions
    const questions = await questionsCollection
      .find({ _id: { $in: objectIds } })
      .toArray();
    
    // Shuffle options within each question
    questions.forEach((question) => {
      question.options = question.options.sort(() => Math.random() - 0.5);
    });
    
    // Remove "isCorrect" field from options for client-side
    const clientQuestions = questions.map(question => {
      const { _id, question: text, options } = question;
      
      // Count correct options
      let totalCorrect = 0;
      const clientOptions = options.map(option => {
        if (option.isCorrect) totalCorrect++;
        return {
          value: option.value
        };
      });
      
      return {
        _id,
        question: text,
        tags: question.tags || "",
        options: clientOptions,
        totalCorrect
      };
    });
    
    res.json({
      date: dailyQuiz.date,
      questions: clientQuestions,
      isManuallySelected: dailyQuiz.isManuallySelected
    });
  } catch (error) {
    console.error("Error fetching daily quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to manually set daily quiz (admin only)
router.post("/daily-quiz/set", verifyAdminToken, async (req, res) => {
  try {
    const { questionIds } = req.body;
    
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "Question IDs are required" });
    }
    
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Delete any existing quiz for today
    await dailyQuizCollection.deleteOne({
      date: { $gte: today }
    });
    
    // Use req.user?.id or req.adminId for backward compatibility
    const adminId = req.user?.id || req.adminId;
    
    // Create new daily quiz with manually selected questions
    await dailyQuizCollection.insertOne({
      date: today,
      questionIds: questionIds.map(id => new ObjectId(id.toString())),
      isManuallySelected: true,
      createdAt: new Date(),
      createdBy: adminId
    });
    
    res.json({ message: "Daily quiz set successfully" });
  } catch (error) {
    console.error("Error setting daily quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to reset daily quiz (admin only)
router.post("/daily-quiz/reset", verifyAdminToken, async (req, res) => {
  try {
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Delete any existing quiz for today
    const result = await dailyQuizCollection.deleteOne({
      date: { $gte: today }
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No daily quiz found for today" });
    }
    
    res.json({ message: "Daily quiz reset successfully" });
  } catch (error) {
    console.error("Error resetting daily quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get questions by tags (for admin to select daily quiz)
router.get("/questions/tags/:tag", verifyAdminToken, async (req, res) => {
  try {
    const { tag } = req.params;
    
    // Find questions where the question has the specified tag
    const questions = await questionsCollection
      .find({ tags: { $regex: tag, $options: "i" } })
      .toArray();
    
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions by tag:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User registration route
router.post("/user/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username 
          ? "Username already exists" 
          : "Email already exists" 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertedId, username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, username);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Continue with signup even if email fails
    }
    
    res.status(201).json({ 
      token, 
      user: { id: result.insertedId, username, email } 
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Login
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email/username and password are required" });
    }
    
    // Find the user by email or username
    const user = await usersCollection.findOne({ 
      $or: [
        { email: email },
        { username: email } // Allow login with username as well
      ]
    });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        username: user.username,
        role: "user"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Remove password from response
    const { password: _, ...safeUser } = user;
    
    res.json({
      token,
      user: safeUser
    });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Middleware to verify user JWT token
const verifyUserToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Submit quiz answers
router.post("/quiz/submit", verifyUserToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.userId;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format" });
    }
    
    // Check for recent submissions (within the last 30 seconds)
    const recentSubmission = await userScoresCollection.findOne({
      userId: new ObjectId(userId),
      submittedAt: { $gt: new Date(Date.now() - 30000) } // 30 seconds ago
    });
    
    if (recentSubmission) {
      console.log(`Duplicate submission detected for user ${userId}. Returning existing results.`);
      return res.json({
        score: recentSubmission.score,
        totalQuestions: recentSubmission.totalQuestions,
        percentage: recentSubmission.percentage,
        grade: recentSubmission.grade,
        isBestScore: false, // We don't know if it was the best score, so default to false
        detailedResults: recentSubmission.detailedResults
      });
    }
    
    // Get the questions based on the submitted answer IDs
    const questionIds = answers.map(a => a.questionId);
    const objectIds = questionIds.map(id => new ObjectId(id.toString()));
    const questions = await questionsCollection
      .find({ _id: { $in: objectIds } })
      .toArray();
    
    // Create a map for quick question lookup
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));
    
    // Calculate score and create detailed results
    let score = 0;
    const detailedResults = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      
      if (!question) {
        return { 
          questionId: answer.questionId,
          correct: false,
          message: "Question not found"
        };
      }

      // Get user's selected option values
      const selectedValues = answer.selectedOptions || [];
      
      // Get correct option values
      const correctValues = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.value);
      
      // Check if selected values match correct values
      let isCorrect = false;
      
      // For single-choice questions
      if (correctValues.length === 1 && selectedValues.length === 1) {
        isCorrect = selectedValues[0] === correctValues[0];
      } else {
        // For multiple-choice questions
        isCorrect = 
          correctValues.length === selectedValues.length &&
          correctValues.every(val => selectedValues.includes(val)) &&
          selectedValues.every(val => correctValues.includes(val));
      }
      
      if (isCorrect) score += 1;
      
      return {
        questionId: answer.questionId,
        question: question.question,
        correct: isCorrect,
        options: question.options.map(opt => ({
          value: opt.value,
          isCorrect: opt.isCorrect,
          isSelected: selectedValues.includes(opt.value)
        })),
        explanation: question.explanation || null
      };
    });

    // Calculate percentage and grade
    const percentage = Math.round((score / questions.length) * 100);
    let grade = "Try Again";
    if (percentage >= 90) grade = "Excellent";
    else if (percentage >= 80) grade = "Very Good";
    else if (percentage >= 70) grade = "Good";
    else if (percentage >= 60) grade = "Fair";
    else if (percentage >= 50) grade = "Pass";
    
    // Get user data for email
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    // Save the quiz attempt
    const quizAttempt = {
      userId: new ObjectId(userId),
      username: user.username,
      email: user.email,
      date: new Date(),
      score,
      totalQuestions: questions.length,
      percentage,
      grade,
      detailedResults,
      submittedAt: new Date(),
      emailSent: false // Track if email has been sent
    };
    
    await userScoresCollection.insertOne(quizAttempt);

    // Check if this is the best score
    const userBestScore = await userScoresCollection.findOne(
      { userId: new ObjectId(userId) },
      { sort: { score: -1 } }
    );

    const isBestScore = !userBestScore || score > userBestScore.score;

    // Send email notification
    const emailHtml = `
      <h2>Quiz Results</h2>
      <p>Hello ${user.username},</p>
      <p>You have completed the quiz. Here are your results:</p>
      <ul>
        <li>Score: ${score}/${questions.length}</li>
        <li>Percentage: ${percentage}%</li>
        <li>Grade: ${grade}</li>
        ${isBestScore ? '<p><strong>🎉 Congratulations! This is your best score yet!</strong></p>' : ''}
      </ul>
      <h3>Detailed Results:</h3>
      <ul>
        ${detailedResults.map((result, index) => `
          <li>
            Question ${index + 1}: ${result.correct ? '✅ Correct' : '❌ Incorrect'}
            ${result.explanation ? `<br>Explanation: ${result.explanation}` : ''}
          </li>
        `).join('')}
      </ul>
      <p>Keep practicing to improve your score!</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: `Quiz Results - ${percentage}% ${isBestScore ? '(New Best Score!)' : ''}`,
        html: emailHtml
      });
      
      // Update the attempt to mark email as sent
      await userScoresCollection.updateOne(
        { _id: quizAttempt._id },
        { $set: { emailSent: true } }
      );
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the request if email fails
    }
    
    res.json({
      score,
      totalQuestions: questions.length,
      percentage,
      grade,
      isBestScore,
      detailedResults
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's quiz history
router.get("/user/quiz-history", verifyUserToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const quizHistory = await userScoresCollection
      .find({ userId: new ObjectId(userId.toString()) })
      .sort({ date: -1 })
      .toArray();
    
    res.json(quizHistory);
  } catch (error) {
    console.error("Error fetching user quiz history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's daily quiz attempt for today
router.get("/user/today-quiz", verifyUserToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user has already attempted today's quiz
    const todayAttempt = await userScoresCollection.findOne({
      userId: new ObjectId(userId.toString()),
      date: { $gte: today }
    });
    
    if (todayAttempt) {
      return res.json({
        attempted: true,
        score: todayAttempt.score,
        totalQuestions: todayAttempt.totalQuestions,
        percentage: Math.round((todayAttempt.score / todayAttempt.totalQuestions) * 100),
        detailedResults: todayAttempt.detailedResults
      });
    }
    
    res.json({ attempted: false });
  } catch (error) {
    console.error("Error checking today's quiz attempt:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get questions by multiple tags
router.post("/questions/filter", verifyAdminToken, async (req, res) => {
  try {
    const { tags, searchTerm } = req.body;
    
    let query = {};
    
    // Add tag filter if tags are provided
    if (tags && tags.length > 0) {
      const tagRegexes = tags.map(tag => new RegExp(tag, 'i'));
      query.tags = { $regex: tagRegexes.join('|') };
    }
    
    // Add search term filter if provided
    if (searchTerm) {
      query.question = { $regex: searchTerm, $options: 'i' };
    }
    
    // Find questions matching the query
    const questions = await questionsCollection
      .find(query)
      .toArray();
    
    // Ensure each question has a createdAt field
    const questionsWithDates = questions.map(question => {
      if (!question.createdAt) {
        question.createdAt = new Date().toISOString();
      } else if (typeof question.createdAt === 'object') {
        question.createdAt = question.createdAt.toISOString();
      }
      return question;
    });
    
    res.json(questionsWithDates);
  } catch (error) {
    console.error("Error filtering questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Super Admin Login
router.post("/superadmin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find the super admin by username
    const superAdmin = await superAdminsCollection.findOne({ username });
    
    if (!superAdmin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Update last login
    await superAdminsCollection.updateOne(
      { _id: superAdmin._id },
      { $set: { lastLogin: new Date() } }
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: superAdmin._id.toString(),
        username: superAdmin.username,
        role: "superadmin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({
      token,
      username: superAdmin.username,
      role: "superadmin"
    });
  } catch (error) {
    console.error("Error during super admin login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all admins (super admin only)
router.get("/superadmin/admins", verifySuperAdminToken, async (req, res) => {
  try {
    const admins = await adminsCollection.find({}).toArray();
    
    // Remove sensitive information
    const safeAdmins = admins.map(admin => {
      const { password, ...safeAdmin } = admin;
      return safeAdmin;
    });
    
    res.json(safeAdmins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new admin (super admin only)
router.post("/superadmin/admins", verifySuperAdminToken, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Validate input
    if (!username || !password || !email) {
      return res.status(400).json({ message: "Username, password, and email are required" });
    }
    
    // Check if username already exists
    const existingAdmin = await adminsCollection.findOne({ username });
    if (existingAdmin) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    // Check if email already exists
    const existingEmail = await adminsCollection.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create the admin
    const admin = {
      username,
      email,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      createdBy: req.superAdminId,
      lastLogin: null,
      isActive: true
    };
    
    await adminsCollection.insertOne(admin);
    
    // Remove password from response
    const { password: _, ...safeAdmin } = admin;
    
    res.status(201).json(safeAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update admin (super admin only)
router.put("/superadmin/admins/:id", verifySuperAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, isActive } = req.body;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }
    
    // Find the admin
    const admin = await adminsCollection.findOne({ _id: new ObjectId(id) });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Prepare update object
    const updateData = {};
    
    if (username) {
      // Check if username already exists (except for this admin)
      const existingAdmin = await adminsCollection.findOne({ 
        username, 
        _id: { $ne: new ObjectId(id) } 
      });
      
      if (existingAdmin) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      updateData.username = username;
    }
    
    if (email) {
      // Check if email already exists (except for this admin)
      const existingEmail = await adminsCollection.findOne({ 
        email, 
        _id: { $ne: new ObjectId(id) } 
      });
      
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
      
      updateData.email = email;
    }
    
    if (password) {
      // Hash the password
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    // Update the admin
    await adminsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    // Get the updated admin
    const updatedAdmin = await adminsCollection.findOne({ _id: new ObjectId(id) });
    
    // Remove password from response
    const { password: _, ...safeAdmin } = updatedAdmin;
    
    res.json(safeAdmin);
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete admin (super admin only)
router.delete("/superadmin/admins/:id", verifySuperAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }
    
    // Find the admin
    const admin = await adminsCollection.findOne({ _id: new ObjectId(id) });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Delete the admin
    await adminsCollection.deleteOne({ _id: new ObjectId(id) });
    
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Signup
router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }
    
    // Check if username already exists
    const existingUsername = await usersCollection.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    // Check if email already exists
    const existingEmail = await usersCollection.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create the user
    const user = {
      username,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      lastLogin: null,
      quizAttempts: [],
      isVerified: false,
      verificationToken: crypto.randomBytes(32).toString('hex')
    };
    
    const result = await usersCollection.insertOne(user);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertedId.toString(),
        username: user.username,
        role: "user"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, username);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Continue with signup even if email fails
    }
    
    // Remove password from response
    const { password: _, ...safeUser } = user;
    
    res.status(201).json({
      message: "User created successfully",
      token,
      user: safeUser
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user profile
router.get("/user/profile", verifyUserToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user profile without sensitive information
    const userProfile = {
      username: user.username,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      dateOfBirth: user.dateOfBirth || "",
      gender: user.gender || "",
      phoneNumber: user.phoneNumber || "",
      profileImage: user.profileImage || ""
    };
    
    res.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile
router.put("/user/profile", verifyUserToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      username, 
      email, 
      firstName, 
      lastName, 
      bio, 
      dateOfBirth, 
      gender, 
      phoneNumber 
    } = req.body;
    
    // Check if username or email already exists (if changed)
    const existingUser = await usersCollection.findOne({
      $and: [
        { _id: { $ne: new ObjectId(userId) } },
        { $or: [{ username }, { email }] }
      ]
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }
    
    // Update user profile
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          username, 
          email, 
          firstName, 
          lastName, 
          bio, 
          dateOfBirth, 
          gender, 
          phoneNumber,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Upload profile image
router.post("/user/profile-image", verifyUserToken, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // Get the user to check if they already have a profile image
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Upload image to Cloudinary
    const cloudinaryResult = await uploadImage(req.file.path);
    
    // If user already has a profile image in Cloudinary, delete it
    if (user.cloudinaryPublicId) {
      await deleteImage(user.cloudinaryPublicId);
    }
    
    // Update user with new profile image URL from Cloudinary
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          profileImage: cloudinaryResult.secure_url,
          cloudinaryPublicId: cloudinaryResult.public_id,
          updatedAt: new Date()
        } 
      }
    );
    
    // Delete the local file after uploading to Cloudinary
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      message: "Profile image uploaded successfully",
      profileImage: cloudinaryResult.secure_url
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    
    // Delete the local file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete profile image
router.delete("/user/profile-image", verifyUserToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get the user to check if they have a profile image
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If user has a profile image in Cloudinary, delete it
    if (user.cloudinaryPublicId) {
      await deleteImage(user.cloudinaryPublicId);
      
      // Update user to remove profile image info
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $unset: { 
            profileImage: "",
            cloudinaryPublicId: ""
          },
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    res.json({ message: "Profile image deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Change user password
router.put("/user/change-password", verifyUserToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    // Get user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to generate a quiz code
router.post("/quiz/generate-code", verifyUserToken, async (req, res) => {
  try {
    // Find the user
    const user = await usersCollection.findOne({ _id: new ObjectId(req.userId) });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate a random 6-character code
    const quizCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Set expiry time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Store the code in the database
    await quizCodesCollection.insertOne({
      quizCode,
      userId: new ObjectId(req.userId),
      username: user.username,
      createdAt: new Date(),
      expiresAt,
      isUsed: false
    });
    
    // Send the code to the user's email
    await sendQuizCode(user.email, user.username, quizCode, expiresAt);
    
    res.json({
      message: "Quiz code generated and sent to your email",
      quizCode,
      expiresAt
    });
  } catch (error) {
    console.error("Error generating quiz code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Request password reset
router.post("/user/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Find user by email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    }
    
    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour
    
    // Hash the token for storage
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Update user with reset token
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken: hashedToken,
          resetTokenExpiry,
          updatedAt: new Date()
        } 
      }
    );
    
    // Create reset URL
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Send email with reset link
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Hello ${user.username},</p>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link is valid for 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
    
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: emailHtml
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return res.status(500).json({ message: "Failed to send password reset email" });
    }
    
    res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset password with token
router.post("/user/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token, and new password are required" });
    }
    
    // Find user by email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    // Check if reset token exists and is valid
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    if (user.resetToken !== hashedToken) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    // Check if token is expired
    if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user with new password and remove reset token
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: ""
        }
      }
    );
    
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get quiz result by quiz code
router.get("/quiz/result/:quizCode", verifyUserToken, async (req, res) => {
  try {
    const { quizCode } = req.params;
    const userId = req.userId;
    
    if (!quizCode) {
      return res.status(400).json({ message: "Quiz code is required" });
    }
    
    // First, find the quiz code in the database
    const quizCodeDoc = await quizCodesCollection.findOne({ 
      quizCode: quizCode.toUpperCase(),
      isUsed: true
    });
    
    if (!quizCodeDoc) {
      return res.status(404).json({ message: "Quiz code not found or not used" });
    }
    
    // Find the most recent quiz attempt for this user
    const quizAttempt = await userScoresCollection.findOne(
      { userId: new ObjectId(userId) },
      { sort: { submittedAt: -1 } }
    );
    
    if (!quizAttempt) {
      return res.status(404).json({ message: "No quiz results found" });
    }
    
    // Return the quiz result
    res.json({
      score: quizAttempt.score,
      totalQuestions: quizAttempt.totalQuestions,
      percentage: quizAttempt.percentage,
      grade: quizAttempt.grade,
      isBestScore: false, // We don't know if it was the best score
      detailedResults: quizAttempt.detailedResults
    });
  } catch (error) {
    console.error("Error fetching quiz result:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
