
function validateTodo(body) {
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return { ok: false, error: "text is required" };
  }

  return { ok: true };
}

function nextId(todos) {
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

function findIndexById(todos, id) {
  return todos.findIndex(todo => todo.id === Number(id));
}

function applyPatch(todo, body) {
  if (typeof body.text === "string" && body.text.trim()) {
    todo.text = body.text.trim();
  }

  if (typeof body.done === "boolean") {
    todo.done = body.done;
  }

  return todo;
}

function filterByQuery(todos, done) {
  if (done === undefined) return todos;
  if (done === "true") return todos.filter(todo => todo.done === true);
  if (done === "false") return todos.filter(todo => todo.done === false);
  return todos;
}

function errorBody(status, message = "server error") {
  return {
    error: {
      status,
      message
    }
  };
}

module.exports = {
  validateTodo,
  nextId,
  findIndexById,
  applyPatch,
  filterByQuery,
  errorBody
};