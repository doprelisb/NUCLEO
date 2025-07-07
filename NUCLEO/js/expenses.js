// Expenses Manager - Sistema completo de controle financeiro
class ExpensesManager {
  constructor() {
    this.expenses = []
    this.budget = 2000 // Default budget
    this.categories = [
      { id: 'alimentacao', name: 'Alimentação', icon: '🍽️', color: '#ef4444' },
      { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#f59e0b' },
      { id: 'saude', name: 'Saúde', icon: '🏥', color: '#10b981' },
      { id: 'educacao', name: 'Educação', icon: '📚', color: '#3b82f6' },
      { id: 'lazer', name: 'Lazer', icon: '🎮', color: '#8b5cf6' },
      { id: 'casa', name: 'Casa', icon: '🏠', color: '#06b6d4' },
      { id: 'trabalho', name: 'Trabalho', icon: '💼', color: '#64748b' },
      { id: 'outros', name: 'Outros', icon: '📦', color: '#6b7280' }
    ]
    this.currentFilter = {
      category: '',
      month: new Date().toISOString().slice(0, 7),
      search: ''
    }
    this.currentView = 'list' // list or chart
    this.chart = null
    
    this.init()
  }

  init() {
    this.loadExpenses()
    this.bindEvents()
    this.renderExpenses()
    this.updateSummary()
    this.renderChart()
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById('expenses-search')
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilter.search = e.target.value.toLowerCase()
        this.renderExpenses()
      })
    }

    // Filter functionality
    const categoryFilter = document.getElementById('category-filter')
    const monthFilter = document.getElementById('month-filter')
    
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentFilter.category = e.target.value
        this.renderExpenses()
        this.updateSummary()
        this.renderChart()
      })
    }

    if (monthFilter) {
      monthFilter.value = this.currentFilter.month
      monthFilter.addEventListener('change', (e) => {
        this.currentFilter.month = e.target.value
        this.renderExpenses()
        this.updateSummary()
        this.renderChart()
      })
    }
  }

  addExpense() {
    this.showExpenseModal({
      description: '',
      amount: '',
      category: 'alimentacao',
      date: new Date().toISOString().split('T')[0],
      tags: []
    })
  }

  editExpense(id) {
    const expense = this.expenses.find(e => e.id === id)
    if (expense) {
      this.showExpenseModal(expense, id)
    }
  }

  showExpenseModal(expense, editingId = null) {
    const modal = this.createExpenseModal(expense, editingId)
    document.body.appendChild(modal)
    modal.classList.add('active')
    
    // Focus on description input
    const descriptionInput = modal.querySelector('#expense-description')
    if (descriptionInput) {
      descriptionInput.focus()
    }
  }

  createExpenseModal(expense, editingId) {
    const modal = document.createElement('div')
    modal.className = 'modal expense-modal'
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${editingId ? 'Editar Gasto' : 'Novo Gasto'}</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Descrição *</label>
            <input type="text" id="expense-description" class="form-input" value="${expense.description}" placeholder="Ex: Almoço no restaurante">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Valor *</label>
              <div class="input-group">
                <span class="input-prefix">R$</span>
                <input type="number" id="expense-amount" class="form-input" value="${expense.amount}" placeholder="0,00" step="0.01" min="0">
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Data</label>
              <input type="date" id="expense-date" class="form-input" value="${expense.date}">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <div class="category-grid">
              ${this.categories.map(cat => `
                <div class="category-option ${expense.category === cat.id ? 'selected' : ''}" data-category="${cat.id}">
                  <span class="category-icon">${cat.icon}</span>
                  <span class="category-name">${cat.name}</span>
                </div>
              `).join('')}
            </div>
            <input type="hidden" id="expense-category" value="${expense.category}">
          </div>
          
          <div class="form-group">
            <label class="form-label">Tags</label>
            <input type="text" id="expense-tags" class="form-input" value="${expense.tags ? expense.tags.join(', ') : ''}" placeholder="Tags separadas por vírgula">
          </div>
          
          <div class="form-group">
            <label class="form-label">Método de Pagamento</label>
            <select id="expense-payment-method" class="form-select">
              <option value="dinheiro" ${expense.paymentMethod === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
              <option value="cartao-debito" ${expense.paymentMethod === 'cartao-debito' ? 'selected' : ''}>Cartão de Débito</option>
              <option value="cartao-credito" ${expense.paymentMethod === 'cartao-credito' ? 'selected' : ''}>Cartão de Crédito</option>
              <option value="pix" ${expense.paymentMethod === 'pix' ? 'selected' : ''}>PIX</option>
              <option value="transferencia" ${expense.paymentMethod === 'transferencia' ? 'selected' : ''}>Transferência</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Observações</label>
            <textarea id="expense-notes" class="form-input form-textarea" placeholder="Observações adicionais...">${expense.notes || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="window.expensesManager.saveExpense(${editingId || 'null'})">Salvar</button>
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
          ${editingId ? `<button class="btn btn-danger" onclick="window.expensesManager.deleteExpense(${editingId})">Excluir</button>` : ''}
        </div>
      </div>
    `

    // Bind category selection
    modal.addEventListener('click', (e) => {
      if (e.target.closest('.category-option')) {
        const categoryOption = e.target.closest('.category-option')
        const categoryId = categoryOption.dataset.category
        
        // Update selection
        modal.querySelectorAll('.category-option').forEach(opt => opt.classList.remove('selected'))
        categoryOption.classList.add('selected')
        modal.querySelector('#expense-category').value = categoryId
      }
    })

    return modal
  }

  saveExpense(editingId) {
    const modal = document.querySelector('.expense-modal.active')
    if (!modal) return

    const description = modal.querySelector('#expense-description').value.trim()
    const amount = parseFloat(modal.querySelector('#expense-amount').value)
    const category = modal.querySelector('#expense-category').value
    const date = modal.querySelector('#expense-date').value
    const paymentMethod = modal.querySelector('#expense-payment-method').value
    const notes = modal.querySelector('#expense-notes').value.trim()
    const tagsInput = modal.querySelector('#expense-tags').value.trim()

    if (!description || !amount || amount <= 0) {
      window.app.showNotification('Por favor, preencha a descrição e um valor válido.', 'warning')
      return
    }

    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    const expenseData = {
      description,
      amount,
      category,
      date,
      paymentMethod,
      notes,
      tags,
      updatedAt: new Date().toISOString()
    }

    if (editingId) {
      // Update existing expense
      const expenseIndex = this.expenses.findIndex(e => e.id === editingId)
      this.expenses[expenseIndex] = {
        ...this.expenses[expenseIndex],
        ...expenseData
      }
    } else {
      // Create new expense
      const newExpense = {
        id: Date.now(),
        ...expenseData,
        createdAt: new Date().toISOString()
      }
      this.expenses.push(newExpense)
    }

    this.saveExpenses()
    this.renderExpenses()
    this.updateSummary()
    this.renderChart()
    modal.remove()
    
    window.app.showNotification('Gasto salvo com sucesso!', 'success')
  }

  deleteExpense(id) {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return

    this.expenses = this.expenses.filter(e => e.id !== id)
    this.saveExpenses()
    this.renderExpenses()
    this.updateSummary()
    this.renderChart()
    
    document.querySelector('.expense-modal.active')?.remove()
    window.app.showNotification('Gasto excluído com sucesso!', 'success')
  }

  toggleView() {
    this.currentView = this.currentView === 'list' ? 'chart' : 'list'
    
    const toggleIcon = document.getElementById('view-toggle-icon')
    const expensesList = document.querySelector('.expenses-list')
    const expensesChart = document.querySelector('.expenses-chart')
    
    if (this.currentView === 'chart') {
      toggleIcon.textContent = '📋'
      expensesList.style.display = 'none'
      expensesChart.style.display = 'block'
      this.renderChart()
    } else {
      toggleIcon.textContent = '📊'
      expensesList.style.display = 'block'
      expensesChart.style.display = 'none'
    }
  }

  renderExpenses() {
    const container = document.getElementById('expenses-container')
    if (!container) return

    const filteredExpenses = this.getFilteredExpenses()

    if (filteredExpenses.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h3>Nenhum gasto encontrado</h3>
          <p>Adicione seu primeiro gasto para começar o controle financeiro</p>
          <button class="btn btn-primary" onclick="window.expensesManager.addExpense()">
            Adicionar Primeiro Gasto
          </button>
        </div>
      `
      return
    }

    // Sort expenses by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))

    container.innerHTML = filteredExpenses.map(expense => this.createExpenseCard(expense)).join('')
  }

  createExpenseCard(expense) {
    const category = this.categories.find(c => c.id === expense.category)
    const isRecent = new Date() - new Date(expense.createdAt) < 24 * 60 * 60 * 1000 // Last 24 hours

    return `
      <div class="expense-card ${isRecent ? 'recent' : ''}" onclick="window.expensesManager.editExpense(${expense.id})">
        <div class="expense-icon" style="background-color: ${category?.color || '#6b7280'}">
          ${category?.icon || '📦'}
        </div>
        
        <div class="expense-content">
          <div class="expense-header">
            <h4 class="expense-description">${this.escapeHtml(expense.description)}</h4>
            <span class="expense-amount">R$ ${expense.amount.toFixed(2).replace('.', ',')}</span>
          </div>
          
          <div class="expense-meta">
            <span class="expense-category">${category?.name || 'Outros'}</span>
            <span class="expense-date">${this.formatDate(expense.date)}</span>
            <span class="expense-payment">${this.getPaymentMethodText(expense.paymentMethod)}</span>
          </div>
          
          ${expense.tags && expense.tags.length > 0 ? `
          <div class="expense-tags">
            ${expense.tags.map(tag => `<span class="tag tag-sm">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
          ` : ''}
          
          ${expense.notes ? `
          <div class="expense-notes">
            <p>${this.escapeHtml(expense.notes)}</p>
          </div>
          ` : ''}
        </div>
        
        <div class="expense-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm" onclick="window.expensesManager.duplicateExpense(${expense.id})" title="Duplicar">
            📋
          </button>
          <button class="btn btn-sm btn-danger" onclick="window.expensesManager.deleteExpense(${expense.id})" title="Excluir">
            🗑️
          </button>
        </div>
      </div>
    `
  }

  duplicateExpense(id) {
    const expense = this.expenses.find(e => e.id === id)
    if (!expense) return

    const duplicatedExpense = {
      ...expense,
      id: Date.now(),
      description: expense.description + ' (Cópia)',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.expenses.push(duplicatedExpense)
    this.saveExpenses()
    this.renderExpenses()
    this.updateSummary()
    this.renderChart()
    
    window.app.showNotification('Gasto duplicado com sucesso!', 'success')
  }

  getFilteredExpenses() {
    return this.expenses.filter(expense => {
      const matchesSearch = !this.currentFilter.search || 
        expense.description.toLowerCase().includes(this.currentFilter.search) ||
        expense.tags.some(tag => tag.toLowerCase().includes(this.currentFilter.search))
      
      const matchesCategory = !this.currentFilter.category || expense.category === this.currentFilter.category
      
      const expenseMonth = expense.date.slice(0, 7)
      const matchesMonth = !this.currentFilter.month || expenseMonth === this.currentFilter.month
      
      return matchesSearch && matchesCategory && matchesMonth
    })
  }

  updateSummary() {
    const filteredExpenses = this.getFilteredExpenses()
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const remaining = this.budget - total
    const percentage = this.budget > 0 ? (total / this.budget) * 100 : 0

    // Update summary cards
    const totalElement = document.getElementById('total-expenses')
    const budgetElement = document.getElementById('budget-amount')
    const remainingElement = document.getElementById('remaining-budget')
    const savingsElement = document.getElementById('savings-amount')
    const percentageElement = document.getElementById('budget-percentage')
    const progressBar = document.getElementById('budget-progress-bar')

    if (totalElement) totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`
    if (budgetElement) budgetElement.textContent = `R$ ${this.budget.toFixed(2).replace('.', ',')}`
    if (remainingElement) {
      remainingElement.textContent = `R$ ${remaining.toFixed(2).replace('.', ',')}`
      remainingElement.className = remaining >= 0 ? 'positive' : 'negative'
    }
    if (savingsElement) {
      const savings = Math.max(0, remaining)
      savingsElement.textContent = `R$ ${savings.toFixed(2).replace('.', ',')}`
    }
    if (percentageElement) percentageElement.textContent = `${percentage.toFixed(1)}%`
    if (progressBar) {
      progressBar.style.width = `${Math.min(percentage, 100)}%`
      progressBar.className = `progress-bar ${percentage > 100 ? 'over-budget' : percentage > 80 ? 'warning' : ''}`
    }
  }

  renderChart() {
    const canvas = document.getElementById('expenses-chart-canvas')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const filteredExpenses = this.getFilteredExpenses()

    // Group expenses by category
    const categoryTotals = {}
    this.categories.forEach(cat => {
      categoryTotals[cat.id] = {
        name: cat.name,
        total: 0,
        color: cat.color,
        icon: cat.icon
      }
    })

    filteredExpenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category].total += expense.amount
      }
    })

    // Filter out categories with no expenses
    const data = Object.values(categoryTotals).filter(cat => cat.total > 0)

    if (data.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Inter'
      ctx.textAlign = 'center'
      ctx.fillText('Nenhum dado para exibir', canvas.width / 2, canvas.height / 2)
      return
    }

    // Simple pie chart
    const total = data.reduce((sum, cat) => sum + cat.total, 0)
    let currentAngle = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw pie slices
    data.forEach(category => {
      const sliceAngle = (category.total / total) * 2 * Math.PI
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = category.color
      ctx.fill()
      
      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 20)
      
      ctx.fillStyle = '#374151'
      ctx.font = '12px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(category.name, labelX, labelY)
      ctx.fillText(`R$ ${category.total.toFixed(0)}`, labelX, labelY + 15)
      
      currentAngle += sliceAngle
    })

    // Draw legend
    const legendY = canvas.height - 60
    let legendX = 20
    
    data.forEach(category => {
      ctx.fillStyle = category.color
      ctx.fillRect(legendX, legendY, 15, 15)
      
      ctx.fillStyle = '#374151'
      ctx.font = '12px Inter'
      ctx.textAlign = 'left'
      ctx.fillText(category.name, legendX + 20, legendY + 12)
      
      legendX += ctx.measureText(category.name).width + 50
    })
  }

  setBudget() {
    const newBudget = prompt('Digite o novo orçamento mensal:', this.budget)
    if (newBudget && !isNaN(newBudget) && parseFloat(newBudget) > 0) {
      this.budget = parseFloat(newBudget)
      localStorage.setItem('nucleo_budget', this.budget.toString())
      this.updateSummary()
      window.app.showNotification('Orçamento atualizado com sucesso!', 'success')
    }
  }

  exportReport() {
    const filteredExpenses = this.getFilteredExpenses()
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // Group by category for report
    const categoryTotals = {}
    this.categories.forEach(cat => {
      categoryTotals[cat.id] = { name: cat.name, total: 0, count: 0 }
    })

    filteredExpenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category].total += expense.amount
        categoryTotals[expense.category].count++
      }
    })

    const report = {
      period: this.currentFilter.month,
      summary: {
        totalExpenses: total,
        budget: this.budget,
        remaining: this.budget - total,
        transactionCount: filteredExpenses.length
      },
      categoryBreakdown: Object.values(categoryTotals).filter(cat => cat.total > 0),
      expenses: filteredExpenses.map(expense => ({
        date: expense.date,
        description: expense.description,
        amount: expense.amount,
        category: this.categories.find(c => c.id === expense.category)?.name || 'Outros',
        paymentMethod: this.getPaymentMethodText(expense.paymentMethod)
      })),
      generatedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `nucleo-expenses-report-${this.currentFilter.month}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
    window.app.showNotification('Relatório exportado com sucesso!', 'success')
  }

  getPaymentMethodText(method) {
    const methods = {
      'dinheiro': 'Dinheiro',
      'cartao-debito': 'Cartão de Débito',
      'cartao-credito': 'Cartão de Crédito',
      'pix': 'PIX',
      'transferencia': 'Transferência'
    }
    return methods[method] || method
  }

  importExpenses(expensesData) {
    if (Array.isArray(expensesData)) {
      this.expenses = [...this.expenses, ...expensesData]
      this.saveExpenses()
      this.renderExpenses()
      this.updateSummary()
      this.renderChart()
    }
  }

  getAllExpenses() {
    return this.expenses
  }

  saveExpenses() {
    localStorage.setItem('nucleo_expenses', JSON.stringify(this.expenses))
  }

  loadExpenses() {
    const savedExpenses = localStorage.getItem('nucleo_expenses')
    const savedBudget = localStorage.getItem('nucleo_budget')
    
    if (savedExpenses) {
      try {
        this.expenses = JSON.parse(savedExpenses)
      } catch (error) {
        console.error('Error loading expenses:', error)
        this.expenses = []
      }
    }

    if (savedBudget) {
      this.budget = parseFloat(savedBudget)
    }

    // Load sample data if no expenses exist
    if (this.expenses.length === 0) {
      this.loadSampleExpenses()
    }
  }

  loadSampleExpenses() {
    const today = new Date()
    const thisMonth = today.toISOString().slice(0, 7)
    
    this.expenses = [
      {
        id: 1,
        description: 'Almoço no restaurante',
        amount: 35.50,
        category: 'alimentacao',
        date: today.toISOString().split('T')[0],
        paymentMethod: 'cartao-debito',
        tags: ['restaurante', 'almoço'],
        notes: 'Restaurante próximo ao trabalho',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        description: 'Uber para reunião',
        amount: 18.75,
        category: 'transporte',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        paymentMethod: 'pix',
        tags: ['uber', 'trabalho'],
        notes: '',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        description: 'Compras no supermercado',
        amount: 127.80,
        category: 'alimentacao',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        paymentMethod: 'cartao-credito',
        tags: ['supermercado', 'casa'],
        notes: 'Compras da semana',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 4,
        description: 'Cinema com amigos',
        amount: 45.00,
        category: 'lazer',
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
        paymentMethod: 'cartao-debito',
        tags: ['cinema', 'amigos'],
        notes: 'Filme + pipoca',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString()
      }
    ]

    this.saveExpenses()
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Hoje'
    if (diffDays === 2) return 'Ontem'
    if (diffDays <= 7) return `${diffDays} dias atrás`
    
    return date.toLocaleDateString('pt-BR')
  }
}

// Initialize ExpensesManager globally
window.ExpensesManager = ExpensesManager
