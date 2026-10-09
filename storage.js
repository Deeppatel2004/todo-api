
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "todos.json");

function load() {
  try {
    const data = fs.readFileSync(FILE, "utf8");
    const todos = JSON.parse(data);

    return Array.isArray(todos) ? todos : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    if (error instanceof SyntaxError) {
      return [];
    }

    throw error;
  }
}

function save(todos) {
  fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

module.exports = { load, save };