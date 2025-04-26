/**
 * Custom Modal Element
 * A reusable modal component that can be used for confirmations,
 * alerts, or any pop-up content.
 */
class CustomModal extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      
      // Create modal structure
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: none;
          }
          
          :host([open]) {
            display: block;
          }
          
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          
          .modal-container {
            background-color: white;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            overflow: hidden;
          }
          
          .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #eee;
          }
          
          .modal-body {
            padding: 1.5rem;
          }
          
          .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
          }
          
          ::slotted(h2) {
            margin: 0;
            color: #333;
          }
        </style>
        
        <div class="modal-overlay">
          <div class="modal-container">
            <div class="modal-header">
              <slot name="title"></slot>
            </div>
            <div class="modal-body">
              <slot name="content"></slot>
            </div>
            <div class="modal-footer">
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
      `;
      
      // Close modal when clicking outside
      this.shadowRoot.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === this.shadowRoot.querySelector('.modal-overlay')) {
          this.close();
        }
      });
      
      // Close with escape key
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    
    // Lifecycle callbacks
    connectedCallback() {
      document.addEventListener('keydown', this.handleKeyDown);
    }
    
    disconnectedCallback() {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    
    // Handle escape key
    handleKeyDown(e) {
      if (e.key === 'Escape' && this.hasAttribute('open')) {
        this.close();
      }
    }
    
    // Public methods
    open() {
      this.setAttribute('open', '');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    close() {
      this.removeAttribute('open');
      document.body.style.overflow = '';
    }
    
    // Observe the 'open' attribute
    static get observedAttributes() {
      return ['open'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'open') {
        // Dispatch events
        if (newValue !== null && oldValue === null) {
          this.dispatchEvent(new CustomEvent('modal-open'));
        } else if (newValue === null && oldValue !== null) {
          this.dispatchEvent(new CustomEvent('modal-close'));
        }
      }
    }
  }
  
  /**
   * Custom Toast Element
   * A notification component for showing success, error, or info messages.
   */
  class CustomToast extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      
      // Create toast structure
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: none;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
          }
          
          :host(.show) {
            display: block;
            animation: slide-in 0.3s ease forwards;
          }
          
          .toast-container {
            background-color: #3498db;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            max-width: 350px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          :host(.success) .toast-container {
            background-color: #2ecc71;
          }
          
          :host(.error) .toast-container {
            background-color: #e74c3c;
          }
          
          :host(.warning) .toast-container {
            background-color: #f39c12;
          }
          
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        </style>
        
        <div class="toast-container">
          <div class="toast-message"></div>
        </div>
      `;
    }
    
    // Show toast with message and options
    show(message, type = 'info', duration = 3000) {
      // Update message
      this.shadowRoot.querySelector('.toast-message').textContent = message;
      
      // Set type class
      this.className = 'show';
      if (['success', 'error', 'warning'].includes(type)) {
        this.classList.add(type);
      }
      
      // Show and auto-hide
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => this.hide(), duration);
    }
    
    // Hide toast
    hide() {
      this.className = '';
    }
  }
  
  /**
   * Custom Note Item Element
   * A specialized component for displaying a note with its content and actions.
   */
  class NoteItem extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      
      // Create note item structure
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            margin-bottom: 1rem;
          }
          
          .note-container {
            background-color: white;
            border-radius: 8px;
            padding: 1.2rem;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 1px solid #ddd;
          }
          
          :host([archived]) .note-container {
            background-color: #f8f9fa;
            border-color: #e9ecef;
          }
          
          .note-container:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }
          
          .note-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
          }
          
          .note-title {
            margin: 0;
            font-size: 1.2rem;
            color: #2980b9;
            word-break: break-word;
          }
          
          .note-date {
            font-size: 0.8rem;
            color: #777;
            margin-top: 0.3rem;
          }
          
          .note-content {
            margin-bottom: 1rem;
            word-break: break-word;
          }
          
          .note-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.8rem;
          }
          
          .action-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            transition: color 0.2s ease;
          }
          
          .archive-btn:hover {
            color: #f39c12;
          }
          
          .delete-btn:hover {
            color: #e74c3c;
          }
          
          .archived-badge {
            display: none;
            font-size: 0.8rem;
            padding: 0.2rem 0.5rem;
            background-color: #f8f9fa;
            border-radius: 4px;
            color: #6c757d;
            margin-top: 0.5rem;
          }
          
          :host([archived]) .archived-badge {
            display: inline-block;
          }
        </style>
        
        <div class="note-container">
          <div class="note-header">
            <div>
              <h3 class="note-title"></h3>
              <div class="note-date"></div>
            </div>
          </div>
          <div class="note-content"></div>
          <div class="archived-badge">Archived</div>
          <div class="note-actions">
            <button class="action-btn archive-btn" title="Archive note">📁</button>
            <button class="action-btn delete-btn" title="Delete note">🗑️</button>
          </div>
        </div>
      `;
      
      // Add event listeners
      this.shadowRoot.querySelector('.archive-btn').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('archive-note', {
          bubbles: true,
          composed: true,
          detail: { noteId: this.getAttribute('note-id') }
        }));
      });
      
      this.shadowRoot.querySelector('.delete-btn').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('delete-note', {
          bubbles: true,
          composed: true,
          detail: { noteId: this.getAttribute('note-id') }
        }));
      });
    }
    
    // Observe attributes
    static get observedAttributes() {
      return ['title', 'date', 'content', 'archived'];
    }
    
    // Handle attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
      switch (name) {
        case 'title':
          this.shadowRoot.querySelector('.note-title').textContent = newValue;
          break;
        case 'date':
          const dateObj = new Date(newValue);
          const formattedDate = dateObj.toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          this.shadowRoot.querySelector('.note-date').textContent = formattedDate;
          break;
        case 'content':
          this.shadowRoot.querySelector('.note-content').textContent = newValue;
          break;
        case 'archived':
          if (newValue !== null) {
            this.shadowRoot.querySelector('.archive-btn').textContent = '📂';
            this.shadowRoot.querySelector('.archive-btn').title = 'Unarchive note';
          } else {
            this.shadowRoot.querySelector('.archive-btn').textContent = '📁';
            this.shadowRoot.querySelector('.archive-btn').title = 'Archive note';
          }
          break;
      }
    }
  }
  
  // Register custom elements
  customElements.define('custom-modal', CustomModal);
  customElements.define('custom-toast', CustomToast);
  customElements.define('note-item', NoteItem);