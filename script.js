document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const statusFilter = document.getElementById('statusFilter');
    const sortFilter = document.getElementById('sortFilter');
    const closeModal = document.querySelector('.close');
  
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
        li.innerHTML = `
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <p class="deadline">Дедлайн: ${task.deadline}</p>
          <div class="tags">${task.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
          <div class="status">${task.status === 'pending' ? 'В процессе' : 'Завершено'}</div>
          <button onclick="editTask('${task.id}')">Редактировать</button>
          <button onclick="deleteTask('${task.id}')">Удалить</button>
        `;
        taskList.appendChild(li);
      });
    };
  
    const showModal = (task = {}) => {
      taskModal.style.display = 'block';
      taskForm.title.value = task.title || '';
      taskForm.description.value = task.description || '';
      taskForm.deadline.value = task.deadline || '';
      taskForm.tags.value = task.tags ? task.tags.join(', ') : '';
      taskForm.status.value = task.status || 'pending';
      editingTaskId = task.id || null;
    };
  
    const hideModal = () => {
      taskModal.style.display = 'none';
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
  
    window.editTask = (id) => {
      const task = tasks.find(task => task.id === id);
      showModal(task);
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
    closeModal.addEventListener('click', hideModal);
  
    statusFilter.addEventListener('change', renderTasks);
    sortFilter.addEventListener('change', renderTasks);
  
    renderTasks();
  });
  