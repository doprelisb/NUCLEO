// Sistema completo de notas com links bidirecionais
class NotesManager {
  constructor() {
    this.notes = []
    this.currentNote = null
    this.searchTimeout = null
    this.autoSaveTimeout = null
  }

  setupNotesEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("notes-search")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => {
          this.searchNotes(e.target.value)
        }, 300)
      })
    }

    // Filter and sort
    const filterSelect = document.getElementById("notes-filter")
    const sortSelect = document.getElementById("notes-sort")

    if (filterSelect) {
      filterSelect.addEventListener("change", () => this.filterNotes())
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", () => this.sortNotes())
    }
  }

  updateNotesDisplay(notes) {
    this.notes = notes
    this.renderNotesList(notes)
  }

  renderNotesList(notes) {
    const notesList = document.getElementById("notes-list")
    if (!notes || notes.length === 0) {
      notesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>Nenhuma nota encontrada</h3>
          <p>Crie sua primeira nota para começar a organizar suas ideias.</p>
          <button onclick="workspaceManager.createNote()" class="btn btn-primary">
            Criar Primeira Nota
          </button>
        </div>
      `
      return
    }

    notesList.innerHTML = notes
      .map(
        (note) => `
        <div class="note-item ${this.currentNote?.id === note.id ? "active" : ""}" 
             onclick="notesManager.selectNote('${note.id}')">
          <div class="note-header">
            <h4 class="note-title">${note.title}</h4>
            <div class="note-actions">
              <button onclick="event.stopPropagation(); notesManager.toggleFavorite('${note.id}')" 
                      class="action-btn ${note.favorite ? "active" : ""}">
                ⭐
              </button>
              <button onclick="event.stopPropagation(); notesManager.deleteNote('${note.id}')" 
                      class="action-btn delete">
                🗑️
              </button>
            </div>
          </div>
          <div class="note-preview">
            ${this.getPreviewText(note.content)}
          </div>
          <div class="note-meta">
            <div class="note-tags">
              ${note.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
            </div>
            <div class="note-links">
              ${note.linkedNotes.length > 0 ? `🔗 ${note.linkedNotes.length}` : ""}
            </div>
            <div class="note-date">
              ${this.formatDate(note.updatedAt)}
            </div>
          </div>
        </div>
      `,
      )
      .join("")
  }

  async selectNote(noteId) {
    const note = this.notes.find((n) => n.id === noteId)
    if (!note) return

    // Save current note if editing
    if (this.currentNote && this.hasUnsavedChanges()) {
      await this.saveCurrentNote()
    }

    this.currentNote = note
    this.renderNoteEditor(note)
    this.updateActiveNoteInList(noteId)
  }

  renderNoteEditor(note) {
    const editor = document.getElementById("note-editor")
    editor.innerHTML = `
      <div class="editor-header">
        <input type="text" 
               class="note-title-input" 
               value="${note.title}" 
               onchange="notesManager.updateNoteTitle(this.value)"
               placeholder="Título da nota...">
        <div class="editor-actions">
          <button onclick="notesManager.togglePreview()" class="btn btn-secondary">
            👁️ Preview
          </button>
          <button onclick="notesManager.showNoteLinks()" class="btn btn-secondary">
            🔗 Links
          </button>
          <button onclick="notesManager.saveCurrentNote()" class="btn btn-primary">
            💾 Salvar
          </button>
        </div>
      </div>
      
      <div class="editor-body">
        <div class="editor-toolbar">
          <button onclick="notesManager.insertMarkdown('**', '**')" class="toolbar-btn" title="Negrito">
            <strong>B</strong>
          </button>
          <button onclick="notesManager.insertMarkdown('*', '*')" class="toolbar-btn" title="Itálico">
            <em>I</em>
          </button>
          <button onclick="notesManager.insertMarkdown('[[', ']]')" class="toolbar-btn" title="Link">
            🔗
          </button>
          <button onclick="notesManager.insertMarkdown('- ', '')" class="toolbar-btn" title="Lista">
            📝
          </button>
          <button onclick="notesManager.insertMarkdown('# ', '')" class="toolbar-btn" title="Título">
            H1
          </button>
        </div>
        
        <textarea id="note-content" 
                  class="note-content-editor"
                  oninput="notesManager.handleContentChange()"
                  placeholder="Escreva sua nota aqui... Use [[nome da nota]] para criar links entre notas.">${note.content}</textarea>
      </div>
      
      <div class="editor-footer">
        <div class="editor-stats">
          <span>Palavras: <span id="word-count">${this.countWords(note.content)}</span></span>
          <span>Caracteres: <span id="char-count">${note.content.length}</span></span>
          <span>Links: <span id="link-count">${note.linkedNotes.length}</span></span>
        </div>
        <div class="editor-status">
          <span id="save-status">Salvo</span>
        </div>
      </div>
    `

    // Setup auto-save
    this.setupAutoSave()
  }

  setupAutoSave() {
    const contentEditor = document.getElementById("note-content")
    if (contentEditor) {
      contentEditor.addEventListener("input", () => {
        this.markAsUnsaved()
        clearTimeout(this.autoSaveTimeout)
        this.autoSaveTimeout = setTimeout(() => {
          this.saveCurrentNote()
        }, 2000)
      })
    }
  }

  handleContentChange() {
    const content = document.getElementById("note-content").value

    // Update stats
    document.getElementById("word-count").textContent = this.countWords(content)
    document.getElementById("char-count").textContent = content.length

    // Update links
    const links = this.extractLinkedNotes(content)
    document.getElementById("link-count").textContent = links.length

    // Mark as unsaved
    this.markAsUnsaved()
  }

  updateNoteTitle(newTitle) {
    if (this.currentNote) {
      this.currentNote.title = newTitle
      this.markAsUnsaved()
    }
  }

  insertMarkdown(before, after) {
    const textarea = document.getElementById("note-content")
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    const newText = before + selectedText + after
    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end)

    // Set cursor position
    const newCursorPos = start + before.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()

    this.handleContentChange()
  }

  async saveCurrentNote() {
    if (!this.currentNote) return

    const titleInput = document.querySelector(".note-title-input")
    const contentEditor = document.getElementById("note-content")

    if (titleInput && contentEditor) {
      const updatedNote = {
        ...this.currentNote,
        title: titleInput.value,
        content: contentEditor.value,
        linkedNotes: this.extractLinkedNotes(contentEditor.value),
        updatedAt: new Date().toISOString(),
      }

      try {
        const response = await window.api.updateNote(this.currentNote.id, updatedNote)
        if (response.success) {
          this.currentNote = response.data
          this.updateNoteInList(response.data)
          this.markAsSaved()
          window.showAlert("Nota salva com sucesso!", "success")
        } else {
          window.showAlert(response.message || "Erro ao salvar nota", "danger")
        }
      } catch (error) {
        console.error("Erro ao salvar nota:", error)
        window.showAlert("Erro ao salvar nota", "danger")
      }
    }
  }

  async deleteNote(noteId) {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return

    try {
      const response = await window.api.deleteNote(noteId)
      if (response.success) {
        this.notes = this.notes.filter((note) => note.id !== noteId)
        this.renderNotesList(this.notes)

        if (this.currentNote?.id === noteId) {
          this.currentNote = null
          this.renderEmptyEditor()
        }

        window.showAlert("Nota excluída com sucesso!", "success")
      } else {
        window.showAlert(response.message || "Erro ao excluir nota", "danger")
      }
    } catch (error) {
      console.error("Erro ao excluir nota:", error)
      window.showAlert("Erro ao excluir nota", "danger")
    }
  }

  async toggleFavorite(noteId) {
    const note = this.notes.find((n) => n.id === noteId)
    if (!note) return

    note.favorite = !note.favorite

    try {
      const response = await window.api.updateNote(noteId, note)
      if (response.success) {
        this.updateNoteInList(response.data)
        window.showAlert(note.favorite ? "Nota favoritada!" : "Nota removida dos favoritos", "success")
      }
    } catch (error) {
      console.error("Erro ao favoritar nota:", error)
      note.favorite = !note.favorite // Revert on error
    }
  }

  searchNotes(query) {
    if (!query.trim()) {
      this.renderNotesList(this.notes)
      return
    }

    const filteredNotes = this.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
    )

    this.renderNotesList(filteredNotes)
  }

  filterNotes() {
    const filter = document.getElementById("notes-filter").value
    let filteredNotes = [...this.notes]

    switch (filter) {
      case "recent":
        filteredNotes = filteredNotes.filter((note) => {
          const daysDiff = (new Date() - new Date(note.updatedAt)) / (1000 * 60 * 60 * 24)
          return daysDiff <= 7
        })
        break
      case "favorites":
        filteredNotes = filteredNotes.filter((note) => note.favorite)
        break
      case "linked":
        filteredNotes = filteredNotes.filter((note) => note.linkedNotes.length > 0)
        break
    }

    this.renderNotesList(filteredNotes)
  }

  sortNotes() {
    const sort = document.getElementById("notes-sort").value
    const sortedNotes = [...this.notes]

    switch (sort) {
      case "updated":
        sortedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        break
      case "created":
        sortedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "title":
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    this.renderNotesList(sortedNotes)
  }

  showNoteLinks() {
    if (!this.currentNote) return

    const modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Links da Nota</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="links-section">
            <h3>Links Saindo (${this.currentNote.linkedNotes.length})</h3>
            <div class="links-list">
              ${
                this.currentNote.linkedNotes.length > 0
                  ? this.currentNote.linkedNotes
                      .map(
                        (link) => `
                  <div class="link-item">
                    <span class="link-name">[[${link}]]</span>
                    <button onclick="notesManager.createLinkedNote('${link}')" class="btn btn-sm btn-primary">
                      Criar Nota
                    </button>
                  </div>
                `,
                      )
                      .join("")
                  : '<p class="empty-text">Nenhum link encontrado</p>'
              }
            </div>
          </div>
          
          <div class="links-section">
            <h3>Links Chegando</h3>
            <div class="links-list">
              ${
                this.getBacklinks()
                  .map(
                    (note) => `
                <div class="link-item">
                  <span class="link-name">${note.title}</span>
                  <button onclick="notesManager.selectNote('${note.id}'); this.closest('.modal').remove()" 
                          class="btn btn-sm btn-secondary">
                    Abrir
                  </button>
                </div>
              `,
                  )
                  .join("") || '<p class="empty-text">Nenhuma nota aponta para esta</p>'
              }
            </div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)
    modal.classList.add("active")
  }

  getBacklinks() {
    if (!this.currentNote) return []

    return this.notes.filter(
      (note) => note.id !== this.currentNote.id && note.linkedNotes.includes(this.currentNote.title),
    )
  }

  async createLinkedNote(title) {
    const noteData = {
      title: title,
      content: `# ${title}\n\nNova nota criada a partir de um link.`,
      tags: [],
      linkedNotes: [],
    }

    try {
      const response = await window.api.createNote(noteData)
      if (response.success) {
        this.notes.unshift(response.data)
        this.renderNotesList(this.notes)
        this.selectNote(response.data.id)
        window.showAlert("Nota criada com sucesso!", "success")
      }
    } catch (error) {
      console.error("Erro ao criar nota:", error)
      window.showAlert("Erro ao criar nota", "danger")
    }
  }

  togglePreview() {
    const editor = document.getElementById("note-content")
    const preview = document.getElementById("note-preview")

    if (preview) {
      // Switch back to editor
      preview.remove()
      editor.style.display = "block"
    } else {
      // Show preview
      editor.style.display = "none"
      const previewDiv = document.createElement("div")
      previewDiv.id = "note-preview"
      previewDiv.className = "note-preview-content"
      previewDiv.innerHTML = this.renderMarkdown(editor.value)
      editor.parentNode.appendChild(previewDiv)
    }
  }

  renderMarkdown(content) {
    // Simple markdown rendering
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[\[(.*?)\]\]/g, '<a href="#" class="note-link" onclick="notesManager.followLink(\'$1\')">$1</a>')
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/\n/g, "<br>")
  }

  followLink(linkText) {
    const linkedNote = this.notes.find((note) => note.title === linkText)
    if (linkedNote) {
      this.selectNote(linkedNote.id)
    } else {
      if (confirm(`A nota "${linkText}" não existe. Deseja criá-la?`)) {
        this.createLinkedNote(linkText)
      }
    }
  }

  // Utility methods
  getPreviewText(content) {
    return content.substring(0, 150).replace(/\n/g, " ") + (content.length > 150 ? "..." : "")
  }

  countWords(text) {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  extractLinkedNotes(content) {
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

  updateActiveNoteInList(noteId) {
    document.querySelectorAll(".note-item").forEach((item) => {
      item.classList.remove("active")
    })

    const activeItem = document.querySelector(`[onclick*="${noteId}"]`)
    if (activeItem) {
      activeItem.classList.add("active")
    }
  }

  updateNoteInList(updatedNote) {
    const index = this.notes.findIndex((note) => note.id === updatedNote.id)
    if (index !== -1) {
      this.notes[index] = updatedNote
      this.renderNotesList(this.notes)
    }
  }

  renderEmptyEditor() {
    const editor = document.getElementById("note-editor")
    editor.innerHTML = `
      <div class="editor-placeholder">
        <div class="placeholder-content">
          <h3>✨ Selecione uma nota</h3>
          <p>Escolha uma nota da lista ou crie uma nova para começar a escrever.</p>
          <button onclick="workspaceManager.createNote()" class="btn btn-primary">
            Criar Nova Nota
          </button>
        </div>
      </div>
    `
  }

  markAsUnsaved() {
    const status = document.getElementById("save-status")
    if (status) {
      status.textContent = "Não salvo"
      status.className = "unsaved"
    }
  }

  markAsSaved() {
    const status = document.getElementById("save-status")
    if (status) {
      status.textContent = "Salvo"
      status.className = "saved"
    }
  }

  hasUnsavedChanges() {
    const status = document.getElementById("save-status")
    return status && status.classList.contains("unsaved")
  }

  formatDate(date) {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(date).toLocaleDateString(undefined, options)
  }
}

// Global notes manager instance
const notesManager = new NotesManager()

// Extend workspace manager with notes functionality
if (typeof window.WorkspaceManager !== "undefined") {
  window.WorkspaceManager.prototype.setupNotesEventListeners = () => {
    notesManager.setupNotesEventListeners()
  }

  window.WorkspaceManager.prototype.updateNotesDisplay = (notes) => {
    notesManager.updateNotesDisplay(notes)
  }

  window.WorkspaceManager.prototype.openNote = function (noteId) {
    this.switchView("notes").then(() => {
      notesManager.selectNote(noteId)
    })
  }
}
