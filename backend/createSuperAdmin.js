require('dotenv').config();
const bcrypt = require('bcrypt');
const { client, connectToDatabase } = require('./db');
const { v4: uuidv4 } = require('uuid');

async function createSuperAdmin() {
  try {
    await connectToDatabase();
    
    const db = client.db("quiz");
    const superAdminsCollection = db.collection("superAdmins");
    
    // Check if a super admin already exists
    const existingSuperAdmin = await superAdminsCollection.findOne({});
    
    if (existingSuperAdmin) {
      console.log("A super admin already exists. Use the reset password functionality if needed.");
      process.exit(0);
    }
    
    // Default credentials - CHANGE THESE IN PRODUCTION
    const username = process.env.SUPER_ADMIN_USERNAME || "superadmin";
    const password = process.env.SUPER_ADMIN_PASSWORD || "superadmin123";
    const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@example.com";
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create the super admin
    const superAdmin = {
      username,
      email,
      password: hashedPassword,
      role: "superadmin",
      createdAt: new Date(),
      lastLogin: null,
      apiKey: uuidv4()
    };
    
    await superAdminsCollection.insertOne(superAdmin);
    
    console.log("Super admin created successfully!");
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Email:", email);
    console.log("Please change these credentials after first login.");
    
  } catch (error) {
    console.error("Error creating super admin:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

createSuperAdmin(); 