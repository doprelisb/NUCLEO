// Função para alternar visibilidade da senha
function togglePassword(inputId) {
  const input = document.getElementById(inputId)
  const button = input.parentElement.querySelector(".toggle-password")
  const icon = button.querySelector(".eye-icon")

  if (input.type === "password") {
    input.type = "text"
    icon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `
  } else {
    input.type = "password"
    icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `
  }
}

// Função para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para mostrar erro
function showError(inputId, message) {
  const input = document.getElementById(inputId)
  const errorElement = document.getElementById(inputId + "-error")

  input.classList.add("error")
  input.classList.remove("success")
  errorElement.textContent = message
}

// Função para limpar erro
function clearError(inputId) {
  const input = document.getElementById(inputId)
  const errorElement = document.getElementById(inputId + "-error")

  input.classList.remove("error")
  input.classList.add("success")
  errorElement.textContent = ""
}

// Função para validar formulário de cadastro
function validateCadastroForm(formData) {
  let isValid = true

  // Validar nome
  if (!formData.nome.trim()) {
    showError("nome", "Nome completo é obrigatório")
    isValid = false
  } else if (formData.nome.trim().length < 2) {
    showError("nome", "Nome deve ter pelo menos 2 caracteres")
    isValid = false
  } else {
    clearError("nome")
  }

  // Validar email
  if (!formData.email.trim()) {
    showError("email", "Email é obrigatório")
    isValid = false
  } else if (!isValidEmail(formData.email)) {
    showError("email", "Email inválido")
    isValid = false
  } else {
    clearError("email")
  }

  // Validar senha
  if (!formData.senha) {
    showError("senha", "Senha é obrigatória")
    isValid = false
  } else if (formData.senha.length < 6) {
    showError("senha", "Senha deve ter pelo menos 6 caracteres")
    isValid = false
  } else {
    clearError("senha")
  }

  // Validar confirmação de senha
  if (!formData.confirmarSenha) {
    showError("confirmarSenha", "Confirmação de senha é obrigatória")
    isValid = false
  } else if (formData.senha !== formData.confirmarSenha) {
    showError("confirmarSenha", "Senhas não coincidem")
    isValid = false
  } else {
    clearError("confirmarSenha")
  }

  return isValid
}

// Função para validar formulário de login
function validateLoginForm(formData) {
  let isValid = true

  // Validar email
  if (!formData.email.trim()) {
    showError("email", "Email é obrigatório")
    isValid = false
  } else if (!isValidEmail(formData.email)) {
    showError("email", "Email inválido")
    isValid = false
  } else {
    clearError("email")
  }

  // Validar senha
  if (!formData.senha) {
    showError("senha", "Senha é obrigatória")
    isValid = false
  } else {
    clearError("senha")
  }

  return isValid
}

// Função para mostrar loading
function showLoading(buttonId) {
  const button = document.getElementById(buttonId)
  const btnText = button.querySelector(".btn-text")
  const spinner = button.querySelector(".loading-spinner")

  button.disabled = true
  btnText.style.display = "none"
  spinner.style.display = "block"
}

// Função para esconder loading
function hideLoading(buttonId, originalText) {
  const button = document.getElementById(buttonId)
  const btnText = button.querySelector(".btn-text")
  const spinner = button.querySelector(".loading-spinner")

  button.disabled = false
  btnText.style.display = "block"
  btnText.textContent = originalText
  spinner.style.display = "none"
}

// Função para mostrar modal de sucesso
function showSuccessModal() {
  document.getElementById("successModal").style.display = "flex"
}

// Função para redirecionar para login
function redirectToLogin() {
  window.location.href = "login.html"
}

// Application State
const AppState = {
  currentView: "dashboard",
  currentViewType: "grid",
  notes: [],
  tasks: [],
  collections: ["projetos", "ideias"],
  theme: "dark",
  sidebarCollapsed: false,
}

// Utility Functions
const Utils = {
  generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

  formatDate: (date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  },

  formatDateTime: (date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  },

  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  saveToStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  },

  loadFromStorage: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error("Error loading from localStorage:", error)
      return defaultValue
    }
  },
}

