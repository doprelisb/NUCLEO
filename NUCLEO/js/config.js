// Configuração da API
const API_CONFIG = {
  BASE_URL: "http://localhost:8080/api", // Altere para sua URL do backend Java
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      REFRESH: "/auth/refresh",
      LOGOUT: "/auth/logout",
    },
    USERS: {
      PROFILE: "/users/profile",
      UPDATE_MODE: "/users/mode",
      UPDATE_PROFILE: "/users/profile",
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

// Configuração de autenticação
const AUTH_CONFIG = {
  TOKEN_KEY: "nucleo_auth_token",
  REFRESH_TOKEN_KEY: "nucleo_refresh_token",
  USER_KEY: "nucleo_user_data",
}

// Configuração da aplicação
const APP_CONFIG = {
  NAME: "Núcleo",
  VERSION: "1.0.0",
  LOADING_DELAY: 2000,
  AUTO_SAVE_DELAY: 1000,
  PAGINATION_SIZE: 20,
}
