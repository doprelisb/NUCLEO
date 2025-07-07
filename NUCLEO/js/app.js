// Variáveis globais
let currentUser = null
const isLoading = false
const api = {} // Declare the api variable here
const APP_CONFIG = { LOADING_DELAY: 2000 } // Declare the APP_CONFIG variable here

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  showLoadingScreen()

  // Verificar se usuário está autenticado
  if (api.isAuthenticated()) {
    try {
      const response = await api.getUserProfile()
      if (response.success) {
        currentUser = response.data
        showWorkspace()
        return
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      api.clearAuth()
    }
  }

  // Mostrar tela inicial após delay
  setTimeout(() => {
    hideLoadingScreen()
    showHomeScreen()
  }, APP_CONFIG.LOADING_DELAY)
}

// Gerenciamento de telas
function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen")
  loadingScreen.classList.remove("hidden")
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen")
  loadingScreen.classList.add("hidden")
}

function showHomeScreen() {
  const homeScreen = document.getElementById("home-screen")
  homeScreen.classList.add("active")
}

function showWorkspace() {
  const homeScreen = document.getElementById("home-screen")
  const workspace = document.getElementById("workspace")

  homeScreen.classList.remove("active")
  workspace.classList.add("active")

  // Carregar dados do workspace
  loadWorkspaceData()
}

// Funções da landing page
function showModeSelection() {
  const modeSelection = document.getElementById("mode-selection")
  modeSelection.classList.remove("hidden")

  // Scroll suave para a seção
  setTimeout(() => {
    modeSelection.scrollIntoView({ behavior: "smooth" })
  }, 100)
}

function scrollToFeatures() {
  const featuresSection = document.getElementById("features")
  featuresSection.scrollIntoView({ behavior: "smooth" })
}

async function selectMode(mode) {
  if (api.isAuthenticated()) {
    // Usuário já logado, apenas atualizar modo
    try {
      const response = await api.updateUserMode(mode)
      if (response.success) {
        currentUser.mode = mode
        showWorkspace()
      } else {
        showAlert("Erro ao atualizar modo de uso", "danger")
      }
    } catch (error) {
      console.error("Erro ao atualizar modo:", error)
      showAlert("Erro ao atualizar modo de uso", "danger")
    }
  } else {
    // Usuário não logado, mostrar modal de registro
    showRegisterModal(mode)
  }
}

// Gerenciamento de modais
function showModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.classList.add("active")
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.classList.remove("active")
}

function showLoginModal() {
  showModal("login-modal")
}

function showRegisterModal(selectedMode = "") {
  const modal = document.getElementById("register-modal")
  const modeSelect = document.getElementById("register-mode")

  if (selectedMode) {
    modeSelect.value = selectedMode
  }

  showModal("register-modal")
}

// Gerenciamento de formulários
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value
  const errorDiv = document.getElementById("login-error")

  try {
    showFormLoading("login-form", true)
    errorDiv.classList.add("hidden")

    const response = await api.login({ email, password })

    if (response.success) {
      currentUser = response.data.user
      closeModal("login-modal")
      showWorkspace()
    } else {
      showFormError("login-error", response.message || "Erro ao fazer login")
    }
  } catch (error) {
    console.error("Erro no login:", error)
    showFormError("login-error", "Erro ao conectar com o servidor")
  } finally {
    showFormLoading("login-form", false)
  }
})

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const mode = document.getElementById("register-mode").value
  const errorDiv = document.getElementById("register-error")

  try {
    showFormLoading("register-form", true)
    errorDiv.classList.add("hidden")

    const response = await api.register({ name, email, password, mode })

    if (response.success) {
      currentUser = response.data.user
      closeModal("register-modal")
      showWorkspace()
    } else {
      showFormError("register-error", response.message || "Erro ao criar conta")
    }
  } catch (error) {
    console.error("Erro no registro:", error)
    showFormError("register-error", "Erro ao conectar com o servidor")
  } finally {
    showFormLoading("register-form", false)
  }
})

// Funções auxiliares
function showFormLoading(formId, loading) {
  const form = document.getElementById(formId)
  const submitBtn = form.querySelector('button[type="submit"]')

  if (loading) {
    submitBtn.disabled = true
    submitBtn.textContent = "Carregando..."
  } else {
    submitBtn.disabled = false
    submitBtn.textContent = formId === "login-form" ? "Entrar" : "Criar Conta"
  }
}

function showFormError(errorId, message) {
  const errorDiv = document.getElementById(errorId)
  errorDiv.textContent = message
  errorDiv.classList.remove("hidden")
}

function showAlert(message, type = "info") {
  // Criar elemento de alerta
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.textContent = message

  // Adicionar ao body
  document.body.appendChild(alert)

  // Remover após 5 segundos
  setTimeout(() => {
    alert.remove()
  }, 5000)
}

async function loadWorkspaceData() {
  try {
    // Carregar dados iniciais do workspace
    const [notesResponse, tasksResponse, expensesResponse] = await Promise.all([
      api.getNotes(),
      api.getTasks(),
      api.getExpenses(),
    ])

    // Processar dados e atualizar interface
    if (notesResponse.success) {
      updateNotesDisplay(notesResponse.data)
    }

    if (tasksResponse.success) {
      updateTasksDisplay(tasksResponse.data)
    }

    if (expensesResponse.success) {
      updateExpensesDisplay(expensesResponse.data)
    }
  } catch (error) {
    console.error("Erro ao carregar dados do workspace:", error)
    showAlert("Erro ao carregar dados", "danger")
  }
}

function updateNotesDisplay(notes) {
  // Implementar atualização da interface de notas
  console.log("Notas carregadas:", notes)
}

function updateTasksDisplay(tasks) {
  // Implementar atualização da interface de tarefas
  console.log("Tarefas carregadas:", tasks)
}

function updateExpensesDisplay(expenses) {
  // Implementar atualização da interface de despesas
  console.log("Despesas carregadas:", expenses)
}

// Fechar modais ao clicar fora
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active")
  }
})

// Atalhos de teclado
document.addEventListener("keydown", (e) => {
  // Fechar modal com ESC
  if (e.key === "Escape") {
    const activeModal = document.querySelector(".modal.active")
    if (activeModal) {
      activeModal.classList.remove("active")
    }
  }
})
