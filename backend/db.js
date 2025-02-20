const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI); // Removed deprecated options

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1); // Stop server if DB fails
    }
}

module.exports = { client, connectDB };
