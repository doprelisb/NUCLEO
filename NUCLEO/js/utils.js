// Utility functions and helpers
class Utils {
  // Date formatting utilities
  static formatDate(date, format = 'pt-BR') {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    switch (format) {
      case 'relative':
        return this.getRelativeTime(dateObj)
      case 'short':
        return dateObj.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      case 'long':
        return dateObj.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })
      default:
        return dateObj.toLocaleDateString('pt-BR')
    }
  }

  static getRelativeTime(date) {
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`
    } else if (diffDays === 1) {
      return 'Ontem'
    } else if (diffDays <= 7) {
      return `${diffDays} dias atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }

  // String utilities
  static escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  static truncate(text, length = 100) {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  }

  static slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  // Number formatting utilities
  static formatCurrency(amount, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  static formatNumber(number, decimals = 0) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  }

  static formatPercentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`
  }

  // Color utilities
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  static rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  static getContrastColor(hexColor) {
    const rgb = this.hexToRgb(hexColor)
    if (!rgb) return '#000000'
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  // Storage utilities
  static saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error saving to storage:', error)
      return false
    }
  }

  static loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error loading from storage:', error)
      return defaultValue
    }
  }

  static removeFromStorage(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from storage:', error)
      return false
    }
  }

  // File utilities
  static downloadFile(data, filename, type = 'application/json') {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  static readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // Validation utilities
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  static isValidDate(date) {
    return date instanceof Date && !isNaN(date)
  }

  // DOM utilities
  static createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag)
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value
      } else if (key === 'innerHTML') {
        element.innerHTML = value
      } else {
        element.setAttribute(key, value)
      }
    })
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      } else {
        element.appendChild(child)
      }
    })
    
    return element
  }

  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  static throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Array utilities
  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  }

  static sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (direction === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    })
  }

  static unique(array, key = null) {
    if (key) {
      const seen = new Set()
      return array.filter(item => {
        const value = item[key]
        if (seen.has(value)) {
          return false
        }
        seen.add(value)
        return true
      })
    }
    return [...new Set(array)]
  }

  // Search utilities
  static fuzzySearch(query, items, keys = []) {
    if (!query) return items
    
    const searchTerm = query.toLowerCase()
    
    return items.filter(item => {
      if (keys.length === 0) {
        return JSON.stringify(item).toLowerCase().includes(searchTerm)
      }
      
      return keys.some(key => {
        const value = this.getNestedValue(item, key)
        return value && value.toString().toLowerCase().includes(searchTerm)
      })
    })
  }

  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // Performance utilities
  static measurePerformance(name, fn) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  }

  static memoize(fn) {
    const cache = new Map()
    return function(...args) {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = fn.apply(this, args)
      cache.set(key, result)
      return result
    }
  }

  // Random utilities
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  static randomColor() {
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
      '#8b5cf6', '#06b6d4', '#64748b', '#6b7280'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  static randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Animation utilities
  static fadeIn(element, duration = 300) {
    element.style.opacity = '0'
    element.style.display = 'block'
    
    const start = performance.now()
    
    function animate(currentTime) {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)
      
      element.style.opacity = progress
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }

  static fadeOut(element, duration = 300) {
    const start = performance.now()
    const startOpacity = parseFloat(getComputedStyle(element).opacity)
    
    function animate(currentTime) {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)
      
      element.style.opacity = startOpacity * (1 - progress)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        element.style.display = 'none'
      }
    }
    
    requestAnimationFrame(animate)
  }

  static slideDown(element, duration = 300) {
    element.style.height = '0'
    element.style.overflow = 'hidden'
    element.style.display = 'block'
    
    const targetHeight = element.scrollHeight
    const start = performance.now()
    
    function animate(currentTime) {
      const elapsed = currentTime - start
      const progress = Math.min(elapsed / duration, 1)
      
      element.style.height = (targetHeight * progress) + 'px'
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        element.style.height = 'auto'
        element.style.overflow = 'visible'
      }
    }
    
    requestAnimationFrame(animate)
  }

  // Notification utilities
  static showToast(message, type = 'info', duration = 3000) {
    const toast = this.createElement('div', {
      className: `toast toast-${type}`,
      innerHTML: message
    })
    
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out'
    })
    
    const colors = {
      info: '#4f46e5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
    toast.style.backgroundColor = colors[type] || colors.info
    
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)'
    }, 100)
    
    // Auto remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, duration)
  }
}

// Export utilities globally
window.Utils = Utils

// Add some global helper functions
window.formatDate = Utils.formatDate
window.formatCurrency = Utils.formatCurrency
window.escapeHtml = Utils.escapeHtml
window.debounce = Utils.debounce
window.throttle = Utils.throttle