// DOM Elements
const Elements = {
  sidebar: document.getElementById("sidebar"),
  sidebarToggle: document.getElementById("sidebarToggle"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  currentView: document.getElementById("currentView"),
  contentArea: document.getElementById("contentArea"),
  globalSearch: document.getElementById("globalSearch"),
  settingsBtn: document.getElementById("settingsBtn"),
  modalOverlay: document.getElementById("modalOverlay"),

  // View containers
  dashboardView: document.getElementById("dashboardView"),
  notesView: document.getElementById("notesView"),
  tasksView: document.getElementById("tasksView"),
  calendarView: document.getElementById("calendarView"),

  // Modals
  noteModal: document.getElementById("noteModal"),
  taskModal: document.getElementById("taskModal"),
  settingsModal: document.getElementById("settingsModal"),

  // Stats
  notesCount: document.getElementById("notesCount"),
  tasksCount: document.getElementById("tasksCount"),
  projectsCount: document.getElementById("projectsCount"),

  // Grids
  notesGrid: document.getElementById("notesGrid"),
  kanbanBoard: document.getElementById("kanbanBoard"),
  calendarGrid: document.getElementById("calendarGrid"),
}

// Navigation System
const Navigation = {
  init() {
    // Navigation items
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const view = item.dataset.view || item.dataset.collection
        if (view) {
          this.switchView(view)
        }
      })
    })

    // View controls
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const viewType = btn.dataset.viewType
        this.switchViewType(viewType)
      })
    })

    // Mobile menu
    Elements.mobileMenuBtn.addEventListener("click", () => {
      Elements.sidebar.classList.toggle("active")
    })

    // Sidebar toggle
    Elements.sidebarToggle.addEventListener("click", () => {
      AppState.sidebarCollapsed = !AppState.sidebarCollapsed
      Elements.sidebar.classList.toggle("collapsed", AppState.sidebarCollapsed)
    })
  },

  switchView(view) {
    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelector(`[data-view="${view}"], [data-collection="${view}"]`)?.classList.add("active")

    // Update view containers
    document.querySelectorAll(".view-container").forEach((container) => {
      container.classList.remove("active")
    })

    const viewContainer = document.getElementById(`${view}View`)
    if (viewContainer) {
      viewContainer.classList.add("active")
    }

    // Update breadcrumb
    Elements.currentView.textContent = this.getViewTitle(view)

    // Update app state
    AppState.currentView = view

    // Load view data
    this.loadViewData(view)

    // Close mobile menu
    Elements.sidebar.classList.remove("active")
  },

  switchViewType(viewType) {
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-view-type="${viewType}"]`).classList.add("active")

    AppState.currentViewType = viewType

    // Apply view type to current content
    if (AppState.currentView === "notes") {
      Notes.render()
    } else if (AppState.currentView === "tasks") {
      Tasks.render()
    }
  },

  getViewTitle(view) {
    const titles = {
      dashboard: "Dashboard",
      notes: "Notas",
      tasks: "Tarefas",
      calendar: "Calendário",
      projetos: "Projetos",
      ideias: "Ideias",
    }
    return titles[view] || view
  },

  loadViewData(view) {
    switch (view) {
      case "dashboard":
        Dashboard.render()
        break
      case "notes":
        Notes.render()
        break
      case "tasks":
        Tasks.render()
        break
      case "calendar":
        Calendar.render()
        break
      default:
        // Handle collections
        break
    }
  },
}

// Dashboard Module
const Dashboard = {
  render() {
    this.updateStats()
    this.renderRecentActivity()
  },

  updateStats() {
    Elements.notesCount.textContent = AppState.notes.length
    Elements.tasksCount.textContent = AppState.tasks.length
    Elements.projectsCount.textContent = AppState.collections.length
  },

  renderRecentActivity() {
    const recentActivity = document.getElementById("recentActivity")

    // Get recent items (last 5)
    const recentItems = [
      ...AppState.notes.slice(-3).map((note) => ({
        type: "note",
        title: `Nova nota: ${note.title}`,
        time: note.updatedAt,
        icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>`,
      })),
      ...AppState.tasks.slice(-2).map((task) => ({
        type: "task",
        title: `Nova tarefa: ${task.title}`,
        time: task.createdAt,
        icon: `<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)

    if (recentItems.length === 0) {
      recentActivity.innerHTML = `
        <div class="activity-item">
          <div class="activity-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="6" x2="12" y2="12"/>
              <line x1="16.24" y1="16.24" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="activity-content">
            <div class="activity-title">Nenhuma atividade recente</div>
            <div class="activity-time">Comece criando uma nota ou tarefa</div>
          </div>
        </div>
      `
      return
    }

    recentActivity.innerHTML = recentItems
      .map(
        (item) => `
      <div class="activity-item">
        <div class="activity-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            ${item.icon}
          </svg>
        </div>
        <div class="activity-content">
          <div class="activity-title">${item.title}</div>
          <div class="activity-time">${this.getRelativeTime(item.time)}</div>
        </div>
      </div>
    `,
      )
      .join("")
  },

  getRelativeTime(date) {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Agora mesmo"
    if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? "s" : ""}`
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? "s" : ""}`
    return `Há ${days} dia${days > 1 ? "s" : ""}`
  },
}

// Notes Module
const Notes = {
  currentNote: null,

  init() {
    // New note button
    document.getElementById("newNoteBtn").addEventListener("click", () => {
      this.openNoteModal()
    })

    // Quick action
    document.querySelector('[data-action="new-note"]').addEventListener("click", () => {
      this.openNoteModal()
    })

    // Note modal events
    document.getElementById("closeNoteModal").addEventListener("click", () => {
      this.closeNoteModal()
    })

    document.getElementById("cancelNote").addEventListener("click", () => {
      this.closeNoteModal()
    })

    document.getElementById("saveNote").addEventListener("click", () => {
      this.saveNote()
    })

    // Toolbar events
    document.querySelectorAll(".toolbar-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const format = btn.dataset.format
        this.formatText(format)
      })
    })

    // Tag input
    document.getElementById("tagInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        this.addTag()
      }
    })
  },

  render() {
    const grid = Elements.notesGrid

    if (AppState.currentViewType === "list") {
      grid.classList.add("list-view")
    } else {
      grid.classList.remove("list-view")
    }

    if (AppState.notes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 64px; height: 64px; color: var(--text-muted); margin-bottom: 1rem;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Nenhuma nota encontrada</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Comece criando sua primeira nota</p>
          <button class="primary-btn" onclick="Notes.openNoteModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova Nota
          </button>
        </div>
      `
      return
    }

    grid.innerHTML = AppState.notes.map((note) => this.createNoteCard(note)).join("")
  },

  createNoteCard(note) {
    const preview = note.content.replace(/<[^>]*>/g, "").substring(0, 150)
    const tags = note.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")

    return `
      <div class="note-card" onclick="Notes.openNoteModal('${note.id}')">
        <div class="note-card-header">
          <h3 class="note-title">${note.title}</h3>
          <button class="note-menu" onclick="event.stopPropagation(); Notes.showNoteMenu('${note.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>
        <div class="note-preview">${preview}${preview.length >= 150 ? "..." : ""}</div>
        <div class="note-footer">
          <div class="note-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 14px; height: 14px;">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            ${Utils.formatDate(new Date(note.updatedAt))}
          </div>
          <div class="note-tags">${tags}</div>
        </div>
      </div>
    `
  },

  openNoteModal(noteId = null) {
    this.currentNote = noteId ? AppState.notes.find((n) => n.id === noteId) : null

    const modal = Elements.noteModal
    const title = document.getElementById("noteModalTitle")
    const titleInput = document.getElementById("noteTitleInput")
    const editor = document.getElementById("noteEditor")
    const tagsContainer = document.getElementById("tagsContainer")

    if (this.currentNote) {
      title.textContent = "Editar Nota"
      titleInput.value = this.currentNote.title
      editor.innerHTML = this.currentNote.content
      this.renderTags(this.currentNote.tags)
    } else {
      title.textContent = "Nova Nota"
      titleInput.value = ""
      editor.innerHTML = ""
      this.renderTags([])
    }

    Elements.modalOverlay.classList.add("active")
    modal.style.display = "flex"
    titleInput.focus()
  },

  closeNoteModal() {
    Elements.modalOverlay.classList.remove("active")
    Elements.noteModal.style.display = "none"
    this.currentNote = null
  },

  saveNote() {
    const titleInput = document.getElementById("noteTitleInput")
    const editor = document.getElementById("noteEditor")
    const title = titleInput.value.trim()
    const content = editor.innerHTML

    if (!title) {
      titleInput.focus()
      return
    }

    const tags = Array.from(document.querySelectorAll(".tag-item")).map((tag) =>
      tag.textContent.replace("×", "").trim(),
    )

    const now = new Date().toISOString()

    if (this.currentNote) {
      // Update existing note
      const index = AppState.notes.findIndex((n) => n.id === this.currentNote.id)
      AppState.notes[index] = {
        ...this.currentNote,
        title,
        content,
        tags,
        updatedAt: now,
      }
    } else {
      // Create new note
      const newNote = {
        id: Utils.generateId(),
        title,
        content,
        tags,
        createdAt: now,
        updatedAt: now,
      }
      AppState.notes.unshift(newNote)
    }

    this.saveNotes()
    this.closeNoteModal()
    this.render()
    Dashboard.updateStats()
  },

  deleteNote(noteId) {
    if (confirm("Tem certeza que deseja excluir esta nota?")) {
      AppState.notes = AppState.notes.filter((n) => n.id !== noteId)
      this.saveNotes()
      this.render()
      Dashboard.updateStats()
    }
  },

  formatText(format) {
    document.execCommand(format, false, null)

    // Update toolbar button state
    document.querySelectorAll(".toolbar-btn").forEach((btn) => {
      btn.classList.remove("active")
    })

    if (document.queryCommandState(format)) {
      document.querySelector(`[data-format="${format}"]`).classList.add("active")
    }
  },

  addTag() {
    const input = document.getElementById("tagInput")
    const tag = input.value.trim()

    if (tag && !this.hasTag(tag)) {
      this.renderTags([...this.getCurrentTags(), tag])
      input.value = ""
    }
  },

  removeTag(tag) {
    const currentTags = this.getCurrentTags().filter((t) => t !== tag)
    this.renderTags(currentTags)
  },

  getCurrentTags() {
    return Array.from(document.querySelectorAll(".tag-item")).map((tag) => tag.textContent.replace("×", "").trim())
  },

  hasTag(tag) {
    return this.getCurrentTags().includes(tag)
  },

  renderTags(tags) {
    const container = document.getElementById("tagsContainer")
    container.innerHTML = tags
      .map(
        (tag) => `
      <div class="tag-item">
        ${tag}
        <button class="tag-remove" onclick="Notes.removeTag('${tag}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `,
      )
      .join("")
  },

  showNoteMenu(noteId) {
    // Simple implementation - could be enhanced with a proper context menu
    if (confirm("Deseja excluir esta nota?")) {
      this.deleteNote(noteId)
    }
  },

  saveNotes() {
    Utils.saveToStorage("nucleo_notes", AppState.notes)
  },

  loadNotes() {
    AppState.notes = Utils.loadFromStorage("nucleo_notes", [])
  },
}

