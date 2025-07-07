// Configurações da API
const API_CONFIG = {
  BASE_URL: "https://api.example.com",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      LOGOUT: "/auth/logout",
    },
    USERS: {
      PROFILE: "/users/profile",
      UPDATE_MODE: "/users/update-mode",
    },
    NOTES: {
      LIST: "/notes",
      CREATE: "/notes",
      UPDATE: "/notes",
      DELETE: "/notes",
      SEARCH: "/notes/search",
    },
    TASKS: {
      LIST: "/tasks",
      CREATE: "/tasks",
      UPDATE: "/tasks",
      DELETE: "/tasks",
      BY_STATUS: "/tasks/status",
    },
    EXPENSES: {
      LIST: "/expenses",
      CREATE: "/expenses",
      UPDATE: "/expenses",
      DELETE: "/expenses",
      BY_CATEGORY: "/expenses/category",
      SUMMARY: "/expenses/summary",
    },
    ANALYTICS: {
      DASHBOARD: "/analytics/dashboard",
      PRODUCTIVITY: "/analytics/productivity",
      FINANCIAL: "/analytics/financial",
    },
  },
}

// Configurações de autenticação
const AUTH_CONFIG = {
  TOKEN_KEY: "auth_token",
  USER_KEY: "user_data",
  REFRESH_TOKEN_KEY: "refresh_token",
}

// Classe para gerenciar chamadas à API Java
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
  }

  // Método para fazer requisições HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Adicionar token de autenticação se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro na requisição")
      }

      return data
    } catch (error) {
      console.error("Erro na API:", error)
      throw error
    }
  }

  // Métodos de autenticação
  async login(credentials) {
    const response = await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data.token) {
      this.setToken(response.data.token)
      this.setUser(response.data.user)
    }

    return response
  }

  async register(userData) {
    const response = await this.request(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (response.success && response.data.token) {
      this.setToken(response.data.token)
      this.setUser(response.data.user)
    }

    return response
  }

  async logout() {
    try {
      await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
      })
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      this.clearAuth()
    }
  }

  // Métodos de usuário
  async getUserProfile() {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.PROFILE)
  }

  async updateUserMode(mode) {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.UPDATE_MODE, {
      method: "PUT",
      body: JSON.stringify({ mode }),
    })
  }

  // Métodos de notas
  async getNotes() {
    return await this.request(API_CONFIG.ENDPOINTS.NOTES.LIST)
  }

  async createNote(noteData) {
    return await this.request(API_CONFIG.ENDPOINTS.NOTES.CREATE, {
      method: "POST",
      body: JSON.stringify(noteData),
    })
  }

  async updateNote(id, noteData) {
    return await this.request(`${API_CONFIG.ENDPOINTS.NOTES.UPDATE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(noteData),
    })
  }

  async deleteNote(id) {
    return await this.request(`${API_CONFIG.ENDPOINTS.NOTES.DELETE}/${id}`, {
      method: "DELETE",
    })
  }

  async searchNotes(query) {
    return await this.request(`${API_CONFIG.ENDPOINTS.NOTES.SEARCH}?q=${encodeURIComponent(query)}`)
  }

  // Métodos de tarefas
  async getTasks() {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.LIST)
  }

  async createTask(taskData) {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.CREATE, {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(id, taskData) {
    return await this.request(`${API_CONFIG.ENDPOINTS.TASKS.UPDATE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    })
  }

  async deleteTask(id) {
    return await this.request(`${API_CONFIG.ENDPOINTS.TASKS.DELETE}/${id}`, {
      method: "DELETE",
    })
  }

  async getTasksByStatus(status) {
    return await this.request(`${API_CONFIG.ENDPOINTS.TASKS.BY_STATUS}/${status}`)
  }

  // Métodos de despesas
  async getExpenses() {
    return await this.request(API_CONFIG.ENDPOINTS.EXPENSES.LIST)
  }

  async createExpense(expenseData) {
    return await this.request(API_CONFIG.ENDPOINTS.EXPENSES.CREATE, {
      method: "POST",
      body: JSON.stringify(expenseData),
    })
  }

  async updateExpense(id, expenseData) {
    return await this.request(`${API_CONFIG.ENDPOINTS.EXPENSES.UPDATE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
    })
  }

  async deleteExpense(id) {
    return await this.request(`${API_CONFIG.ENDPOINTS.EXPENSES.DELETE}/${id}`, {
      method: "DELETE",
    })
  }

  async getExpensesByCategory(category) {
    return await this.request(`${API_CONFIG.ENDPOINTS.EXPENSES.BY_CATEGORY}/${category}`)
  }

  async getExpensesSummary() {
    return await this.request(API_CONFIG.ENDPOINTS.EXPENSES.SUMMARY)
  }

  // Métodos de analytics
  async getDashboardData() {
    return await this.request(API_CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD)
  }

  async getProductivityMetrics() {
    return await this.request(API_CONFIG.ENDPOINTS.ANALYTICS.PRODUCTIVITY)
  }

  async getFinancialMetrics() {
    return await this.request(API_CONFIG.ENDPOINTS.ANALYTICS.FINANCIAL)
  }

  // Métodos auxiliares
  setToken(token) {
    this.token = token
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token)
  }

  setUser(user) {
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user))
  }

  getUser() {
    const userData = localStorage.getItem(AUTH_CONFIG.USER_KEY)
    return userData ? JSON.parse(userData) : null
  }

  clearAuth() {
    this.token = null
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY)
    localStorage.removeItem(AUTH_CONFIG.USER_KEY)
  }

  isAuthenticated() {
    return !!this.token
  }
}

// Instância global da API
const api = new ApiClient()