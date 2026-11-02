require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../models/User");
const Todo = require("../models/Todo");

async function migrateOwner() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Find your user
    const user = await User.findOne({
      email: "deep.test@example.com"
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Assign old todos to your account
    const result = await Todo.updateMany(
      { owner: { $exists: false } },
      { $set: { owner: user._id } }
    );

    console.log("Todos updated:", result.modifiedCount);

  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

migrateOwner();