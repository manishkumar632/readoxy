require("dotenv").config();
const bcrypt = require("bcrypt");
const { client, connectToDatabase } = require("./db");

async function createAdmin() {
  try {
    await connectToDatabase();
    console.log("✅ Connected to MongoDB");

    const db = client.db("quiz");
    const adminsCollection = db.collection("admins");

    // Check if admin already exists
    const adminUsername = "admin";
    const existingAdmin = await adminsCollection.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      console.log("❌ Admin already exists");
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const newAdmin = {
      username: adminUsername,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await adminsCollection.insertOne(newAdmin);
    console.log("✅ Admin created successfully:", result.insertedId);

  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await client.close();
    console.log("✅ MongoDB connection closed");
  }
}

createAdmin(); 