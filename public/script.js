let todos = [];
let currentFilter = "all";
let sortOrder = null;

const todoInput = document.querySelector("#todoInput");
const todoForm = document.querySelector("#todoForm");
const searchInput = document.querySelector("#searchInput");
const todoList = document.querySelector("#todolist");
const leftText = document.querySelector("#left");
const message = document.querySelector("#message");
const filterButtons = {
  all: document.querySelector("#filterAll"),
  active: document.querySelector("#filterActive"),
  done: document.querySelector("#filterDone")
};
const sortButton = document.querySelector("#sortBtn");
const clearDoneButton = document.querySelector("#clearDoneBtn");


// LOAD TODOS FROM API

async function loadTodos() {
  try {
    const res = await fetch("/todos");

    if (!res.ok) {
      message.textContent = "Could not load todos";
      return false;
    }

    todos = await res.json();

    render();
    message.textContent = "";
    return true;

  } catch (error) {
    message.textContent = "Server error";
    console.error(error);
    return false;
  }
}


// RENDER

function render() {
  todoList.innerHTML = "";

  const visibleTodos = todos
    .filter(todo => {
      if (currentFilter === "active") return !todo.done;
      if (currentFilter === "done") return todo.done;
      return true;
    })
    .filter(todo => todo.text.toLocaleLowerCase().includes(searchInput.value.trim().toLocaleLowerCase()))
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const comparison = a.text.localeCompare(b.text);
      return sortOrder === "asc" ? comparison : -comparison;
    });

  visibleTodos.forEach(todo => {

    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = todo.text;

    if (todo.done) {
      span.classList.add("done");
    }

    // DONE BUTTON
    const doneBtn = document.createElement("button");
    doneBtn.textContent = todo.done ? "Undo" : "Done";

    doneBtn.addEventListener("click", () => {
      toggleTodo(todo.id);
    });


    // DELETE BUTTON
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
      deleteTodo(todo.id);
    });


    li.appendChild(span);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);

    todoList.appendChild(li);
  });


  // Count unfinished todos
  const left = todos.filter(todo => !todo.done).length;

  leftText.textContent = `${left} left`;

  Object.entries(filterButtons).forEach(([filter, button]) => {
    button.setAttribute("aria-pressed", String(currentFilter === filter));
  });
  sortButton.setAttribute("aria-pressed", String(sortOrder !== null));
  sortButton.textContent = sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z";
}

// ADD TODO

async function addTodo(text) {
  try {
    const res = await fetch("/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      message.textContent = "Could not add";
      return false;
    }

    message.textContent = "";
    await loadTodos();
    return true;
  } catch (error) {
    message.textContent = "Server error";
    console.error(error);
    return false;
  }
}

// TOGGLE TODO

async function toggleTodo(id) {

  // Find todo using ID
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return;
  }


  const res = await fetch(`/todos/${id}`, {

    method: "PATCH",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      done: !todo.done
    })
  });


  if (!res.ok) {
    message.textContent = "Could not update";
    return;
  }

  message.textContent = "";

  await loadTodos();
}


// DELETE TODO

async function deleteTodo(id) {

  const res = await fetch(`/todos/${id}`, {
    method: "DELETE"
  });


  if (!res.ok) {
    message.textContent = "Could not delete";
    return;
  }

  message.textContent = "";

  await loadTodos();
}

Object.entries(filterButtons).forEach(([filter, button]) => {
  button.addEventListener("click", () => {
    currentFilter = filter;
    render();
  });
});

sortButton.addEventListener("click", () => {
  sortOrder = sortOrder === "asc" ? "desc" : "asc";
  render();
});

searchInput.addEventListener("input", render);

clearDoneButton.addEventListener("click", async () => {
  const completedTodos = todos.filter(todo => todo.done);

  if (completedTodos.length === 0) {
    return;
  }

  try {
    const responses = await Promise.all(
      completedTodos.map(todo => fetch(`/todos/${todo.id}`, { method: "DELETE" }))
    );

    if (responses.some(response => !response.ok)) {
      await loadTodos();
      message.textContent = "Could not clear done todos";
      return;
    }

    message.textContent = "";
    await loadTodos();
  } catch (error) {
    console.error(error);
    await loadTodos();
    message.textContent = "Server error";
  }
});

// ADD TODO
todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();

  if (text === "") {
    return;
  }

  if (await addTodo(text)) {
    todoInput.value = "";
    todoInput.focus();
  }
});

loadTodos();