
function healthBody(version, uptime) {
  return {
    status: "ok",
    version,
    uptime
  };
}

// Validate new todo
function validateTodo(body) {
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return { ok: false, error: "text is required" };
  }

  return { ok: true };
}

// MongoDB filter for GET /todos
function buildFilter(done) {
  if (done === "true") {
    return { done: true };
  }

  if (done === "false") {
    return { done: false };
  }

  return {};
}

// Add logged-in user's ID to the database filter
function ownerFilter(userId, filter = {}) {
  return {
    ...filter,
    owner: userId
  };
}

// Convert MongoDB document to public API format
function toPublicTodo(doc) {
  return {
    id: String(doc._id),
    text: doc.text,
    done: doc.done
  };
}

// Check MongoDB ObjectId
function isValidId(id) {
  return (
    typeof id === "string" &&
    /^[a-fA-F0-9]{24}$/.test(id)
  );
}

// Convert MongoDB document to public API format
function toPublic(doc) {
  return {
    id: doc._id.toString(),
    text: doc.text,
    done: doc.done
  };
}

// Prepare changes for PATCH /todos/:id
function cleanPatch(body) {
  const changes = {};

  if (!body || typeof body !== "object") {
    return changes;
  }

  if (typeof body.text === "string" && body.text.trim()) {
    changes.text = body.text.trim();
  }

  if (typeof body.done === "boolean") {
    changes.done = body.done;
  }

  return changes;
}

// Validate PATCH data
function validatePatch(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid changes" };
  }

  if (
    body.text !== undefined &&
    (typeof body.text !== "string" || !body.text.trim())
  ) {
    return { ok: false, error: "Invalid text" };
  }

  if (
    body.done !== undefined &&
    typeof body.done !== "boolean"
  ) {
    return { ok: false, error: "Invalid done value" };
  }

  return { ok: true };
}

// Keep the original error response format
function errorBody(status, message = "server error") {
  return {
    error: {
      status,
      message
    }
  };
}

function toPublicTodo(doc) {
  return {
    id: String(doc._id),
    text: doc.text,
    done: doc.done,
    
  };
}

module.exports = {
  validateTodo,
  buildFilter,
  ownerFilter,
  isValidId,
  toPublicTodo,
  cleanPatch,
  validatePatch,
  errorBody,
  healthBody
};
