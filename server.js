
const express = require("express");

const todoRoutes = require("./routes/todos");
const { logLine } = require("./logger");
const { getPort } = require("./config");
const { errorBody } = require("./helpers");

const PORT = getPort(process.env);
const app = express();

app.use(express.json());

// Log requests
app.use((req, res, next) => {
  const log = logLine(req.method, req.url, res.statusCode);
  console.log(log);
  next();
});

// Serve frontend
app.use(express.static("public"));

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

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json(
      errorBody(400, "invalid JSON")
    );
  }

  res.status(500).json(errorBody(500));
});

app.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`);
});