// Tasks Module
const Tasks = {
  currentTask: null,

  init() {
    // New task button
    document.getElementById("newTaskBtn").addEventListener("click", () => {
      this.openTaskModal()
    })

    // Quick action
    document.querySelector('[data-action="new-task"]').addEventListener("click", () => {
      this.openTaskModal()
    })

    // Task modal events
    document.getElementById("closeTaskModal").addEventListener("click", () => {
      this.closeTaskModal()
    })

    document.getElementById("cancelTask").addEventListener("click", () => {
      this.closeTaskModal()
    })

    document.getElementById("saveTask").addEventListener("click", () => {
      this.saveTask()
    })
  },

  render() {
    this.renderKanbanBoard()
    this.updateTaskCounts()
  },

  renderKanbanBoard() {
    const todoColumn = document.getElementById("todoColumn")
    const doingColumn = document.getElementById("doingColumn")
    const doneColumn = document.getElementById("doneColumn")

    const todoTasks = AppState.tasks.filter((task) => task.status === "todo")
    const doingTasks = AppState.tasks.filter((task) => task.status === "doing")
    const doneTasks = AppState.tasks.filter((task) => task.status === "done")

    todoColumn.innerHTML = todoTasks.map((task) => this.createTaskCard(task)).join("")
    doingColumn.innerHTML = doingTasks.map((task) => this.createTaskCard(task)).join("")
    doneColumn.innerHTML = doneTasks.map((task) => this.createTaskCard(task)).join("")

    if (todoTasks.length === 0) {
      todoColumn.innerHTML = '<div class="empty-column">Nenhuma tarefa</div>'
    }
    if (doingTasks.length === 0) {
      doingColumn.innerHTML = '<div class="empty-column">Nenhuma tarefa</div>'
    }
    if (doneTasks.length === 0) {
      doneColumn.innerHTML = '<div class="empty-column">Nenhuma tarefa</div>'
    }
  },

  createTaskCard(task) {
    const dueDate = task.dueDate ? Utils.formatDate(new Date(task.dueDate)) : ""
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

    return `
      <div class="task-card priority-${task.priority} ${isOverdue ? "overdue" : ""}" 
           onclick="Tasks.openTaskModal('${task.id}')"
           draggable="true"
           ondragstart="Tasks.handleDragStart(event, '${task.id}')"
           ondragend="Tasks.handleDragEnd(event)">
        <div class="task-header">
          <h4 class="task-title">${task.title}</h4>
          <button class="task-menu" onclick="event.stopPropagation(); Tasks.showTaskMenu('${task.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ""}
        <div class="task-footer">
          ${
            dueDate
              ? `
            <div class="task-due-date ${isOverdue ? "overdue" : ""}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 12px; height: 12px;">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              ${dueDate}
            </div>
          `
              : ""
          }
          <div class="task-priority ${task.priority}">${this.getPriorityLabel(task.priority)}</div>
        </div>
      </div>
    `
  },

  updateTaskCounts() {
    const todoCount = AppState.tasks.filter((task) => task.status === "todo").length
    const doingCount = AppState.tasks.filter((task) => task.status === "doing").length
    const doneCount = AppState.tasks.filter((task) => task.status === "done").length

    document.querySelector('[data-status="todo"] .task-count').textContent = todoCount
    document.querySelector('[data-status="doing"] .task-count').textContent = doingCount
    document.querySelector('[data-status="done"] .task-count').textContent = doneCount
  },

  openTaskModal(taskId = null) {
    this.currentTask = taskId ? AppState.tasks.find((t) => t.id === taskId) : null

    const modal = Elements.taskModal
    const title = document.getElementById("taskModalTitle")
    const titleInput = document.getElementById("taskTitleInput")
    const description = document.getElementById("taskDescription")
    const priority = document.getElementById("taskPriority")
    const status = document.getElementById("taskStatus")
    const dueDate = document.getElementById("taskDueDate")

    if (this.currentTask) {
      title.textContent = "Editar Tarefa"
      titleInput.value = this.currentTask.title
      description.value = this.currentTask.description || ""
      priority.value = this.currentTask.priority
      status.value = this.currentTask.status
      dueDate.value = this.currentTask.dueDate || ""
    } else {
      title.textContent = "Nova Tarefa"
      titleInput.value = ""
      description.value = ""
      priority.value = "medium"
      status.value = "todo"
      dueDate.value = ""
    }

    Elements.modalOverlay.classList.add("active")
    modal.style.display = "flex"
    titleInput.focus()
  },

  closeTaskModal() {
    Elements.modalOverlay.classList.remove("active")
    Elements.taskModal.style.display = "none"
    this.currentTask = null
  },

  saveTask() {
    const titleInput = document.getElementById("taskTitleInput")
    const description = document.getElementById("taskDescription")
    const priority = document.getElementById("taskPriority")
    const status = document.getElementById("taskStatus")
    const dueDate = document.getElementById("taskDueDate")

    const title = titleInput.value.trim()

    if (!title) {
      titleInput.focus()
      return
    }

    const now = new Date().toISOString()

    if (this.currentTask) {
      // Update existing task
      const index = AppState.tasks.findIndex((t) => t.id === this.currentTask.id)
      AppState.tasks[index] = {
        ...this.currentTask,
        title,
        description: description.value.trim(),
        priority: priority.value,
        status: status.value,
        dueDate: dueDate.value || null,
        updatedAt: now,
      }
    } else {
      // Create new task
      const newTask = {
        id: Utils.generateId(),
        title,
        description: description.value.trim(),
        priority: priority.value,
        status: status.value,
        dueDate: dueDate.value || null,
        createdAt: now,
        updatedAt: now,
      }
      AppState.tasks.unshift(newTask)
    }

    this.saveTasks()
    this.closeTaskModal()
    this.render()
    Dashboard.updateStats()
  },

  deleteTask(taskId) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      AppState.tasks = AppState.tasks.filter((t) => t.id !== taskId)
      this.saveTasks()
      this.render()
      Dashboard.updateStats()
    }
  },

  moveTask(taskId, newStatus) {
    const task = AppState.tasks.find((t) => t.id === taskId)
    if (task) {
      task.status = newStatus
      task.updatedAt = new Date().toISOString()
      this.saveTasks()
      this.render()
    }
  },

  getPriorityLabel(priority) {
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
    }
    return labels[priority] || priority
  },

  showTaskMenu(taskId) {
    // Simple implementation - could be enhanced with a proper context menu
    if (confirm("Deseja excluir esta tarefa?")) {
      this.deleteTask(taskId)
    }
  },

  // Drag and Drop functionality
  handleDragStart(event, taskId) {
    event.dataTransfer.setData("text/plain", taskId)
    event.target.style.opacity = "0.5"
  },

  handleDragEnd(event) {
    event.target.style.opacity = "1"
  },

  saveTasks() {
    Utils.saveToStorage("nucleo_tasks", AppState.tasks)
  },

  loadTasks() {
    AppState.tasks = Utils.loadFromStorage("nucleo_tasks", [])
  },
}

