
let todos = [];
let currentFilter = "all";
let sortOrder = null;

let token = sessionStorage.getItem("token");

const authSection = document.querySelector("#authSection");
const todoSection = document.querySelector("#todoSection");
const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const authMessage = document.querySelector("#authMessage");
const logoutBtn = document.querySelector("#logoutBtn");

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


// AUTH HEADERS

function authHeaders() {
  return {
    Authorization: `Bearer ${token}`
  };
}


// SHOW LOGIN OR TODO SECTION

function showLogin() {
  token = null;
  sessionStorage.removeItem("token");

  todos = [];

  authSection.hidden = false;
  todoSection.hidden = true;
  logoutBtn.hidden = true;

  message.textContent = "";
  todoList.innerHTML = "";
}

function showTodos() {
  authSection.hidden = true;
  todoSection.hidden = false;
  logoutBtn.hidden = false;
}


// LOGIN

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  authMessage.textContent = "Logging in...";

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      authMessage.textContent =
        data.error || "Login failed";
      return;
    }

    token = data.token;

    sessionStorage.setItem("token", token);

    passwordInput.value = "";
    authMessage.textContent = "";

    showTodos();

    await loadTodos();

  } catch (error) {
    console.error(error);
    authMessage.textContent = "Server error";
  }
});


// LOGOUT

logoutBtn.addEventListener("click", () => {
  showLogin();
  authMessage.textContent = "Logged out successfully";
});


// LOAD TODOS

async function loadTodos() {
  try {
    const res = await fetch("/todos", {
      headers: authHeaders()
    });

    if (res.status === 401) {
      showLogin();
      authMessage.textContent = "Please login again";
      return false;
    }

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
    .filter(todo =>
      todo.text.toLowerCase().includes(
        searchInput.value.trim().toLowerCase()
      )
    )
    .sort((a, b) => {
      if (!sortOrder) return 0;

      const comparison = a.text.localeCompare(b.text);

      return sortOrder === "asc"
        ? comparison
        : -comparison;
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

  const left = todos.filter(todo => !todo.done).length;

  leftText.textContent = `${left} left`;

  Object.entries(filterButtons).forEach(([filter, button]) => {
    button.setAttribute(
      "aria-pressed",
      String(currentFilter === filter)
    );
  });

  sortButton.setAttribute(
    "aria-pressed",
    String(sortOrder !== null)
  );

  sortButton.textContent =
    sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z";
}


// ADD TODO

async function addTodo(text) {
  try {
    const res = await fetch("/todos", {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (res.status === 401) {
      showLogin();
      authMessage.textContent = "Please login again";
      return false;
    }

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
  const todo = todos.find(todo => todo.id === id);

  if (!todo) return;

  try {
    const res = await fetch(`/todos/${id}`, {
      method: "PATCH",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        done: !todo.done
      })
    });

    if (res.status === 401) {
      showLogin();
      authMessage.textContent = "Please login again";
      return;
    }

    if (!res.ok) {
      message.textContent = "Could not update";
      return;
    }

    message.textContent = "";

    await loadTodos();

  } catch (error) {
    console.error(error);
    message.textContent = "Server error";
  }
}


// DELETE TODO

async function deleteTodo(id) {
  try {
    const res = await fetch(`/todos/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    if (res.status === 401) {
      showLogin();
      authMessage.textContent = "Please login again";
      return;
    }

    if (!res.ok) {
      message.textContent = "Could not delete";
      return;
    }

    message.textContent = "";

    await loadTodos();

  } catch (error) {
    console.error(error);
    message.textContent = "Server error";
  }
}


// FILTER BUTTONS

Object.entries(filterButtons).forEach(([filter, button]) => {
  button.addEventListener("click", () => {
    currentFilter = filter;
    render();
  });
});


// SORT BUTTON

sortButton.addEventListener("click", () => {
  sortOrder = sortOrder === "asc" ? "desc" : "asc";
  render();
});


// SEARCH

searchInput.addEventListener("input", render);


// CLEAR COMPLETED TODOS

clearDoneButton.addEventListener("click", async () => {
  const completedTodos = todos.filter(todo => todo.done);

  if (completedTodos.length === 0) {
    return;
  }

  try {
    const responses = await Promise.all(
      completedTodos.map(todo =>
        fetch(`/todos/${todo.id}`, {
          method: "DELETE",
          headers: authHeaders()
        })
      )
    );

    if (responses.some(response => response.status === 401)) {
      showLogin();
      authMessage.textContent = "Please login again";
      return;
    }

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


// ADD TODO FORM

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


// CHECK EXISTING SESSION

if (token) {
  showTodos();
  loadTodos();
} else {
  showLogin();
}
