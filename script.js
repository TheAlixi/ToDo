document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const taskHeader = document.getElementById('taskHeader');
    const sumbitButton = document.getElementById('sumbitBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const statusFilter = document.getElementById('statusFilter');
    const sortFilter = document.getElementById('sortFilter');
    const closeModal = document.querySelector('.close');
    const openFiltersButton = document.getElementById('openFilters');
    
    let filtersOpened = false;
    let buttonCurrentColor = '';
    let anim = false;
  
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let editingTaskId = null;
  
    const saveTasks = () => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    };
  
    const renderTasks = () => {
      taskList.innerHTML = '';
      const filteredTasks = tasks.filter(task => {
        if (statusFilter.value === 'all') return true;
        return task.status === statusFilter.value;
      });
  
      filteredTasks.sort((a, b) => {
        if (sortFilter.value === 'createdAt') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortFilter.value === 'title') {
          return a.title.localeCompare(b.title);
        }
      });
  
      filteredTasks.forEach(task => {
        const li = document.createElement('li');

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
      if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
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
  
      const task = {
        id: editingTaskId || Date.now().toString(),
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
  
    cancelBtn.addEventListener('click', hideModal);
    openFiltersButton.addEventListener('click', openCloseFilters);

    statusFilter.addEventListener('change', renderTasks);
    sortFilter.addEventListener('change', renderTasks);
  
    renderTasks();

    $('.filters').fadeOut(0);
  });
  