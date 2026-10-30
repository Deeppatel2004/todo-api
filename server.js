require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { healthBody, errorBody } = require("./helpers");
const todoRoutes = require("./routes/todos");
const authRoutes = require("./routes/auth");
const { logLine } = require("./logger");
const { getPort } = require("./config");

const PORT = getPort(process.env);
const app = express();

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(logLine(req.method, req.url, res.statusCode));
  });
  next();
});

// Health route
app.get("/health", (req, res) => {
  res.json(healthBody("1.0.0", process.uptime()));
});

// Serve frontend
app.use(express.static("public"));

// Mount authentication routes
app.use("/auth", authRoutes);


// Mount todo routes
app.use("/todos", todoRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json(errorBody(404, "not found"));
});

// Handle malformed JSON and other errors
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json(
      errorBody(400, "invalid JSON")
    );
  }

  console.error("Server error:", err.message);
  res.status(500).json(errorBody(500));
});

// MongoDB connection + server startup
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    console.log("db connected");

    app.listen(PORT, () => {
      console.log(`server on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("db connection failed:", err.message);
    process.exit(1);
  }
}

startServer();