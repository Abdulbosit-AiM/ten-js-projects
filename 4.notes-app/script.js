// Enhanced Notes Application with Modern JavaScript
class NotesApp {
    constructor() {
        this.notes = this.loadNotes();
        this.addBtn = document.getElementById('add');
        this.notesContainer = document.body;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderNotes();
        this.addVisualEffects();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        this.addBtn.addEventListener('click', () => this.addNewNote());
        
        // Handle page visibility for auto-save
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveAllNotes();
            }
        });

        // Auto-save every 30 seconds
        setInterval(() => this.saveAllNotes(), 30000);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N for new note
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.addNewNote();
            }
            
            // Ctrl/Cmd + S for save all
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveAllNotes();
                this.showSaveNotification();
            }
        });
    }

    loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        return savedNotes ? JSON.parse(savedNotes) : [];
    }

    renderNotes() {
        // Remove existing notes
        document.querySelectorAll('.note').forEach(note => note.remove());
        
        if (this.notes.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        this.notes.forEach((noteText, index) => {
            this.createNoteElement(noteText, index);
        });
    }

    showEmptyState() {
        let emptyState = document.querySelector('.empty-state');
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <h2>📝 No Notes Yet</h2>
                <p>Create your first note to get started!</p>
                <button class="add-first-note" onclick="document.getElementById('add').click()">
                    Add Your First Note
                </button>
            `;
            document.body.appendChild(emptyState);
        }
        emptyState.style.display = 'block';
    }

    hideEmptyState() {
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    addNewNote(text = '') {
        const noteIndex = this.notes.length;
        this.notes.push(text);
        this.createNoteElement(text, noteIndex);
        this.hideEmptyState();
        this.updateLocalStorage();
        
        // Focus on the new note's textarea
        setTimeout(() => {
            const newNote = document.querySelectorAll('.note')[noteIndex];
            const textarea = newNote.querySelector('textarea');
            if (textarea && !textarea.classList.contains('hidden')) {
                textarea.focus();
            }
        }, 100);
    }

    createNoteElement(text = '', index) {
        const note = document.createElement('div');
        note.className = 'note';
        note.style.animationDelay = `${index * 0.1}s`;

        const isEditing = text === '';
        
        note.innerHTML = `
            <div class="toolbar">
                <button class="edit" title="Toggle Edit Mode (Ctrl+E)" aria-label="Edit note">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete" title="Delete Note (Delete)" aria-label="Delete note">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <main class="${isEditing ? 'hidden' : ''}" role="article"></main>
            <textarea class="${isEditing ? '' : 'hidden'}" 
                      placeholder="Start typing your note here... 
                      
Supports Markdown:
# Heading
**bold** *italic*
- List item
> Quote
\`code\`" 
                      aria-label="Note content"></textarea>
        `;

        const editBtn = note.querySelector('.edit');
        const deleteBtn = note.querySelector('.delete');
        const main = note.querySelector('main');
        const textArea = note.querySelector('textarea');

        // Set initial content
        textArea.value = text;
        main.innerHTML = this.parseMarkdown(text);

        // Event listeners
        editBtn.addEventListener('click', () => this.toggleEdit(main, textArea, editBtn));
        deleteBtn.addEventListener('click', () => this.deleteNote(note, index));
        textArea.addEventListener('input', (e) => this.handleTextInput(e, main, index));
        
        // Keyboard shortcuts for individual notes
        textArea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                editBtn.click();
            }
            if (e.key === 'Delete' && e.ctrlKey) {
                e.preventDefault();
                deleteBtn.click();
            }
            // Tab support in textarea
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textArea.selectionStart;
                const end = textArea.selectionEnd;
                textArea.value = textArea.value.substring(0, start) + '    ' + textArea.value.substring(end);
                textArea.selectionStart = textArea.selectionEnd = start + 4;
            }
        });

        // Auto-resize textarea
        textArea.addEventListener('input', () => this.autoResizeTextarea(textArea));

        document.body.appendChild(note);
        
        // Trigger animation
        requestAnimationFrame(() => {
            note.style.opacity = '1';
            note.style.transform = 'translateY(0) scale(1)';
        });
    }

    toggleEdit(main, textArea, editBtn) {
        const isEditing = !textArea.classList.contains('hidden');
        
        main.classList.toggle('hidden');
        textArea.classList.toggle('hidden');
        
        if (!isEditing) {
            textArea.focus();
            this.autoResizeTextarea(textArea);
            editBtn.innerHTML = '<i class="fas fa-eye"></i>';
            editBtn.title = 'Preview Mode';
        } else {
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit Mode';
        }
        
        // Add visual feedback
        editBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            editBtn.style.transform = 'scale(1)';
        }, 150);
    }

    deleteNote(noteElement, index) {
        // Confirmation dialog
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        // Animate deletion
        noteElement.classList.add('note-deleting');
        
        setTimeout(() => {
            noteElement.remove();
            this.notes.splice(index, 1);
            this.updateLocalStorage();
            
            // Re-render to fix indices
            this.renderNotes();
            
            this.showDeleteNotification();
        }, 300);
    }

    handleTextInput(e, main, index) {
        const { value } = e.target;
        
        // Update the rendered markdown
        main.innerHTML = this.parseMarkdown(value);
        
        // Update the notes array
        this.notes[index] = value;
        
        // Debounced save
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.updateLocalStorage();
        }, 1000);
    }

    parseMarkdown(text) {
        if (!text.trim()) {
            return '<p class="placeholder">Start typing to see your note...</p>';
        }

        // Simple markdown parser
        let html = text
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Handle lists
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Handle blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
        
        // Wrap in paragraphs if not already wrapped
        if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<blockquote')) {
            html = '<p>' + html + '</p>';
        }

        return html;
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
    }

    updateLocalStorage() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    saveAllNotes() {
        // Get all current textarea values
        document.querySelectorAll('.note').forEach((note, index) => {
            const textarea = note.querySelector('textarea');
            if (textarea && index < this.notes.length) {
                this.notes[index] = textarea.value;
            }
        });
        
        this.updateLocalStorage();
    }

    showSaveNotification() {
        this.showNotification('💾 All notes saved!', 'success');
    }

    showDeleteNotification() {
        this.showNotification('🗑️ Note deleted', 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: var(--spacing-6);
            right: var(--spacing-6);
            background: ${type === 'success' ? 'var(--success-color)' : 
                        type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
            color: white;
            padding: var(--spacing-3) var(--spacing-5);
            border-radius: var(--border-radius-lg);
            font-weight: 500;
            z-index: 1001;
            animation: notificationSlide 3s ease-out forwards;
            box-shadow: var(--shadow-lg);
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
            
            .placeholder {
                color: var(--neutral-400);
                font-style: italic;
                text-align: center;
                padding: var(--spacing-8);
            }
            
            .note textarea:focus {
                outline: 2px solid var(--primary-color);
                outline-offset: -2px;
            }
            
            .note main a {
                color: var(--primary-color);
                text-decoration: underline;
            }
            
            .note main a:hover {
                color: var(--primary-hover);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});