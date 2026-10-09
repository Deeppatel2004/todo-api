
const express = require("express");
const { load, save } = require("./storage");
const { logLine } = require("./logger");
const { getPort } = require("./config");
const { errorBody } = require("./errors");

const PORT = getPort(process.env);
const app = express();

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  const log = logLine(req.method, req.url, res.statusCode);
  console.log(log);
  next();
});

// Show frontend
app.use(express.static("public"));

let todos = load();

// Find todo by ID
function findIndexById(todos, id) {
  return todos.findIndex(todo => todo.id === Number(id));
}

// Filter todos
function filterByQuery(todos, done) {
  if (done === undefined) {
    return todos;
  }

  if (done === "true") {
    return todos.filter(todo => todo.done === true);
  }

  if (done === "false") {
    return todos.filter(todo => todo.done === false);
  }

  return todos;
}

// Apply PATCH
function applyPatch(todo, body) {
  if (typeof body.done === "boolean") {
    todo.done = body.done;
  }

  if (typeof body.text === "string" && body.text.trim() !== "") {
    todo.text = body.text.trim();
  }

  return todo;
}

// GET /todos
app.get("/todos", (req, res) => {
  res.json(filterByQuery(todos, req.query.done));
});

// GET /todos/:id
app.get("/todos/:id", (req, res) => {
  const i = findIndexById(todos, req.params.id);

  if (i === -1) {
    return res.status(404).json({
      error: "not found"
    });
  }

  res.json(todos[i]);
});

// POST /todos
app.post("/todos", (req, res) => {
  const text = req.body.text;

  if (typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({
      error: "text is required"
    });
  }

  const todo = {
    id: Date.now(),
    text: text.trim(),
    done: false
  };

  todos.push(todo);
  save(todos);

  res.status(201).json(todo);
});

// PATCH /todos/:id
app.patch("/todos/:id", (req, res) => {
  const i = findIndexById(todos, req.params.id);

  if (i === -1) {
    return res.status(404).json({
      error: "not found"
    });
  }

  applyPatch(todos[i], req.body);

  save(todos);

  res.json(todos[i]);
});

// DELETE /todos/:id
app.delete("/todos/:id", (req, res) => {
  const i = findIndexById(todos, req.params.id);

  if (i === -1) {
    return res.status(404).json({
      error: "not found"
    });
  }

  todos.splice(i, 1);

  save(todos);

  res.status(204).end();
});

// STEP 3: 404 for unknown routes
app.use((req, res) => {
  res.status(404).json(
    errorBody(404, "route not found")
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`);
});