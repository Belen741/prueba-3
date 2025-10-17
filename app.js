const clockElement = document.getElementById("clock");
const taskForm = document.getElementById("new-task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const tipButton = document.getElementById("tip-button");
const tipText = document.getElementById("tip-text");

const TIPS = [
  "Respira hondo tres veces y concéntrate en la primera tarea.",
  "Utiliza bloques de 25 minutos para mantener el enfoque.",
  "Antes de terminar el día, escribe una idea para mañana.",
  "Celebra una victoria pequeña: tómate 30 segundos para reconocerla.",
  "Despeja tu espacio de trabajo; las buenas ideas necesitan sitio.",
  "Sal a caminar cinco minutos para recargar tu energía creativa.",
];

const STORAGE_KEY = "planificador-diario-tareas";

function updateClock() {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  clockElement.textContent = formatted;
}

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.warn("No se pudieron recuperar las tareas guardadas", error);
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.completed = task.completed;
  li.innerHTML = `
    <span>${task.text}</span>
    <div>
      <button type="button" data-action="toggle">${
        task.completed ? "Reactivar" : "Completar"
      }</button>
      <button type="button" data-action="delete">Eliminar</button>
    </div>
  `;
  return li;
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  tasks.forEach((task) => {
    fragment.appendChild(createTaskElement(task));
  });
  taskList.appendChild(fragment);
}

function getTasksFromDOM() {
  return Array.from(taskList.children).map((item) => ({
    text: item.querySelector("span").textContent,
    completed: item.dataset.completed === "true",
  }));
}

function addTask(text) {
  const task = { text, completed: false };
  const currentTasks = getTasksFromDOM();
  currentTasks.push(task);
  renderTasks(currentTasks);
  saveTasks(currentTasks);
}

function toggleTask(taskElement) {
  const currentTasks = getTasksFromDOM();
  const index = Array.from(taskList.children).indexOf(taskElement);
  if (index === -1) return;
  currentTasks[index].completed = !currentTasks[index].completed;
  renderTasks(currentTasks);
  saveTasks(currentTasks);
}

function deleteTask(taskElement) {
  const currentTasks = getTasksFromDOM();
  const index = Array.from(taskList.children).indexOf(taskElement);
  if (index === -1) return;
  currentTasks.splice(index, 1);
  renderTasks(currentTasks);
  saveTasks(currentTasks);
}

function showRandomTip() {
  const randomIndex = Math.floor(Math.random() * TIPS.length);
  const tip = TIPS[randomIndex];
  tipText.textContent = tip;
}

// Inicialización
updateClock();
setInterval(updateClock, 1000);

const initialTasks = loadTasks();
renderTasks(initialTasks);

if (initialTasks.length) {
  tipText.textContent = "Excelente, tienes un registro listo para avanzar.";
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;
  addTask(value);
  taskInput.value = "";
  taskInput.focus();
});

taskList.addEventListener("click", (event) => {
  const button = event.target;
  if (!(button instanceof HTMLButtonElement)) return;
  const action = button.dataset.action;
  const taskElement = button.closest(".task-item");
  if (!taskElement) return;

  if (action === "toggle") {
    toggleTask(taskElement);
  } else if (action === "delete") {
    deleteTask(taskElement);
  }
});

tipButton.addEventListener("click", () => {
  showRandomTip();
  tipButton.disabled = true;
  tipButton.textContent = "¡Aquí tienes otra idea!";
  setTimeout(() => {
    tipButton.disabled = false;
    tipButton.textContent = "Muéstrame una idea";
  }, 1200);
});

showRandomTip();