// Calendar Module
const Calendar = {
  currentDate: new Date(),

  init() {
    document.getElementById("prevMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1)
      this.render()
    })

    document.getElementById("nextMonth").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1)
      this.render()
    })
  },

  render() {
    this.renderHeader()
    this.renderGrid()
  },

  renderHeader() {
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ]

    const currentMonth = document.getElementById("currentMonth")
    currentMonth.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`
  },

  renderGrid() {
    const grid = Elements.calendarGrid
    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Clear grid
    grid.innerHTML = ""

    // Add day headers
    const dayHeaders = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    dayHeaders.forEach((day) => {
      const dayHeader = document.createElement("div")
      dayHeader.className = "calendar-day-header"
      dayHeader.textContent = day
      dayHeader.style.cssText = `
        padding: 1rem;
        text-align: center;
        font-weight: 600;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-primary);
        background: var(--surface-bg);
      `
      grid.appendChild(dayHeader)
    })

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement("div")
      emptyDay.className = "calendar-day other-month"
      grid.appendChild(emptyDay)
    }

    // Add days of month
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div")
      dayElement.className = "calendar-day"
      dayElement.textContent = day

      // Check if it's today
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        dayElement.classList.add("today")
      }

      // Add click handler
      dayElement.addEventListener("click", () => {
        this.selectDate(new Date(year, month, day))
      })

      grid.appendChild(dayElement)
    }
  },

  selectDate(date) {
    // Remove previous selection
    document.querySelectorAll(".calendar-day.selected").forEach((day) => {
      day.classList.remove("selected")
    })

    // Add selection to clicked day
    event.target.classList.add("selected")

    // Could add functionality to show tasks/events for selected date
    console.log("Selected date:", date)
  },
}

// Search Module
const Search = {
  init() {
    const searchInput = Elements.globalSearch
    const debouncedSearch = Utils.debounce(this.performSearch.bind(this), 300)

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim()
      if (query.length >= 2) {
        debouncedSearch(query)
      } else {
        this.clearResults()
      }
    })

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = ""
        this.clearResults()
      }
    })
  },

  performSearch(query) {
    const results = []

    // Search notes
    AppState.notes.forEach((note) => {
      if (
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      ) {
        results.push({
          type: "note",
          item: note,
          title: note.title,
          preview: note.content.replace(/<[^>]*>/g, "").substring(0, 100),
        })
      }
    })

    // Search tasks
    AppState.tasks.forEach((task) => {
      if (
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
      ) {
        results.push({
          type: "task",
          item: task,
          title: task.title,
          preview: task.description || "",
        })
      }
    })

    this.showResults(results, query)
  },

  showResults(results, query) {
    // This could be enhanced with a proper search results dropdown
    console.log(`Found ${results.length} results for "${query}":`, results)
  },

  clearResults() {
    // Clear search results
  },
}

// Settings Module
const Settings = {
  init() {
    Elements.settingsBtn.addEventListener("click", () => {
      this.openSettingsModal()
    })

    document.getElementById("closeSettingsModal").addEventListener("click", () => {
      this.closeSettingsModal()
    })

    document.getElementById("themeSelect").addEventListener("change", (e) => {
      this.changeTheme(e.target.value)
    })

    document.getElementById("clearDataBtn").addEventListener("click", () => {
      this.clearAllData()
    })
  },

  openSettingsModal() {
    Elements.modalOverlay.classList.add("active")
    Elements.settingsModal.style.display = "flex"

    // Set current theme
    document.getElementById("themeSelect").value = AppState.theme
  },

  closeSettingsModal() {
    Elements.modalOverlay.classList.remove("active")
    Elements.settingsModal.style.display = "none"
  },

  changeTheme(theme) {
    AppState.theme = theme
    document.body.className = theme === "light" ? "light-theme" : ""
    Utils.saveToStorage("nucleo_theme", theme)
  },

  clearAllData() {
    if (confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      localStorage.clear()
      AppState.notes = []
      AppState.tasks = []
      AppState.collections = ["projetos", "ideias"]

      // Re-render current view
      Navigation.loadViewData(AppState.currentView)
      Dashboard.updateStats()

      alert("Todos os dados foram limpos.")
      this.closeSettingsModal()
    }
  },

  loadSettings() {
    AppState.theme = Utils.loadFromStorage("nucleo_theme", "dark")
    this.changeTheme(AppState.theme)
  },
}

// Modal System
const Modals = {
  init() {
    // Close modals when clicking overlay
    Elements.modalOverlay.addEventListener("click", (e) => {
      if (e.target === Elements.modalOverlay) {
        this.closeAllModals()
      }
    })

    // Close modals with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals()
      }
    })
  },

  closeAllModals() {
    Elements.modalOverlay.classList.remove("active")
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.style.display = "none"
    })

    // Reset current items
    Notes.currentNote = null
    Tasks.currentTask = null
  },
}

// Drag and Drop for Kanban
const DragDrop = {
  init() {
    // Add drop zones to kanban columns
    document.querySelectorAll(".column-content").forEach((column) => {
      column.addEventListener("dragover", this.handleDragOver)
      column.addEventListener("drop", this.handleDrop)
    })
  },

  handleDragOver(event) {
    event.preventDefault()
    event.currentTarget.classList.add("drag-over")
  },

  handleDrop(event) {
    event.preventDefault()
    event.currentTarget.classList.remove("drag-over")

    const taskId = event.dataTransfer.getData("text/plain")
    const newStatus = event.currentTarget.parentElement.dataset.status

    if (taskId && newStatus) {
      Tasks.moveTask(taskId, newStatus)
    }
  },
}

// Quick Actions
const QuickActions = {
  init() {
    document.querySelectorAll(".quick-action-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action
        this.executeAction(action)
      })
    })
  },

  executeAction(action) {
    switch (action) {
      case "new-note":
        Notes.openNoteModal()
        break
      case "new-task":
        Tasks.openTaskModal()
        break
      case "new-project":
        // Could open a project creation modal
        alert("Funcionalidade de projetos em desenvolvimento")
        break
    }
  },
}

// Application Initialization
const App = {
  init() {
    // Load data from storage
    Notes.loadNotes()
    Tasks.loadTasks()
    Settings.loadSettings()

    // Initialize modules
    Navigation.init()
    Notes.init()
    Tasks.init()
    Calendar.init()
    Search.init()
    Settings.init()
    Modals.init()
    DragDrop.init()
    QuickActions.init()

    // Set initial view
    Navigation.switchView("dashboard")

    // Add some sample data if empty
    this.addSampleData()

    console.log("NUCLEO App initialized successfully")
  },

  addSampleData() {
    if (AppState.notes.length === 0 && AppState.tasks.length === 0) {
      // Add sample note
      AppState.notes.push({
        id: Utils.generateId(),
        title: "Bem-vindo ao NUCLEO",
        content:
          "Esta é sua primeira nota! Use o NUCLEO para organizar suas ideias, projetos e tarefas de forma inteligente.",
        tags: ["boas-vindas", "tutorial"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Add sample task
      AppState.tasks.push({
        id: Utils.generateId(),
        title: "Explorar o NUCLEO",
        description: "Conhecer todas as funcionalidades do aplicativo",
        priority: "medium",
        status: "todo",
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      Notes.saveNotes()
      Tasks.saveTasks()
    }
  },
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init()
})

// Add CSS for drag and drop
const style = document.createElement("style")
style.textContent = `
  .drag-over {
    background: rgba(139, 92, 246, 0.1) !important;
    border: 2px dashed var(--purple-primary) !important;
  }
  
  .empty-column {
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
    padding: 2rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem;
    grid-column: 1 / -1;
  }
  
  .overdue {
    border-color: var(--error) !important;
  }
  
  .task-due-date.overdue {
    color: var(--error);
  }
  
  .calendar-day-header {
    padding: 1rem;
    text-align: center;
    font-weight: 600;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border-primary);
    background: var(--surface-bg);
  }
  
  .calendar-day.selected {
    background: var(--purple-secondary) !important;
    color: white;
  }
  
  @media (max-width: 768px) {
    .sidebar.active {
      transform: translateX(0);
    }
  }
