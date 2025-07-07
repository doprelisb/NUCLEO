// Analytics Manager - Sistema completo de analytics para modo profissional
class AnalyticsManager {
  constructor() {
    this.data = {
      users: [],
      revenue: [],
      tasks: [],
      expenses: [],
      kpis: {}
    }
    this.charts = {}
    this.insights = []
    
    this.init()
  }

  init() {
    this.loadAnalyticsData()
    this.generateInsights()
    this.renderKPIs()
    this.renderCharts()
    this.renderInsights()
  }

  loadAnalyticsData() {
    // Load real data from other managers
    if (window.tasksManager) {
      this.data.tasks = window.tasksManager.getAllTasks()
    }
    
    if (window.expensesManager) {
      this.data.expenses = window.expensesManager.getAllExpenses()
    }

    // Generate sample data for professional metrics
    this.generateSampleData()
  }

  generateSampleData() {
    const now = new Date()
    const months = []
    
    // Generate last 12 months of data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toISOString().slice(0, 7),
        name: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      })
    }

    // Users growth data
    this.data.users = months.map((month, index) => ({
      month: month.month,
      name: month.name,
      total: Math.floor(500 + (index * 150) + (Math.random() * 100)),
      new: Math.floor(50 + (Math.random() * 50)),
      active: Math.floor(300 + (index * 80) + (Math.random() * 50))
    }))

    // Revenue data
    this.data.revenue = months.map((month, index) => ({
      month: month.month,
      name: month.name,
      total: Math.floor(5000 + (index * 1200) + (Math.random() * 2000)),
      recurring: Math.floor(3000 + (index * 800) + (Math.random() * 1000)),
      oneTime: Math.floor(2000 + (index * 400) + (Math.random() * 1000))
    }))

    // Calculate KPIs
    const currentMonth = this.data.users[this.data.users.length - 1]
    const previousMonth = this.data.users[this.data.users.length - 2]
    const currentRevenue = this.data.revenue[this.data.revenue.length - 1]
    const previousRevenue = this.data.revenue[this.data.revenue.length - 2]

    this.data.kpis = {
      activeUsers: {
        value: currentMonth.active,
        change: ((currentMonth.active - previousMonth.active) / previousMonth.active * 100).toFixed(1),
        trend: currentMonth.active > previousMonth.active ? 'up' : 'down'
      },
      monthlyRevenue: {
        value: currentRevenue.total,
        change: ((currentRevenue.total - previousRevenue.total) / previousRevenue.total * 100).toFixed(1),
        trend: currentRevenue.total > previousRevenue.total ? 'up' : 'down'
      },
      conversionRate: {
        value: 3.2,
        change: -0.5,
        trend: 'down'
      },
      productivity: {
        value: this.calculateProductivity(),
        change: 5.2,
        trend: 'up'
      }
    }
  }

  calculateProductivity() {
    if (!this.data.tasks.length) return 87

    const completedTasks = this.data.tasks.filter(task => task.status === 'done').length
    const totalTasks = this.data.tasks.length
    
    return Math.round((completedTasks / totalTasks) * 100)
  }

  renderKPIs() {
    const kpiCards = document.querySelectorAll('.kpi-card')
    const kpis = [
      { key: 'activeUsers', title: 'Usuários Ativos', icon: '👥', format: 'number' },
      { key: 'monthlyRevenue', title: 'Receita Mensal', icon: '💰', format: 'currency' },
      { key: 'conversionRate', title: 'Taxa de Conversão', icon: '📈', format: 'percentage' },
      { key: 'productivity', title: 'Produtividade', icon: '⚡', format: 'percentage' }
    ]

    kpiCards.forEach((card, index) => {
      if (kpis[index]) {
        const kpi = kpis[index]
        const data = this.data.kpis[kpi.key]
        
        card.innerHTML = `
          <div class="kpi-icon">${kpi.icon}</div>
          <div class="kpi-content">
            <h3>${kpi.title}</h3>
            <span class="kpi-value">${this.formatKPIValue(data.value, kpi.format)}</span>
            <span class="kpi-change ${data.trend === 'up' ? 'positive' : 'negative'}">
              ${data.change > 0 ? '+' : ''}${data.change}%
            </span>
          </div>
        `
      }
    })
  }

  formatKPIValue(value, format) {
    switch (format) {
      case 'currency':
        return `R$ ${value.toLocaleString('pt-BR')}`
      case 'percentage':
        return `${value}%`
      case 'number':
        return value.toLocaleString('pt-BR')
      default:
        return value
    }
  }

  renderCharts() {
    this.renderUsersChart()
    this.renderRevenueChart()
    this.renderTasksChart()
    this.renderExpensesDistributionChart()
  }

  renderUsersChart() {
    const canvas = document.getElementById('users-chart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const data = this.data.users.slice(-6) // Last 6 months

    this.drawLineChart(ctx, {
      labels: data.map(d => d.name),
      datasets: [
        {
          label: 'Usuários Ativos',
          data: data.map(d => d.active),
          color: '#4f46e5'
        },
        {
          label: 'Novos Usuários',
          data: data.map(d => d.new),
          color: '#10b981'
        }
      ]
    })
  }

  renderRevenueChart() {
    const canvas = document.getElementById('revenue-chart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const data = this.data.revenue.slice(-6) // Last 6 months

    this.drawBarChart(ctx, {
      labels: data.map(d => d.name),
      datasets: [
        {
          label: 'Receita Total',
          data: data.map(d => d.total),
          color: '#f59e0b'
        }
      ]
    })
  }

  renderTasksChart() {
    const canvas = document.getElementById('tasks-chart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Group tasks by completion date
    const tasksByMonth = {}
    this.data.tasks.forEach(task => {
      if (task.completedAt) {
        const month = task.completedAt.slice(0, 7)
        tasksByMonth[month] = (tasksByMonth[month] || 0) + 1
      }
    })

    const months = Object.keys(tasksByMonth).sort().slice(-6)
    const data = months.map(month => ({
      name: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
      completed: tasksByMonth[month] || 0
    }))

    this.drawLineChart(ctx, {
      labels: data.map(d => d.name),
      datasets: [
        {
          label: 'Tarefas Concluídas',
          data: data.map(d => d.completed),
          color: '#10b981'
        }
      ]
    })
  }

  renderExpensesDistributionChart() {
    const canvas = document.getElementById('expenses-distribution-chart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Group expenses by category
    const expensesByCategory = {}
    this.data.expenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount
    })

    const categories = Object.keys(expensesByCategory)
    const data = categories.map(category => ({
      name: this.getCategoryName(category),
      value: expensesByCategory[category],
      color: this.getCategoryColor(category)
    }))

    this.drawPieChart(ctx, data)
  }

  drawLineChart(ctx, config) {
    const { labels, datasets } = config
    const canvas = ctx.canvas
    const padding = 40
    const chartWidth = canvas.width - (padding * 2)
    const chartHeight = canvas.height - (padding * 2)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Find max value
    const maxValue = Math.max(...datasets.flatMap(d => d.data))
    const minValue = Math.min(...datasets.flatMap(d => d.data))
    const range = maxValue - minValue

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    // Draw datasets
    datasets.forEach(dataset => {
      ctx.strokeStyle = dataset.color
      ctx.lineWidth = 3
      ctx.beginPath()

      dataset.data.forEach((value, index) => {
        const x = padding + (chartWidth / (labels.length - 1)) * index
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Draw point
        ctx.fillStyle = dataset.color
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      })

      ctx.stroke()
    })

    // Draw labels
    ctx.fillStyle = '#374151'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    
    labels.forEach((label, index) => {
      const x = padding + (chartWidth / (labels.length - 1)) * index
      ctx.fillText(label, x, canvas.height - 10)
    })
  }

  drawBarChart(ctx, config) {
    const { labels, datasets } = config
    const canvas = ctx.canvas
    const padding = 40
    const chartWidth = canvas.width - (padding * 2)
    const chartHeight = canvas.height - (padding * 2)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const maxValue = Math.max(...datasets.flatMap(d => d.data))
    const barWidth = chartWidth / labels.length * 0.8

    datasets.forEach(dataset => {
      ctx.fillStyle = dataset.color
      
      dataset.data.forEach((value, index) => {
        const x = padding + (chartWidth / labels.length) * index + (chartWidth / labels.length - barWidth) / 2
        const height = (value / maxValue) * chartHeight
        const y = padding + chartHeight - height

        ctx.fillRect(x, y, barWidth, height)
      })
    })

    // Draw labels
    ctx.fillStyle = '#374151'
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    
    labels.forEach((label, index) => {
      const x = padding + (chartWidth / labels.length) * index + (chartWidth / labels.length) / 2
      ctx.fillText(label, x, canvas.height - 10)
    })
  }

  drawPieChart(ctx, data) {
    const canvas = ctx.canvas
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0

    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()
      
      currentAngle += sliceAngle
    })
  }

  generateInsights() {
    this.insights = []

    // Task completion insight
    const completedTasks = this.data.tasks.filter(task => task.status === 'done').length
    const totalTasks = this.data.tasks.length
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    if (completionRate > 80) {
      this.insights.push({
        type: 'success',
        title: 'Excelente Produtividade!',
        description: `Você completou ${completionRate.toFixed(1)}% das suas tarefas. Continue assim!`,
        action: 'Criar mais tarefas desafiadoras'
      })
    } else if (completionRate < 50) {
      this.insights.push({
        type: 'warning',
        title: 'Produtividade Baixa',
        description: `Apenas ${completionRate.toFixed(1)}% das tarefas foram concluídas. Considere revisar suas prioridades.`,
        action: 'Revisar e reorganizar tarefas'
      })
    }

    // Expense insight
    const thisMonthExpenses = this.data.expenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7)
      const currentMonth = new Date().toISOString().slice(0, 7)
      return expenseMonth === currentMonth
    })

    const totalExpenses = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const budget = window.expensesManager?.budget || 2000

    if (totalExpenses > budget * 0.9) {
      this.insights.push({
        type: 'danger',
        title: 'Orçamento Quase Esgotado',
        description: `Você já gastou R$ ${totalExpenses.toFixed(2)} de R$ ${budget.toFixed(2)} este mês.`,
        action: 'Revisar gastos e ajustar orçamento'
      })
    }

    // Growth insight
    const currentUsers = this.data.kpis.activeUsers.value
    const userGrowth = parseFloat(this.data.kpis.activeUsers.change)

    if (userGrowth > 10) {
      this.insights.push({
        type: 'success',
        title: 'Crescimento Acelerado',
        description: `Crescimento de ${userGrowth}% em usuários ativos este mês!`,
        action: 'Investir em retenção de usuários'
      })
    }

    // Revenue insight
    const revenueGrowth = parseFloat(this.data.kpis.monthlyRevenue.change)
    if (revenueGrowth < 0) {
      this.insights.push({
        type: 'warning',
        title: 'Receita em Declínio',
        description: `Receita diminuiu ${Math.abs(revenueGrowth)}% comparado ao mês anterior.`,
        action: 'Analisar causas e implementar estratégias de recuperação'
      })
    }
  }

  renderInsights() {
    const container = document.getElementById('insights-container')
    if (!container) return

    if (this.insights.length === 0) {
      container.innerHTML = `
        <div class="insight-card info">
          <div class="insight-icon">💡</div>
          <div class="insight-content">
            <h4>Sem insights disponíveis</h4>
            <p>Continue usando o Núcleo para gerar insights personalizados sobre sua produtividade e crescimento.</p>
          </div>
        </div>
      `
      return
    }

    container.innerHTML = this.insights.map(insight => `
      <div class="insight-card ${insight.type}">
        <div class="insight-icon">
          ${this.getInsightIcon(insight.type)}
        </div>
        <div class="insight-content">
          <h4>${insight.title}</h4>
          <p>${insight.description}</p>
          <button class="insight-action btn btn-sm">${insight.action}</button>
        </div>
      </div>
    `).join('')
  }

  getInsightIcon(type) {
    const icons = {
      success: '✅',
      warning: '⚠️',
      danger: '🚨',
      info: '💡'
    }
    return icons[type] || '💡'
  }

  getCategoryName(categoryId) {
    const categories = {
      alimentacao: 'Alimentação',
      transporte: 'Transporte',
      saude: 'Saúde',
      educacao: 'Educação',
      lazer: 'Lazer',
      casa: 'Casa',
      trabalho: 'Trabalho',
      outros: 'Outros'
    }
    return categories[categoryId] || 'Outros'
  }

  getCategoryColor(categoryId) {
    const colors = {
      alimentacao: '#ef4444',
      transporte: '#f59e0b',
      saude: '#10b981',
      educacao: '#3b82f6',
      lazer: '#8b5cf6',
      casa: '#06b6d4',
      trabalho: '#64748b',
      outros: '#6b7280'
    }
    return colors[categoryId] || '#6b7280'
  }

  refreshData() {
    this.loadAnalyticsData()
    this.generateInsights()
    this.renderKPIs()
    this.renderCharts()
    this.renderInsights()
    
    window.app.showNotification('Dados atualizados com sucesso!', 'success')
  }

  exportReport() {
    const report = {
      period: new Date().toISOString().slice(0, 7),
      kpis: this.data.kpis,
      insights: this.insights,
      summary: {
        totalTasks: this.data.tasks.length,
        completedTasks: this.data.tasks.filter(t => t.status === 'done').length,
        totalExpenses: this.data.expenses.reduce((sum, e) => sum + e.amount, 0),
        activeUsers: this.data.kpis.activeUsers.value,
        monthlyRevenue: this.data.kpis.monthlyRevenue.value
      },
      generatedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `nucleo-analytics-report-${new Date().toISOString().slice(0, 7)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
    window.app.showNotification('Relatório de analytics exportado!', 'success')
  }
}

// Initialize AnalyticsManager globally
window.AnalyticsManager = AnalyticsManager
