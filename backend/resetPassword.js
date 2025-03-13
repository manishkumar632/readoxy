require('dotenv').config();
const { client, connectToDatabase } = require('./db');
const bcrypt = require('bcrypt');

async function resetPassword() {
  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('quiz');
    const usersCollection = db.collection('users');
    
    // Find the user
    const user = await usersCollection.findOne({ email: 'yisocov659@oziere.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`Found user: ${user.username} (${user.email})`);
    
    // Hash the new password
    const newPassword = '#123@Asd';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    
    if (result.modifiedCount === 1) {
      console.log('✅ Password reset successful');
    } else {
      console.log('❌ Password reset failed');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

resetPassword(); 