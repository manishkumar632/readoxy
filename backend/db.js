const { MongoClient } = require("mongodb");

// Connection URI
const uri = process.env.MONGO_URI;

// Create a new MongoClient
const client = new MongoClient(uri);

// Connect to the MongoDB server
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
        return client;
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1); // Stop server if DB fails
    }
}

module.exports = { client, connectToDatabase };
