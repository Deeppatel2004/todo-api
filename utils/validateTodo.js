function validateTodo(body) {
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return {
      ok: false,
      message: "Todo text is required"
    };
  }

  return {
    ok: true
  };
}

module.exports = validateTodo;