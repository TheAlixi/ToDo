document.addEventListener('DOMContentLoaded', () => {
  const taskList = document.getElementById('taskList');
  const taskModal = document.getElementById('taskModal');
  const taskForm = document.getElementById('taskForm');
  const taskHeader = document.getElementById('taskHeader');
  const sumbitButton = document.getElementById('sumbitBtn');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const openFiltersButton = document.getElementById('openFilters');
  const exportCsvBtn = document.getElementById('exportCSV');
  const importCsvBtn = document.getElementById('importCSV');
  const statusFilter = document.getElementById('statusFilter');
  const sortFilter = document.getElementById('sortFilter');
  const tagFilter = document.getElementById('tagFilter');
  const searchQuery = document.getElementById('searchQuery');

  const importFile = document.getElementById('importFile');
  
  let filtersOpened = false;
  let buttonCurrentColor = '';
  let anim = false;

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let editingTaskId = null;

  document.getElementById('money').addEventListener('click', (e) => {
      e.preventDefault();
      addTag('Финансы');
  });
  document.getElementById('sport').addEventListener('click', (e) => {
      e.preventDefault();
      addTag('Спорт');
  });
  document.getElementById('work').addEventListener('click', (e) => {
      e.preventDefault();
      addTag('Работа');
  });
  document.getElementById('education').addEventListener('click', (e) => {
      e.preventDefault();
      addTag('Учёба');
  });
  document.getElementById('house').addEventListener('click', (e) => {
      e.preventDefault();
      addTag('Дом');
  });
  document.getElementById('flowers').addEventListener('click', (e) => {
      e.preventDefault();
      addTag('Цветы');
  });

  function addTag(tag) {
      const tagsInput = taskForm.tags;
      let currentTags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);

      // Проверяем, есть ли уже выбранный тег из готовых кнопок
      const predefinedTags = ['Финансы', 'Спорт', 'Работа', 'Учёба', 'Дом', 'Цветы'];

      // Если тег из готовых, заменяем его на новый
      if (predefinedTags.includes(tag)) {
          const index = currentTags.findIndex(t => predefinedTags.includes(t));
          if (index !== -1) {
              currentTags[index] = tag;
          } else {
              currentTags.unshift(tag);
          }
      } else {
          // Если тег не из готовых, просто добавляем его, если его нет в списке
          if (!currentTags.includes(tag)) {
              currentTags.push(tag);
          }
      }

      tagsInput.value = currentTags.join(', ');
  }

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const renderTasks = () => {
    const searchQueryValue = searchQuery.value.toLowerCase();

    taskList.innerHTML = '';
    const filteredTasks = tasks.filter(task => {
      if (statusFilter.value !== 'all' && task.status !== statusFilter.value) {
          return false;
      }

      if (tagFilter.value !== 'all') {
          const predefinedTags = {
              'fin': 'Финансы',
              'sp': 'Спорт',
              'work': 'Работа',
              'edu': 'Учёба',
              'home': 'Дом',
              'fl': 'Цветы'
          };
          const selectedTag = predefinedTags[tagFilter.value];
          return task.tags.includes(selectedTag);
      }

      if (searchQueryValue && !task.title.toLowerCase().includes(searchQueryValue) && !task.description.toLowerCase().includes(searchQueryValue)) {
          return false;
      }

      return true;
    });

    filteredTasks.sort((a, b) => {
      if (sortFilter.value === 'createdAt') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortFilter.value === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortFilter.value === 'deadline_b') {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortFilter.value === 'deadline_d') {
        return new Date(b.deadline) - new Date(a.deadline);
      }
    });

    filteredTasks.forEach(task => {
      const li = document.createElement('li');

      let taskClass = 'task-item';
      const predefinedTags = {
          'Финансы': 'fin',
          'Спорт': 'sp',
          'Работа': 'work',
          'Учёба': 'edu',
          'Дом': 'home',
          'Цветы': 'fl'
      };

      const taskTags = task.tags.filter(tag => predefinedTags[tag]);
      if (taskTags.length > 0) {
          const tagClass = predefinedTags[taskTags[0]];
          taskClass += ` ${tagClass}`;
      }

      li.className = taskClass;

      if (task.status === 'pending') {
        li.innerHTML = `
          <h3>${task.title}</h3>
          <p class="description">${task.description}</p>
          <p class="deadline">Дедлайн: ${task.deadline}</p>
          <div class="tags">${task.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
          <div class="down">
            <div class="status" style="background-color: #FE5F55;">${task.status === 'pending' ? 'В процессе' : 'Завершено'}</div>
            <button onclick="showTask('${task.id}')"><img src="res/show.png" alt="" width="16px"/></button>
            <button onclick="editTask('${task.id}')"><img src="res/edit.png" alt="" width="16px"/></button>
            <button onclick="deleteTask('${task.id}')"><img src="res/bin.png" alt="" width="16px"/></button>
          </div>
        `;
      } else {
        li.innerHTML = `
          <h3>${task.title}</h3>
          <p class="description">${task.description}</p>
          <p class="deadline">Дедлайн: ${task.deadline}</p>
          <div class="tags">${task.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
          <div class="down">
            <div class="status">${task.status === 'pending' ? 'В процессе' : 'Завершено'}</div>
            <button onclick="showTask('${task.id}')"><img src="res/show.png" alt="" width="16px"/></button>
            <button onclick="editTask('${task.id}')"><img src="res/edit.png" alt="" width="16px"/></button>
            <button onclick="deleteTask('${task.id}')"><img src="res/bin.png" alt="" width="16px"/></button>
          </div>
        `;
      }

      taskList.appendChild(li);
    });
  };

  const showModal = (task = {}) => {
    $('#taskModal').fadeIn(200);
    taskModal.style.display = 'flex';
    taskForm.title.value = task.title || '';
    taskForm.description.value = task.description || '';
    taskForm.deadline.value = task.deadline || '';
    taskForm.tags.value = task.tags ? task.tags.join(', ') : '';
    taskForm.status.value = task.status || 'pending';

    taskForm.title.disabled = false;
    taskForm.description.disabled = false;
    taskForm.deadline.disabled = false;
    taskForm.tags.disabled = false;
    taskForm.status.disabled = false;

    $('.helptags').css({'display': 'flex'});

    taskHeader.textContent = "Добавить/Редактировать задачу";
    sumbitButton.textContent = "Сохранить";
    cancelBtn.style.display = "inline";

    editingTaskId = task.id || null;
  };

  const showTaskRead = (task = {}) => {
    $('#taskModal').fadeIn(200);
    taskModal.style.display = 'flex';
    taskForm.title.value = task.title || '';
    taskForm.description.value = task.description || '';
    taskForm.deadline.value = task.deadline || '';
    taskForm.tags.value = task.tags ? task.tags.join(', ') : '';
    taskForm.status.value = task.status || 'pending';

    $('.helptags').css({'display': 'none'});

    taskForm.title.disabled = true;
    taskForm.description.disabled = true;
    taskForm.deadline.disabled = true;
    taskForm.tags.disabled = true;
    taskForm.status.disabled = true;

    taskHeader.textContent = "Просмотр задачи";
    sumbitButton.textContent = "Закрыть";
    cancelBtn.style.display = "none";

    editingTaskId = task.id || null;
  }

  const exportTasksToCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Deadline', 'Tags', 'Status', 'Created At', 'Updated At'];
    const rows = tasks.map(task => [
        task.id,
        task.title,
        task.description,
        task.deadline,
        task.tags.join(','),
        task.status,
        task.createdAt,
        task.updatedAt
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importTasksFromCSV = (csvContent) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    const requiredHeaders = ['ID', 'Title', 'Description', 'Deadline', 'Tags', 'Status', 'Created At', 'Updated At'];
    if (!requiredHeaders.every(header => headers.includes(header))) {
        alert('Загруженный файл не является допустимым CSV файлом задач.');
        return;
    }

    const importedTasks = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length === headers.length) {
            const task = {
                id: values[0] || Date.now().toString() + i,
                title: values[1],
                description: values[2],
                deadline: values[3],
                tags: values[4].split(','),
                status: values[5],
                createdAt: values[6],
                updatedAt: values[7],
                history: []
            };
            importedTasks.push(task);
        }
    }

    if (importedTasks.length === 0) {
        alert('Файл не содержит задач.');
        return;
    }

    tasks = [...tasks, ...importedTasks];
    saveTasks();
    renderTasks();
  };

  const hideModal = () => {
    $('#taskModal').fadeOut(200);
    taskForm.reset();
    editingTaskId = null;
  };

  const addTask = (task) => {
    tasks.push(task);
    saveTasks();
    renderTasks();
  };

  const updateTask = (id, updatedTask) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask };
      saveTasks();
      renderTasks();
    }
  };

  const deleteTask = (id) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу? (Дубликаты задачи тоже будут удалены)')) {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
      renderTasks();
    }
  };
  
  const openCloseFilters = () => {
    if (!anim) {
      if (!filtersOpened) {
        anim = true;

        $('#openFilters img').attr('src', 'res/close.png');

        $('.filters').fadeIn(100);

        filtersOpened = true;
        anim = false;
      } else {
        anim = true;

        $('#openFilters img').attr('src', 'res/setting.png');

        $('.filters').fadeOut(100);

        filtersOpened = false;
        anim = false;
      }
    }
  }

  window.editTask = (id) => {
    const task = tasks.find(task => task.id === id);
    showModal(task);
  };

  window.showTask = (id) => {
    const task = tasks.find(task => task.id === id);
    showTaskRead(task);
  };

  window.deleteTask = (id) => {
    deleteTask(id);
  };

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskForm.title.value.trim();
    const description = taskForm.description.value.trim();
    const deadline = taskForm.deadline.value;
    const tags = taskForm.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const status = taskForm.status.value;

    if (!title) {
      alert('Название задачи не может быть пустым');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      alert('Дедлайн должен быть в формате YYYY-MM-DD');
      return;
    }

    if (tags.length === 0) {
      alert('Теги не могут быть пустыми');
      return;
    }

    if (tags.length > 4) {
      alert('Максимальное количество тегов: 4');
      return;
    }

    if(title.length > 30) {
      alert('Название задачи не может быть длинее 30 символов');
      return;
    }

    if(description.length > 200) {
      alert('Описание задачи не может быть длинее 200 символов');
      return;
    }

    const predefinedTags = ['Финансы', 'Спорт', 'Работа', 'Учёба', 'Дом', 'Цветы'];
    const duplicateTags = tags.filter(tag => predefinedTags.includes(tag));
    if (duplicateTags.length > 1) {
      alert('Нельзя дублировать теги из готовых кнопок!');
      return;
    }

    const task = {
      id: editingTaskId || Date.now().toString(), // Убедитесь, что у задачи есть уникальный идентификатор
      title,
      description,
      deadline,
      tags,
      status,
      createdAt: editingTaskId ? tasks.find(task => task.id === editingTaskId).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: editingTaskId ? tasks.find(task => task.id === editingTaskId).history : []
    };


    if (editingTaskId) {
        task.history.push({ action: 'updated', timestamp: new Date().toISOString() });
        updateTask(editingTaskId, task);
    } else {
        task.history.push({ action: 'created', timestamp: new Date().toISOString() });
        addTask(task);
    }

    hideModal();
  });

  addTaskBtn.addEventListener('click', () => {
    showModal();
  });

  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvContent = event.target.result;
            importTasksFromCSV(csvContent);
        };
        reader.readAsText(file);
    }

    e.target.value = '';
  });

  cancelBtn.addEventListener('click', hideModal);
  openFiltersButton.addEventListener('click', openCloseFilters);
  exportCsvBtn.addEventListener('click', exportTasksToCSV);
  importCsvBtn.addEventListener('click', () => {
    importFile.click();
  });

  statusFilter.addEventListener('change', renderTasks);
  sortFilter.addEventListener('change', renderTasks);
  tagFilter.addEventListener('change', renderTasks);

  searchQuery.addEventListener('input', renderTasks);


  renderTasks();

  $('.filters').fadeOut(0);
});