// Notes Manager - Sistema completo de notas interligadas
class NotesManager {
  constructor() {
    this.notes = []
    this.currentView = 'grid'
    this.searchTerm = ''
    this.selectedTags = []
    this.editingNoteId = null
    this.connections = new Map() // Para mapear conexões entre notas
    
    this.init()
  }

  init() {
    this.loadNotes()
    this.bindEvents()
    this.renderNotes()
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById('notes-search')
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase()
        this.renderNotes()
      })
    }

    // View toggle buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.view-btn')) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'))
        e.target.classList.add('active')
        this.currentView = e.target.dataset.view
        this.switchView()
      }
    })

    // Auto-save on content change
    document.addEventListener('input', (e) => {
      if (e.target.matches('#note-content, #note-title')) {
        clearTimeout(this.autoSaveTimeout)
        this.autoSaveTimeout = setTimeout(() => {
          this.autoSave()
        }, 1000)
      }
    })
  }

  createNote() {
    this.editingNoteId = null
    this.showNoteModal({
      title: '',
      content: '',
      tags: []
    })
  }

  editNote(id) {
    const note = this.notes.find(n => n.id === id)
    if (note) {
      this.editingNoteId = id
      this.showNoteModal(note)
    }
  }

  showNoteModal(note) {
    const modal = this.createNoteModal(note)
    document.body.appendChild(modal)
    modal.classList.add('active')
    
    // Focus on title input
    const titleInput = modal.querySelector('#note-title')
    if (titleInput) {
      titleInput.focus()
    }
  }

  createNoteModal(note) {
    const modal = document.createElement('div')
    modal.className = 'modal note-modal'
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${this.editingNoteId ? 'Editar Nota' : 'Nova Nota'}</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Título</label>
            <input type="text" id="note-title" class="form-input" value="${note.title}" placeholder="Digite o título da nota...">
          </div>
          
          <div class="form-group">
            <label class="form-label">Conteúdo</label>
            <textarea id="note-content" class="form-input form-textarea" placeholder="Digite o conteúdo... Use [[Nome da Nota]] para criar links">${note.content}</textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Tags</label>
            <input type="text" id="note-tags" class="form-input" value="${note.tags ? note.tags.join(', ') : ''}" placeholder="Tags separadas por vírgula">
          </div>
          
          <div class="note-preview">
            <h4>Preview dos Links:</h4>
            <div id="links-preview"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="window.notesManager.saveNote()">Salvar</button>
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
          ${this.editingNoteId ? '<button class="btn btn-danger" onclick="window.notesManager.deleteNote(' + this.editingNoteId + ')">Excluir</button>' : ''}
        </div>
      </div>
    `

    // Update links preview on content change
    const contentTextarea = modal.querySelector('#note-content')
    contentTextarea.addEventListener('input', () => {
      this.updateLinksPreview(modal)
    })

    this.updateLinksPreview(modal)
    return modal
  }

  updateLinksPreview(modal) {
    const content = modal.querySelector('#note-content').value
    const preview = modal.querySelector('#links-preview')
    const links = this.extractLinks(content)
    
    if (links.length === 0) {
      preview.innerHTML = '<p class="text-muted">Nenhum link encontrado</p>'
      return
    }

    preview.innerHTML = links.map(link => {
      const existingNote = this.notes.find(n => n.title.toLowerCase() === link.toLowerCase())
      return `
        <div class="link-item ${existingNote ? 'exists' : 'new'}">
          <span class="link-name">${link}</span>
          <span class="link-status">${existingNote ? '✓ Existe' : '+ Criar'}</span>
        </div>
      `
    }).join('')
  }

  extractLinks(content) {
    const linkRegex = /\[\[([^\]]+)\]\]/g
    const links = []
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      if (!links.includes(match[1])) {
        links.push(match[1])
      }
    }

    return links
  }

  saveNote() {
    const modal = document.querySelector('.note-modal.active')
    if (!modal) return

    const title = modal.querySelector('#note-title').value.trim()
    const content = modal.querySelector('#note-content').value.trim()
    const tagsInput = modal.querySelector('#note-tags').value.trim()

    if (!title || !content) {
      window.app.showNotification('Por favor, preencha o título e conteúdo da nota.', 'warning')
      return
    }

    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    const links = this.extractLinks(content)

    const noteData = {
      title,
      content,
      tags,
      links,
      updatedAt: new Date().toISOString()
    }

    if (this.editingNoteId) {
      // Update existing note
      const noteIndex = this.notes.findIndex(n => n.id === this.editingNoteId)
      this.notes[noteIndex] = {
        ...this.notes[noteIndex],
        ...noteData
      }
    } else {
      // Create new note
      const newNote = {
        id: Date.now(),
        ...noteData,
        createdAt: new Date().toISOString()
      }
      this.notes.push(newNote)
    }

    // Create linked notes if they don't exist
    this.createLinkedNotes(links)
    
    // Update connections
    this.updateConnections()
    
    this.saveNotes()
    this.renderNotes()
    modal.remove()
    
    window.app.showNotification('Nota salva com sucesso!', 'success')
  }

  createLinkedNotes(links) {
    links.forEach(linkTitle => {
      const existingNote = this.notes.find(n => n.title.toLowerCase() === linkTitle.toLowerCase())
      if (!existingNote) {
        const newNote = {
          id: Date.now() + Math.random(),
          title: linkTitle,
          content: `# ${linkTitle}\n\nNota criada automaticamente através de um link.`,
          tags: ['auto-created'],
          links: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.notes.push(newNote)
      }
    })
  }

  updateConnections() {
    this.connections.clear()
    
    this.notes.forEach(note => {
      note.links.forEach(link => {
        const targetNote = this.notes.find(n => n.title.toLowerCase() === link.toLowerCase())
        if (targetNote) {
          // Add bidirectional connection
          if (!this.connections.has(note.id)) {
            this.connections.set(note.id, new Set())
          }
          if (!this.connections.has(targetNote.id)) {
            this.connections.set(targetNote.id, new Set())
          }
          
          this.connections.get(note.id).add(targetNote.id)
          this.connections.get(targetNote.id).add(note.id)
        }
      })
    })
  }

  deleteNote(id) {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return

    this.notes = this.notes.filter(n => n.id !== id)
    this.updateConnections()
    this.saveNotes()
    this.renderNotes()
    
    document.querySelector('.note-modal.active')?.remove()
    window.app.showNotification('Nota excluída com sucesso!', 'success')
  }

  switchView() {
    const container = document.getElementById('notes-container')
    const graphContainer = document.getElementById('notes-graph')
    
    if (!container) return

    switch (this.currentView) {
      case 'grid':
        container.className = 'notes-grid'
        container.classList.remove('hidden')
        graphContainer?.classList.add('hidden')
        this.renderNotes()
        break
      case 'list':
        container.className = 'notes-list'
        container.classList.remove('hidden')
        graphContainer?.classList.add('hidden')
        this.renderNotes()
        break
      case 'graph':
        container.classList.add('hidden')
        graphContainer?.classList.remove('hidden')
        this.renderGraph()
        break
    }
  }

  renderNotes() {
    const container = document.getElementById('notes-container')
    if (!container) return

    let filteredNotes = this.notes.filter(note => {
      const matchesSearch = !this.searchTerm || 
        note.title.toLowerCase().includes(this.searchTerm) ||
        note.content.toLowerCase().includes(this.searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
      
      return matchesSearch
    })

    if (filteredNotes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>Nenhuma nota encontrada</h3>
          <p>Crie sua primeira nota para começar a organizar suas ideias</p>
          <button class="btn btn-primary" onclick="window.notesManager.createNote()">
            Criar Primeira Nota
          </button>
        </div>
      `
      return
    }

    // Sort notes by update date
    filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    if (this.currentView === 'list') {
      this.renderNotesList(container, filteredNotes)
    } else {
      this.renderNotesGrid(container, filteredNotes)
    }
  }

  renderNotesGrid(container, notes) {
    container.innerHTML = notes.map(note => `
      <div class="note-card" onclick="window.notesManager.editNote(${note.id})">
        <div class="note-header">
          <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
          <div class="note-meta">
            <span class="note-date">${this.formatDate(note.updatedAt)}</span>
          </div>
        </div>
        
        <div class="note-content">
          <p>${this.processNoteContent(note.content)}</p>
        </div>
        
        <div class="note-footer">
          <div class="note-tags">
            ${note.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
          
          <div class="note-connections">
            ${this.connections.get(note.id)?.size || 0} conexões
          </div>
        </div>
      </div>
    `).join('')
  }

  renderNotesList(container, notes) {
    container.innerHTML = `
      <div class="notes-table">
        <div class="table-header">
          <div class="col-title">Título</div>
          <div class="col-tags">Tags</div>
          <div class="col-connections">Conexões</div>
          <div class="col-date">Atualizado</div>
          <div class="col-actions">Ações</div>
        </div>
        ${notes.map(note => `
          <div class="table-row" onclick="window.notesManager.editNote(${note.id})">
            <div class="col-title">
              <strong>${this.escapeHtml(note.title)}</strong>
              <p class="note-excerpt">${this.getExcerpt(note.content)}</p>
            </div>
            <div class="col-tags">
              ${note.tags.map(tag => `<span class="tag tag-sm">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="col-connections">
              ${this.connections.get(note.id)?.size || 0}
            </div>
            <div class="col-date">
              ${this.formatDate(note.updatedAt)}
            </div>
            <div class="col-actions">
              <button class="btn btn-sm" onclick="event.stopPropagation(); window.notesManager.duplicateNote(${note.id})" title="Duplicar">
                📋
              </button>
              <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); window.notesManager.deleteNote(${note.id})" title="Excluir">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  renderGraph() {
    const graphContainer = document.getElementById('notes-graph')
    if (!graphContainer) return

    // Simple graph visualization using SVG
    const width = graphContainer.clientWidth || 800
    const height = 600
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', width)
    svg.setAttribute('height', height)
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

    // Position nodes in a circle
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    const nodes = this.notes.map((note, index) => {
      const angle = (index / this.notes.length) * 2 * Math.PI
      return {
        ...note,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    })

    // Draw connections
    nodes.forEach(node => {
      const connections = this.connections.get(node.id)
      if (connections) {
        connections.forEach(connectedId => {
          const connectedNode = nodes.find(n => n.id === connectedId)
          if (connectedNode) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line.setAttribute('x1', node.x)
            line.setAttribute('y1', node.y)
            line.setAttribute('x2', connectedNode.x)
            line.setAttribute('y2', connectedNode.y)
            line.setAttribute('stroke', '#cbd5e1')
            line.setAttribute('stroke-width', '2')
            svg.appendChild(line)
          }
        })
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('cursor', 'pointer')
      group.onclick = () => this.editNote(node.id)

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', node.x)
      circle.setAttribute('cy', node.y)
      circle.setAttribute('r', '20')
      circle.setAttribute('fill', '#4f46e5')
      circle.setAttribute('stroke', '#fff')
      circle.setAttribute('stroke-width', '3')

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', node.x)
      text.setAttribute('y', node.y + 35)
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('font-size', '12')
      text.setAttribute('fill', '#374151')
      text.textContent = node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title

      group.appendChild(circle)
      group.appendChild(text)
      svg.appendChild(group)
    })

    graphContainer.innerHTML = ''
    graphContainer.appendChild(svg)
  }

  processNoteContent(content) {
    // Process [[links]] and limit content length
    let processed = content.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
      return `<span class="note-link">${linkText}</span>`
    })
    
    // Limit to 150 characters
    if (processed.length > 150) {
      processed = processed.substring(0, 150) + '...'
    }
    
    return processed
  }

  getExcerpt(content) {
    const plainText = content.replace(/\[\[([^\]]+)\]\]/g, '$1')
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
  }

  duplicateNote(id) {
    const note = this.notes.find(n => n.id === id)
    if (!note) return

    const duplicatedNote = {
      ...note,
      id: Date.now(),
      title: note.title + ' (Cópia)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.notes.push(duplicatedNote)
    this.saveNotes()
    this.renderNotes()
    
    window.app.showNotification('Nota duplicada com sucesso!', 'success')
  }

  exportNotes() {
    const data = {
      notes: this.notes,
      connections: Array.from(this.connections.entries()),
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `nucleo-notes-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
    window.app.showNotification('Notas exportadas com sucesso!', 'success')
  }

  importNotes(notesData) {
    if (Array.isArray(notesData)) {
      this.notes = [...this.notes, ...notesData]
      this.updateConnections()
      this.saveNotes()
      this.renderNotes()
    }
  }

  getAllNotes() {
    return this.notes
  }

  saveNotes() {
    localStorage.setItem('nucleo_notes', JSON.stringify(this.notes))
  }

  loadNotes() {
    const saved = localStorage.getItem('nucleo_notes')
    if (saved) {
      try {
        this.notes = JSON.parse(saved)
        this.updateConnections()
      } catch (error) {
        console.error('Error loading notes:', error)
        this.notes = []
      }
    }

    // Load sample data if no notes exist
    if (this.notes.length === 0) {
      this.loadSampleNotes()
    }
  }

  loadSampleNotes() {
    this.notes = [
      {
        id: 1,
        title: 'Bem-vindo ao Núcleo',
        content: 'Esta é sua primeira nota! O Núcleo permite criar conexões entre suas ideias usando [[links]]. Experimente criar uma conexão com [[Ideias de Projeto]] ou [[Metas Pessoais]].',
        tags: ['tutorial', 'início'],
        links: ['Ideias de Projeto', 'Metas Pessoais'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Ideias de Projeto',
        content: 'Aqui você pode anotar suas ideias de projetos. Conecte com [[Bem-vindo ao Núcleo]] para ver como funciona o sistema de links.',
        tags: ['projetos', 'ideias'],
        links: ['Bem-vindo ao Núcleo'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    this.updateConnections()
    this.saveNotes()
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

// Initialize NotesManager globally
window.NotesManager = NotesManager
