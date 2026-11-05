const mongoose = require("mongoose");

async function connectTestDB() {
  if (!process.env.TEST_MONGODB_URI) {
    throw new Error("TEST_MONGODB_URI is missing");
  }

  await mongoose.connect(process.env.TEST_MONGODB_URI);

  if (mongoose.connection.name !== "todo_test") {
    throw new Error("Connected to the wrong database!");
  }

  console.log("Test database:", mongoose.connection.name);
}

async function disconnectTestDB() {
  await mongoose.disconnect();
}

module.exports = {
  connectTestDB,
  disconnectTestDB
};