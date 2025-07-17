const Lists = [];

const cardWrapper = document.getElementById("cardWrapper");
function renderListCard(list, index) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <form data-index="${index}">
      <div class="card-header">
       <div class="card-title">
  <input type="text" class="list-title" value="${
    list.title
  }" placeholder="Add Title"/>
  <div class="list-actions">
    <i class="fa-solid fa-square-check select-all" title="Select All Tasks"></i>
    <i class="fa-regular fa-square unselect-all" title="Unselect All Tasks"></i>
    <i class="fa-solid fa-trash-can delete-selected" title="Delete Selected Tasks"></i>
  </div>
</div>

        <div class="delete-icon" style="color: gray; cursor: pointer;"><i class="fas fa-trash"></i></div>
      </div>
      <div class="duedate">
        <input type="date" class="list-date" value="${
          list.dueDate.toISOString().split("T")[0]
        }" />
       <div >
        <i class="fa-solid  fa-arrow-up-a-z"  onclick="sortListsByAlphabet('asc',${index})"></i>
        <i class="fa-solid  fa-arrow-up-z-a"  onclick="sortListsByAlphabet('desc',${index})"></i></div>
      </div>
      <div class="list" id="taskList-${index}">
        ${list.tasks
          .map(
            (task, taskIndex) => `
          <div class="list-item" data-task-index="${taskIndex}">
            <input type="checkbox" class="custom-checkbox" ${
              task.status ? "checked" : ""
            }>
            <input type="text" class="task-input" value="${task.taskName}" />
                <span class="delete-task" title="Delete Task">&times;</span>

          </div>
        `
          )
          .join("")}
        <div class="list-item">
          <input type="checkbox" class="custom-checkbox" disabled>
          <input type="text" class="task-input new-task" placeholder="Add a task">
        </div>
      </div>
    </form>
  `;

  const form = card.querySelector("form");
  const listContainer = card.querySelector(`#taskList-${index}`);

  //  Add new task on Enter
  listContainer.addEventListener("keydown", function (e) {
    if (e.target.classList.contains("new-task") && e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (!value) return;

      Lists[index].tasks.push({ status: false, taskName: value });
      renderAllCards();
    }
  });

  //  Update task name or checkbox status on input change
  form.addEventListener("input", function (e) {
    const item = e.target.closest(".list-item");
    const taskIndex = item?.getAttribute("data-task-index");

    if (taskIndex !== null && taskIndex !== undefined) {
      const task = Lists[index].tasks[taskIndex];

      if (e.target.type === "text") {
        task.taskName = e.target.value;
      } else if (e.target.type === "checkbox") {
        task.status = e.target.checked;
        const taskInput = item.querySelector(".task-input");
        if (taskInput) {
          taskInput.style.textDecoration = e.target.checked
            ? "line-through"
            : "none";
          taskInput.style.color = e.target.checked ? "gray" : "black";
        }
      }
    }
  });
  //update title of new list
  form.addEventListener("input", function (e) {
    const index = form.getAttribute("data-index");
    const listIndex = parseInt(index, 10);
    console.log(listIndex);

    if (!isNaN(listIndex)) {
      if (e.target.classList.contains("list-title")) {
        Lists[listIndex].title = e.target.value;
      }

      if (e.target.classList.contains("list-date")) {
        Lists[listIndex].dueDate = new Date(e.target.value);
      }
    }
  });

  //  Delete individual task on click
  listContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-task")) {
      const item = e.target.closest(".list-item");
      const taskIndex = item?.getAttribute("data-task-index");

      if (taskIndex !== null && taskIndex !== undefined) {
        console.log("deleted btn clicked");
        Lists[index].tasks.splice(taskIndex, 1); // Remove the task
        renderAllCards(); // Re-render the updated list
      }
    }
  });

  //  Delete full list
  card.querySelector(".delete-icon").addEventListener("click", () => {
    Lists.splice(index, 1);
    renderAllCards();
  });

  const selectAllBtn = card.querySelector(".select-all");
  const unselectAllBtn = card.querySelector(".unselect-all");
  const deleteSelectedBtn = card.querySelector(".delete-selected");

  // Select all tasks (mark as completed)
 selectAllBtn.addEventListener("click", () => {
  const listContainer = document.querySelector(`#taskList-${index}`);
  
  Lists[index].tasks.forEach((task, taskIndex) => {
    task.status = true;

    const listItem = listContainer.querySelector(`[data-task-index="${taskIndex}"]`);
    if (listItem) {
      const checkbox = listItem.querySelector(".custom-checkbox");
      const taskInput = listItem.querySelector(".task-input");

      if (checkbox) checkbox.checked = true;

      if (taskInput) {
        taskInput.style.textDecoration = "line-through";
        taskInput.style.color = "gray";
      }
    }
  });
});


  // Unselect all tasks (mark as not completed)
  unselectAllBtn.addEventListener("click", () => {
    Lists[index].tasks.forEach((task) => (task.status = false));
    renderAllCards();
  });

  // Delete selected (checked/completed) tasks
  deleteSelectedBtn.addEventListener("click", () => {
    Lists[index].tasks = Lists[index].tasks.filter((task) => !task.status);
    renderAllCards();
  });

  return card;
}

function performSearch() {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const filteredLists = Lists.filter((list) => {
    const titleMatch = list.title.toLowerCase().includes(query);
    const taskMatch = list.tasks.some((task) =>
      task.taskName.toLowerCase().includes(query)
    );
    return titleMatch || taskMatch;
  });

  renderAllCards(filteredLists);
}
function handleSortOption(option) {
  let sorted = [...Lists];

  if (option === "alpha-asc") {
    sorted.sort((a, b) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );
  } else if (option === "alpha-desc") {
    sorted.sort((a, b) =>
      b.title.toLowerCase().localeCompare(a.title.toLowerCase())
    );
  } else if (option === "date-asc") {
    sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (option === "date-desc") {
    sorted.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  } else if (option === "completed") {
    sorted = sorted.map((list) => ({
      ...list,
      tasks: list.tasks.filter((task) => task.status === true),
    }));
  } else if (option === "Incompleted") {
    sorted = sorted.map((list) => ({
      ...list,
      tasks: list.tasks.filter((task) => task.status === false),
    }));
  }

  renderAllCards(sorted);
}

function sortListsByAlphabet(order, index) {
  const sortedTasks = [...Lists[index].tasks];

  sortedTasks.sort((a, b) => {
    const nameA = a.taskName.toLowerCase();
    const nameB = b.taskName.toLowerCase();
    return order === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });
  console.log(sortedTasks);

  const sortedList = Lists.slice();
  sortedList[index].tasks = sortedTasks;
  renderAllCards(sortedList);
}

function renderAllCards(data = Lists) {
  cardWrapper.innerHTML = "";
  data.forEach((list, i) => {
    cardWrapper.appendChild(renderListCard(list, i));
  });
}

function addNewList() {
  Lists.push({
    title: "New List",
    dueDate: new Date(),
    tasks: [],
  });
  renderAllCards();
}

renderAllCards();
