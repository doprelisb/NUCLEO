// Gerenciamento do workspace principal
let currentUser = null // Declare currentUser variable
const api = null // Declare api variable

class WorkspaceManager {
  constructor() {
    this.currentView = "dashboard"
    this.data = {
      notes: [],
      tasks: [],
      expenses: [],
      analytics: {},
    }
  }

  async initialize() {
    this.createWorkspaceHTML()
    this.setupEventListeners()
    await this.loadInitialData()
  }

  createWorkspaceHTML() {
    const workspace = document.getElementById("workspace")
    workspace.innerHTML = `
            <div class="workspace-container">
                <!-- Sidebar -->
                <aside class="workspace-sidebar">
                    <div class="sidebar-header">
                        <div class="nucleus-icon"></div>
                        <h2>Núcleo</h2>
                    </div>
                    
                    <nav class="sidebar-nav">
                        <a href="#" data-view="dashboard" class="nav-item active">
                            <span class="nav-icon">📊</span>
                            Dashboard
                        </a>
                        <a href="#" data-view="notes" class="nav-item">
                            <span class="nav-icon">📝</span>
                            Notas
                        </a>
                        <a href="#" data-view="tasks" class="nav-item">
                            <span class="nav-icon">✅</span>
                            Tarefas
                        </a>
                        <a href="#" data-view="expenses" class="nav-item">
                            <span class="nav-icon">💰</span>
                            Despesas
                        </a>
                        <a href="#" data-view="analytics" class="nav-item">
                            <span class="nav-icon">📈</span>
                            Analytics
                        </a>
                    </nav>
                    
                    <div class="sidebar-footer">
                        <div class="user-info">
                            <div class="user-avatar">${currentUser?.name?.charAt(0) || "U"}</div>
                            <div class="user-details">
                                <div class="user-name">${currentUser?.name || "Usuário"}</div>
                                <div class="user-mode">${currentUser?.mode === "personal" ? "Pessoal" : "Profissional"}</div>
                            </div>
                        </div>
                        <button onclick="logout()" class="btn-logout">Sair</button>
                    </div>
                </aside>
                
                <!-- Main Content -->
                <main class="workspace-main">
                    <div id="workspace-content">
                        <!-- Content will be loaded here -->
                    </div>
                </main>
            </div>
        `
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const view = e.currentTarget.dataset.view
        this.switchView(view)
      })
    })
  }

  async switchView(view) {
    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelector(`[data-view="${view}"]`).classList.add("active")

    this.currentView = view
    await this.loadView(view)
  }

  async loadView(view) {
    const content = document.getElementById("workspace-content")

    switch (view) {
      case "dashboard":
        content.innerHTML = this.getDashboardHTML()
        await this.loadDashboardData()
        break
      case "notes":
        content.innerHTML = this.getNotesHTML()
        await this.loadNotesData()
        break
      case "tasks":
        content.innerHTML = this.getTasksHTML()
        await this.loadTasksData()
        break
      case "expenses":
        content.innerHTML = this.getExpensesHTML()
        await this.loadExpensesData()
        break
      case "analytics":
        content.innerHTML = this.getAnalyticsHTML()
        await this.loadAnalyticsData()
        break
    }
  }

  getDashboardHTML() {
    return `
            <div class="dashboard">
                <header class="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Bem-vindo de volta, ${currentUser?.name || "Usuário"}!</p>
                </header>
                
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3>Notas Recentes</h3>
                        <div id="recent-notes" class="dashboard-list">
                            <div class="loading">Carregando...</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3>Tarefas Pendentes</h3>
                        <div id="pending-tasks" class="dashboard-list">
                            <div class="loading">Carregando...</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3>Resumo Financeiro</h3>
                        <div id="financial-summary" class="dashboard-summary">
                            <div class="loading">Carregando...</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3>Produtividade</h3>
                        <div id="productivity-chart" class="dashboard-chart">
                            <div class="loading">Carregando...</div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  getNotesHTML() {
    return `
            <div class="notes-view">
                <header class="view-header">
                    <h1>Notas</h1>
                    <button onclick="createNote()" class="btn btn-primary">Nova Nota</button>
                </header>
                
                <div class="notes-toolbar">
                    <input type="text" id="notes-search" placeholder="Buscar notas..." class="form-input">
                    <select id="notes-filter" class="form-select">
                        <option value="">Todas as notas</option>
                        <option value="recent">Recentes</option>
                        <option value="favorites">Favoritas</option>
                    </select>
                </div>
                
                <div id="notes-grid" class="notes-grid">
                    <div class="loading">Carregando notas...</div>
                </div>
            </div>
        `
  }

  getTasksHTML() {
    return `
            <div class="tasks-view">
                <header class="view-header">
                    <h1>Tarefas</h1>
                    <button onclick="createTask()" class="btn btn-primary">Nova Tarefa</button>
                </header>
                
                <div class="kanban-board">
                    <div class="kanban-column">
                        <h3>A Fazer</h3>
                        <div id="todo-tasks" class="task-list">
                            <div class="loading">Carregando...</div>
                        </div>
                    </div>
                    
                    <div class="kanban-column">
                        <h3>Em Progresso</h3>
                        <div id="progress-tasks" class="task-list">
                            <div class="loading">Carregando...</div>
                        </div>
                    </div>
                    
                    <div class="kanban-column">
                        <h3>Concluído</h3>
                        <div id="done-tasks" class="task-list">
                            <div class="loading">Carregando...</div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  getExpensesHTML() {
    return `
            <div class="expenses-view">
                <header class="view-header">
                    <h1>Despesas</h1>
                    <button onclick="createExpense()" class="btn btn-primary">Nova Despesa</button>
                </header>
                
                <div class="expenses-summary">
                    <div class="summary-card">
                        <h3>Total do Mês</h3>
                        <div id="monthly-total" class="summary-value">R$ 0,00</div>
                    </div>
                    <div class="summary-card">
                        <h3>Categoria Principal</h3>
                        <div id="top-category" class="summary-value">-</div>
                    </div>
                    <div class="summary-card">
                        <h3>Média Diária</h3>
                        <div id="daily-average" class="summary-value">R$ 0,00</div>
                    </div>
                </div>
                
                <div class="expenses-content">
                    <div class="expenses-chart">
                        <h3>Gastos por Categoria</h3>
                        <div id="category-chart">
                            <div class="loading">Carregando gráfico...</div>
                        </div>
                    </div>
                    
                    <div class="expenses-list">
                        <h3>Despesas Recentes</h3>
                        <div id="recent-expenses">
                            <div class="loading">Carregando despesas...</div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  getAnalyticsHTML() {
    return `
            <div class="analytics-view">
                <header class="view-header">
                    <h1>Analytics</h1>
                    <select id="analytics-period" class="form-select">
                        <option value="week">Última Semana</option>
                        <option value="month">Último Mês</option>
                        <option value="quarter">Último Trimestre</option>
                        <option value="year">Último Ano</option>
                    </select>
                </header>
                
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h3>Produtividade</h3>
                        <div id="productivity-metrics">
                            <div class="loading">Carregando métricas...</div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h3>Notas Criadas</h3>
                        <div id="notes-chart">
                            <div class="loading">Carregando gráfico...</div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h3>Tarefas Completadas</h3>
                        <div id="tasks-chart">
                            <div class="loading">Carregando gráfico...</div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h3>Controle Financeiro</h3>
                        <div id="financial-chart">
                            <div class="loading">Carregando gráfico...</div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  async loadInitialData() {
    await this.loadView("dashboard")
  }

  async loadDashboardData() {
    try {
      const response = await api.getDashboardData()
      if (response.success) {
        this.updateDashboard(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
    }
  }

  async loadNotesData() {
    try {
      const response = await api.getNotes()
      if (response.success) {
        this.data.notes = response.data
        this.updateNotesGrid(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar notas:", error)
    }
  }

  async loadTasksData() {
    try {
      const response = await api.getTasks()
      if (response.success) {
        this.data.tasks = response.data
        this.updateTasksBoard(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error)
    }
  }

  async loadExpensesData() {
    try {
      const [expensesResponse, summaryResponse] = await Promise.all([api.getExpenses(), api.getExpensesSummary()])

      if (expensesResponse.success) {
        this.data.expenses = expensesResponse.data
        this.updateExpensesList(expensesResponse.data)
      }

      if (summaryResponse.success) {
        this.updateExpensesSummary(summaryResponse.data)
      }
    } catch (error) {
      console.error("Erro ao carregar despesas:", error)
    }
  }

  async loadAnalyticsData() {
    try {
      const response = await api.getProductivityMetrics()
      if (response.success) {
        this.updateAnalytics(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar analytics:", error)
    }
  }

  updateDashboard(data) {
    // Implementar atualização do dashboard
    console.log("Dashboard data:", data)
  }

  updateNotesGrid(notes) {
    const grid = document.getElementById("notes-grid")
    if (!notes || notes.length === 0) {
      grid.innerHTML = '<div class="empty-state">Nenhuma nota encontrada</div>'
      return
    }

    grid.innerHTML = notes
      .map(
        (note) => `
            <div class="note-card" onclick="openNote('${note.id}')">
                <h4>${note.title}</h4>
                <p>${note.content.substring(0, 100)}...</p>
                <div class="note-meta">
                    <span class="note-date">${formatDate(note.updatedAt)}</span>
                    <div class="note-tags">
                        ${note.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  updateTasksBoard(tasks) {
    const todoTasks = tasks.filter((task) => task.status === "todo")
    const progressTasks = tasks.filter((task) => task.status === "in-progress")
    const doneTasks = tasks.filter((task) => task.status === "done")

    this.updateTaskColumn("todo-tasks", todoTasks)
    this.updateTaskColumn("progress-tasks", progressTasks)
    this.updateTaskColumn("done-tasks", doneTasks)
  }

  updateTaskColumn(columnId, tasks) {
    const column = document.getElementById(columnId)
    if (!tasks || tasks.length === 0) {
      column.innerHTML = '<div class="empty-column">Nenhuma tarefa</div>'
      return
    }

    column.innerHTML = tasks
      .map(
        (task) => `
            <div class="task-card" onclick="openTask('${task.id}')">
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <div class="task-meta">
                    <span class="priority ${task.priority}">${task.priority}</span>
                    ${task.dueDate ? `<span class="due-date">${formatDate(task.dueDate)}</span>` : ""}
                </div>
            </div>
        `,
      )
      .join("")
  }

  updateExpensesList(expenses) {
    const list = document.getElementById("recent-expenses")
    if (!expenses || expenses.length === 0) {
      list.innerHTML = '<div class="empty-state">Nenhuma despesa encontrada</div>'
      return
    }

    list.innerHTML = expenses
      .slice(0, 10)
      .map(
        (expense) => `
            <div class="expense-item" onclick="openExpense('${expense.id}')">
                <div class="expense-info">
                    <h4>${expense.title}</h4>
                    <span class="expense-category">${expense.category}</span>
                </div>
                <div class="expense-amount">R$ ${expense.amount.toFixed(2)}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
            </div>
        `,
      )
      .join("")
  }

  updateExpensesSummary(summary) {
    document.getElementById("monthly-total").textContent = `R$ ${summary.monthlyTotal.toFixed(2)}`
    document.getElementById("top-category").textContent = summary.topCategory || "-"
    document.getElementById("daily-average").textContent = `R$ ${summary.dailyAverage.toFixed(2)}`
  }

  updateAnalytics(data) {
    // Implementar atualização dos analytics
    console.log("Analytics data:", data)
  }
}

// Instância global do workspace
let workspaceManager = null

// Função para inicializar o workspace
async function initializeWorkspace() {
  workspaceManager = new WorkspaceManager()
  await workspaceManager.initialize()
}

// Função de logout
async function logout() {
  try {
    await api.logout()
    currentUser = null

    // Voltar para a tela inicial
    document.getElementById("workspace").classList.remove("active")
    document.getElementById("home-screen").classList.add("active")
  } catch (error) {
    console.error("Erro ao fazer logout:", error)
  }
}

// Funções auxiliares
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

// Funções de CRUD (serão implementadas nos arquivos específicos)
function createNote() {
  console.log("Criar nova nota")
}

function openNote(id) {
  console.log("Abrir nota:", id)
}

function createTask() {
  console.log("Criar nova tarefa")
}

function openTask(id) {
  console.log("Abrir tarefa:", id)
}

function createExpense() {
  console.log("Criar nova despesa")
}

function openExpense(id) {
  console.log("Abrir despesa:", id)
}