`
document.head.appendChild(style)

// Event listeners para formulário de cadastro
if (document.getElementById("cadastroForm")) {
  document
    .getElementById("cadastroForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value,
        confirmarSenha: document.getElementById("confirmarSenha").value,
      }

      if (!validateCadastroForm(formData)) {
        return
      }

      showLoading("submitBtn")

      // Simular chamada de API
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Limpar formulário
        document.getElementById("cadastroForm").reset()

        // Mostrar modal de sucesso
        showSuccessModal()
      } catch (error) {
        console.error("Erro no cadastro:", error)
        alert("Erro ao realizar cadastro. Tente novamente.")
      } finally {
        hideLoading("submitBtn", "Cadastrar")
      }
    })

  // Validação em tempo real
  ;["nome", "email", "senha", "confirmarSenha"].forEach((field) => {
    document.getElementById(field).addEventListener("input", () => {
      const errorElement = document.getElementById(field + "-error")
      if (errorElement.textContent) {
        clearError(field)
      }
    })
  })
}

// Event listeners para formulário de login
if (document.getElementById("loginForm")) {
  document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = {
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value,
      }

      if (!validateLoginForm(formData)) {
        return
      }

      showLoading("submitBtn")

      // Simular chamada de API
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        alert("Login realizado com sucesso!")
        console.log("Login realizado:", formData)
      } catch (error) {
        console.error("Erro no login:", error)
        alert("Erro ao realizar login. Verifique suas credenciais.")
      } finally {
        hideLoading("submitBtn", "Entrar")
      }
    })

  // Validação em tempo real
  ;["email", "senha"].forEach((field) => {
    document.getElementById(field).addEventListener("input", () => {
      const errorElement = document.getElementById(field + "-error")
      if (errorElement.textContent) {
        clearError(field)
      }
    })
  })
}

// Fechar modal ao clicar fora dele
document.addEventListener("click", (e) => {
  const modal = document.getElementById("successModal")
  if (modal && e.target === modal) {
    modal.style.display = "none"
  }
})

// Adicionar suporte para tecla ESC fechar modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("successModal")
    if (modal && modal.style.display === "flex") {
      modal.style.display = "none"
    }
  }
})
