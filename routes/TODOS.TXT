
const express = require("express");
const router = express.Router();

const Todo = require("../models/Todo");

const {
  validateTodo,
  validatePatch,
  buildFilter,
  isValidId,
  toPublic,
  cleanPatch,
  errorBody
} = require("../helpers");

// GET /todos
router.get("/", async (req, res) => {
  try {
    const docs = await Todo.find(
      buildFilter(req.query.done)
    );

    res.status(200).json(docs.map(toPublic));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorBody(500));
  }
});

// POST /todos
router.post("/", async (req, res) => {
  try {
    const validation = validateTodo(req.body);

    if (!validation.ok) {
      return res.status(400).json(
        errorBody(400, validation.error)
      );
    }

    const doc = await Todo.create({
      text: req.body.text.trim()
    });

    res.status(201).json(toPublic(doc));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorBody(500));
  }
});

// GET /todos/:id
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    const doc = await Todo.findById(req.params.id);

    if (!doc) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    res.status(200).json(toPublic(doc));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorBody(500));
  }
});

// PATCH /todos/:id
router.patch("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    const validation = validatePatch(req.body);

    if (!validation.ok) {
      return res.status(400).json(
        errorBody(400, validation.error)
      );
    }

    const doc = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: cleanPatch(req.body) },
      { new: true, runValidators: true }
    );

    if (!doc) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    res.status(200).json(toPublic(doc));
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json(
        errorBody(400, "Invalid changes")
      );
    }

    res.status(500).json(errorBody(500));
  }
});

// DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    const doc = await Todo.findByIdAndDelete(
      req.params.id
    );

    if (!doc) {
      return res.status(404).json(
        errorBody(404, "not found")
      );
    }

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json(errorBody(500));
  }
});

module.exports = router;
