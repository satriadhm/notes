// Loading Indicator Component
// A Web Component to show loading state during API operations

class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Create loading indicator structure
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          justify-content: center;
          align-items: center;
        }
        
        :host(.show) {
          display: flex;
          animation: fade-in 0.3s ease;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .loader {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid var(--primary-color, #3498db);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .message {
          color: white;
          margin-top: 1rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: pulse 1.5s infinite alternate;
        }
        
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: rgba(0, 0, 0, 0.7);
          padding: 2rem;
          border-radius: 8px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
      </style>
      
      <div class="container">
        <div class="loader"></div>
        <div class="message">Loading...</div>
      </div>
    `;
  }
  
  // Show loading with optional custom message
  show(message = 'Loading...') {
    this.shadowRoot.querySelector('.message').textContent = message;
    this.classList.add('show');
  }
  
  // Hide loading
  hide() {
    this.classList.remove('show');
  }
}

// Register custom element
customElements.define('loading-indicator', LoadingIndicator);