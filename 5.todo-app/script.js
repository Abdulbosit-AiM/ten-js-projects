// Enhanced Todo Application with Modern JavaScript
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.elements = {};
        this.filters = {
            all: () => true,
            active: (todo) => !todo.completed,
            completed: (todo) => todo.completed
        };
        this.currentFilter = 'all';
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.renderTodos();
        this.updateStats();
        this.addVisualEffects();
        this.setupKeyboardShortcuts();
    }

    cacheElements() {
        this.elements = {
            form: document.getElementById('form'),
            input: document.getElementById('input'),
            todosUL: document.getElementById('todos'),
            container: document.querySelector('.todo-container')
        };
    }

    setupEventListeners() {
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Auto-save on page unload
        window.addEventListener('beforeunload', () => this.saveTodos());
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveTodos();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + A to select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target !== this.elements.input) {
                e.preventDefault();
                this.toggleAllTodos();
            }
            
            // Ctrl/Cmd + Shift + C to clear completed
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.clearCompleted();
            }
            
            // Number keys for filters
            if (e.key >= '1' && e.key <= '3' && !e.target.matches('input')) {
                e.preventDefault();
                const filters = ['all', 'active', 'completed'];
                this.setFilter(filters[parseInt(e.key) - 1]);
            }
        });
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    handleSubmit(e) {
        e.preventDefault();
        this.addTodo();
    }

    addTodo(todoData = null) {
        const todoText = todoData ? todoData.text : this.elements.input.value.trim();
        
        if (!todoText) return;

        const todo = {
            id: Date.now() + Math.random(),
            text: todoText,
            completed: todoData ? todoData.completed : false,
            createdAt: new Date().toISOString(),
            completedAt: todoData && todoData.completed ? new Date().toISOString() : null
        };

        this.todos.unshift(todo); // Add to beginning for better UX
        this.elements.input.value = '';
        this.renderTodos();
        this.updateStats();
        this.saveTodos();
        
        // Show success feedback
        this.showNotification('✅ Todo added!', 'success');
    }

    renderTodos() {
        this.elements.todosUL.innerHTML = '';
        
        const filteredTodos = this.todos.filter(this.filters[this.currentFilter]);
        
        if (filteredTodos.length === 0) {
            this.showEmptyState();
            return;
        }

        filteredTodos.forEach((todo, index) => {
            this.createTodoElement(todo, index);
        });
    }

    createTodoElement(todo, index) {
        const todoEl = document.createElement('li');
        todoEl.className = todo.completed ? 'completed' : '';
        todoEl.style.animationDelay = `${index * 0.05}s`;
        
        // Create todo content
        const todoContent = document.createElement('span');
        todoContent.textContent = todo.text;
        todoContent.className = 'todo-text';
        
        // Add priority indicator if text contains priority markers
        if (todo.text.includes('!!!')) {
            todoEl.classList.add('priority-high');
        } else if (todo.text.includes('!!')) {
            todoEl.classList.add('priority-medium');
        } else if (todo.text.includes('!')) {
            todoEl.classList.add('priority-low');
        }
        
        todoEl.appendChild(todoContent);

        // Event listeners
        todoEl.addEventListener('click', (e) => {
            if (e.target === todoEl || e.target === todoContent) {
                this.toggleTodo(todo.id);
            }
        });

        todoEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.deleteTodo(todo.id, todoEl);
        });

        // Double-click to edit
        todoEl.addEventListener('dblclick', () => {
            this.editTodo(todo.id, todoEl);
        });

        // Add hover effects
        todoEl.addEventListener('mouseenter', () => {
            if (!todo.completed) {
                todoEl.style.transform = 'translateX(8px)';
            }
        });

        todoEl.addEventListener('mouseleave', () => {
            todoEl.style.transform = 'translateX(0)';
        });

        this.elements.todosUL.appendChild(todoEl);
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.completedAt = todo.completed ? new Date().toISOString() : null;
            
            this.renderTodos();
            this.updateStats();
            this.saveTodos();
            
            // Show feedback
            const message = todo.completed ? '✅ Todo completed!' : '↩️ Todo reopened!';
            this.showNotification(message, todo.completed ? 'success' : 'info');
        }
    }

    deleteTodo(id, element) {
        // Add removal animation
        element.classList.add('removing');
        
        setTimeout(() => {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.renderTodos();
            this.updateStats();
            this.saveTodos();
            
            this.showNotification('🗑️ Todo deleted!', 'error');
        }, 300);
    }

    editTodo(id, element) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-input';
        input.style.cssText = `
            width: 100%;
            border: none;
            background: transparent;
            font-size: inherit;
            font-family: inherit;
            color: inherit;
            outline: 2px solid var(--primary-color);
            padding: var(--spacing-2);
            border-radius: var(--border-radius-sm);
        `;

        const originalContent = element.innerHTML;
        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== todo.text) {
                todo.text = newText;
                this.saveTodos();
                this.showNotification('✏️ Todo updated!', 'info');
            }
            this.renderTodos();
        };

        const cancelEdit = () => {
            element.innerHTML = originalContent;
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    toggleAllTodos() {
        const allCompleted = this.todos.every(todo => todo.completed);
        
        this.todos.forEach(todo => {
            todo.completed = !allCompleted;
            todo.completedAt = todo.completed ? new Date().toISOString() : null;
        });
        
        this.renderTodos();
        this.updateStats();
        this.saveTodos();
        
        const message = allCompleted ? '↩️ All todos reopened!' : '✅ All todos completed!';
        this.showNotification(message, allCompleted ? 'info' : 'success');
    }

    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('ℹ️ No completed todos to clear', 'info');
            return;
        }

        if (confirm(`Delete ${completedCount} completed todo${completedCount > 1 ? 's' : ''}?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.renderTodos();
            this.updateStats();
            this.saveTodos();
            
            this.showNotification(`🗑️ ${completedCount} completed todo${completedCount > 1 ? 's' : ''} deleted!`, 'success');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderTodos();
        this.updateFilterButtons();
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const active = total - completed;

        // Create or update stats element
        let statsEl = this.elements.container.querySelector('.stats');
        if (!statsEl) {
            statsEl = document.createElement('div');
            statsEl.className = 'stats';
            this.elements.container.appendChild(statsEl);
        }

        statsEl.innerHTML = `
            <div class="stats-item">
                <span class="stats-number">${total}</span>
                <span>Total</span>
            </div>
            <div class="stats-item">
                <span class="stats-number">${active}</span>
                <span>Active</span>
            </div>
            <div class="stats-item">
                <span class="stats-number">${completed}</span>
                <span>Done</span>
            </div>
            ${completed > 0 ? `
                <button class="clear-completed" onclick="todoApp.clearCompleted()">
                    Clear Done
                </button>
            ` : ''}
        `;
    }

    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        const messages = {
            all: { icon: '📝', title: 'No todos yet', text: 'Add your first todo above!' },
            active: { icon: '✅', title: 'All done!', text: 'You\'ve completed all your todos.' },
            completed: { icon: '🎯', title: 'No completed todos', text: 'Complete some todos to see them here.' }
        };
        
        const message = messages[this.currentFilter];
        
        emptyState.innerHTML = `
            <div class="icon">${message.icon}</div>
            <h3>${message.title}</h3>
            <p>${message.text}</p>
        `;
        
        this.elements.todosUL.appendChild(emptyState);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: var(--spacing-6);
            right: var(--spacing-6);
            background: ${type === 'success' ? 'var(--success-color)' : 
                        type === 'error' ? 'var(--error-color)' : 
                        type === 'info' ? 'var(--primary-color)' : 'var(--neutral-600)'};
            color: white;
            padding: var(--spacing-3) var(--spacing-5);
            border-radius: var(--border-radius-lg);
            font-weight: 500;
            z-index: 1001;
            animation: notificationSlide 3s ease-out forwards;
            box-shadow: var(--shadow-lg);
            font-size: 0.875rem;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    addVisualEffects() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlide {
                0% { transform: translateX(100%); opacity: 0; }
                10%, 90% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            
            .priority-high::before {
                border-color: var(--error-color) !important;
                background: var(--error-color);
            }
            
            .priority-medium::before {
                border-color: var(--warning-color) !important;
                background: var(--warning-color);
            }
            
            .priority-low::before {
                border-color: var(--accent-color) !important;
                background: var(--accent-color);
            }
            
            .edit-input {
                animation: editFocus 0.2s ease-out;
            }
            
            @keyframes editFocus {
                from { transform: scale(0.95); }
                to { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});