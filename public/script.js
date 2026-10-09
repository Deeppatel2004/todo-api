let todos = [];

const todoInput = document.querySelector("#todoInput");
const addBtn = document.querySelector("#addBtn");
const todoList = document.querySelector("#todoList");
const leftText = document.querySelector("#left");
const message = document.querySelector("#message");


// LOAD TODOS FROM API

async function loadTodos() {
  try {
    const res = await fetch("/todos");

    if (!res.ok) {
      message.textContent = "Could not load todos";
      return;
    }

    todos = await res.json();

    render();

  } catch (error) {
    message.textContent = "Server error";
    console.log(error);
  }
}


// RENDER

function render() {
  todoList.innerHTML = "";

  todos.forEach(todo => {

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
}

// ADD TODO

async function addTodo(text) {

  const res = await fetch("/todos", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      text: text
    })
  });


  if (!res.ok) {
    message.textContent = "Could not add";
    return;
  }

  message.textContent = "";

  await loadTodos();
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


// ADD BUTTON

addBtn.addEventListener("click", async () => {

  const text = todoInput.value.trim();

  if (text === "") {
    return;
  }

  await addTodo(text);

  todoInput.value = "";
  todoInput.focus();
});


// ENTER KEY

todoInput.addEventListener("keydown", async (event) => {

  if (event.key === "Enter") {

    const text = todoInput.value.trim();

    if (text === "") {
      return;
    }

    await addTodo(text);

    todoInput.value = "";
  }
});

loadTodos();