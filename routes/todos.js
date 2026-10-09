
const express = require("express");
const router = express.Router();

const { load, save } = require("../storage");

const {
  validateTodo,
  nextId,
  findIndexById,
  applyPatch,
  filterByQuery,
  errorBody
} = require("../helpers");

// GET /todos
router.get("/", (req, res) => {
  try {
    const todos = load();
    const filtered = filterByQuery(todos, req.query.done);

    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json(errorBody(500));
  }
});

// POST /todos
router.post("/", (req, res) => {
  try {
    const todos = load();
    const validation = validateTodo(req.body);

    if (!validation.ok) {
      return res.status(400).json(
        errorBody(400, validation.error)
      );
    }

    const todo = {
      id: nextId(todos),
      text: req.body.text.trim(),
      done: false
    };

    todos.push(todo);
    save(todos);

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json(errorBody(500));
  }
});

// GET /todos/:id
router.get("/:id", (req, res) => {
  try {
    const todos = load();
    const index = findIndexById(todos, req.params.id);

    if (index === -1) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    res.status(200).json(todos[index]);
  } catch (error) {
    res.status(500).json(errorBody(500));
  }
});

// PATCH /todos/:id
router.patch("/:id", (req, res) => {
  try {
    const todos = load();
    const index = findIndexById(todos, req.params.id);

    if (index === -1) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    applyPatch(todos[index], req.body || {});
    save(todos);

    res.status(200).json(todos[index]);
  } catch (error) {
    res.status(500).json(errorBody(500));
  }
});

// DELETE /todos/:id
router.delete("/:id", (req, res) => {
  try {
    const todos = load();
    const index = findIndexById(todos, req.params.id);

    if (index === -1) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    todos.splice(index, 1);
    save(todos);

    res.status(204).end();
  } catch (error) {
    res.status(500).json(errorBody(500));
  }
});

module.exports = router;