const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const Todo = require("../models/Todo");

const {
  validateTodo,
  validatePatch,
  buildFilter,
  ownerFilter,
  isValidId,
  toPublicTodo,
  cleanPatch,
  errorBody
} = require("../helpers");

// GET /todos
router.get("/", requireAuth, async (req, res) => {
  try {
    const docs = await Todo.find(
      ownerFilter(req.user.id, buildFilter(req.query.done))
    );

    res.status(200).json(docs.map(toPublicTodo));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorBody(500));
  }
});

// POST /todos
router.post("/", requireAuth, async (req, res) => {
  try {
    const validation = validateTodo(req.body);

    if (!validation.ok) {
      return res.status(400).json(
        errorBody(400, validation.error)
      );
    }

    const doc = await Todo.create({
      text: req.body.text.trim(),
      owner: req.user.id
    });

    res.status(201).json(toPublicTodo(doc));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorBody(500));
  }
});

// GET /todos/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json(errorBody(404, "not found"));
    }

    const doc = await Todo.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!doc) {
      return res.status(404).json(errorBody(404, "not found"));
    }

    res.status(200).json(toPublicTodo(doc));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorBody(500));
  }
});

// PATCH /todos/:id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    // Check whether the ID is valid
    if (!isValidId(req.params.id)) {
      return res.status(404).json(errorBody(404, "not found"));
    }

    // Validate the incoming data
    const validation = validatePatch(req.body);

    if (!validation.ok) {
      return res.status(400).json(
        errorBody(400, validation.error)
      );
    }

    // Update only the logged-in user's todo
    const doc = await Todo.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      {
        $set: cleanPatch(req.body)
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    // Check whether the todo exists
    if (!doc) {
      return res.status(404).json(errorBody(404, "not found"));
    }

    // Return the updated todo
    res.status(200).json(toPublicTodo(doc));

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
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json(errorBody(404, "not found"));
    }

    const doc = await Todo.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!doc) {
      return res.status(404).json(errorBody(404, "not found"));
    }

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json(errorBody(500));
  }
});

module.exports = router;