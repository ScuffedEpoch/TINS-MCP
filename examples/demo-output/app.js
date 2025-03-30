// Todo App JavaScript

// Task data model
class Task {
    constructor(id, title, completed = false) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        this.createdAt = new Date();
    }
}

// Main application controller
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;

        // DOM elements
        this.taskList = document.getElementById('task-list');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.itemsLeftSpan = document.getElementById('items-left');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.taskModal = document.getElementById('task-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.taskTitleInput = document.getElementById('task-title');
        this.saveTaskBtn = document.getElementById('save-task-btn');
        this.cancelTaskBtn = document.getElementById('cancel-task-btn');

        this.loadTasks();
        this.registerEventListeners();
        this.renderTasks();
    }

    // Load tasks from localStorage
    loadTasks() {
        const savedTasks = localStorage.getItem('todos');
        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);
                // Convert string dates back to Date objects
                this.tasks.forEach(task => {
                    task.createdAt = new Date(task.createdAt);
                });
            } catch (e) {
                console.error('Error loading tasks from localStorage:', e);
                this.tasks = [];
            }
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('todos', JSON.stringify(this.tasks));
    }

    // Register all event listeners
    registerEventListeners() {
        // Add task button
        this.addTaskBtn.addEventListener('click', () => this.openTaskModal());

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
            });
        });

        // Modal save button
        this.saveTaskBtn.addEventListener('click', () => this.saveTask());

        // Modal cancel button
        this.cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.taskModal) {
                this.closeTaskModal();
            }
        });

        // Handle escape key for modal
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.taskModal.classList.contains('visible')) {
                this.closeTaskModal();
            }
        });
    }

    // Generate a unique ID for new tasks
    generateTaskId() {
        return Date.now().toString();
    }

    // Create a new task
    createTask(title) {
        const task = new Task(this.generateTaskId(), title);
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
    }

    // Update an existing task
    updateTask(id, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Delete a task
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    // Toggle task completion status
    toggleTaskCompletion(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Set the current filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update UI to show selected filter
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
        
        this.renderTasks();
    }

    // Get filtered tasks based on the current filter
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    // Render the task list
    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        this.taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '<div class="empty-state">No tasks to display</div>';
        } else {
            filteredTasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                this.taskList.appendChild(taskElement);
            });
        }

        // Update items left count
        const activeCount = this.tasks.filter(task => !task.completed).length;
        this.itemsLeftSpan.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    }

    // Create a DOM element for a task
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'task-completed' : ''}`;
        taskElement.dataset.id = task.id;

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
        checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));

        // Title
        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;
        titleSpan.addEventListener('click', () => this.openTaskModal(task));

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-task-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.setAttribute('aria-label', `Delete task "${task.title}"`);
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        // Add elements to task item
        taskElement.appendChild(checkbox);
        taskElement.appendChild(titleSpan);
        taskElement.appendChild(deleteBtn);

        return taskElement;
    }

    // Open the task modal (for add or edit)
    openTaskModal(taskToEdit = null) {
        this.editingTaskId = taskToEdit ? taskToEdit.id : null;
        this.modalTitle.textContent = taskToEdit ? 'Edit Task' : 'Add Task';
        this.taskTitleInput.value = taskToEdit ? taskToEdit.title : '';
        this.taskModal.classList.add('visible');
        this.taskTitleInput.focus();
    }

    // Close the task modal
    closeTaskModal() {
        this.taskModal.classList.remove('visible');
        this.taskTitleInput.value = '';
        this.editingTaskId = null;
    }

    // Save the current task (add new or update existing)
    saveTask() {
        const title = this.taskTitleInput.value.trim();
        if (!title) return;

        if (this.editingTaskId) {
            // Update existing task
            this.updateTask(this.editingTaskId, { title });
        } else {
            // Create new task
            this.createTask(title);
        }

        this.closeTaskModal();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TodoApp();
});
