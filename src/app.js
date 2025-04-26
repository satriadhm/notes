// Notes App - Main JavaScript File
import NotesAPI from './api-service';
import './loading-indicator';
import './custom-elements';
import './styles.css'; // Make sure styles are properly imported

// DOM Elements
const notesContainer = document.getElementById('notes-container');
const addNoteForm = document.getElementById('add-note-form');
const noteTitleInput = document.getElementById('note-title');
const noteBodyInput = document.getElementById('note-body');
const saveButton = document.getElementById('save-button');
const searchInput = document.getElementById('search-notes');
const searchButton = document.getElementById('search-button');
const viewAllButton = document.getElementById('view-all');
const viewArchivedButton = document.getElementById('view-archived');
const confirmModal = document.getElementById('confirm-modal');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const notificationToast = document.getElementById('notification-toast');
const themeToggleButton = document.getElementById('theme-toggle');
const titleValidation = document.getElementById('title-validation');
const bodyValidation = document.getElementById('body-validation');
const bodyRemainingChars = document.getElementById('body-remaining');
const charsCount = document.getElementById('chars-count');

// Create loading indicator
const loadingIndicator = document.createElement('loading-indicator');
document.body.appendChild(loadingIndicator);

// State
let notes = []; // Will be populated from API
let currentNoteId = null; // For deletion confirmation
let currentViewMode = 'all'; // 'all' or 'archived'
let searchTerm = '';
const maxBodyLength = 200;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  // Set up event listeners
  setupEventListeners();

  // Initialize form validation
  setupFormValidation();

  // Initialize dark/light theme
  initializeTheme();
  
  // Load notes from API
  await loadNotesFromAPI();
}

// Event Listeners Setup
function setupEventListeners() {
  // Add note form submission
  addNoteForm.addEventListener('submit', handleAddNote);

  // Search functionality
  searchInput.addEventListener('input', handleSearch);
  searchButton.addEventListener('click', () => handleSearch({ target: searchInput }));

  // View filtering
  viewAllButton.addEventListener('click', () => switchView('all'));
  viewArchivedButton.addEventListener('click', () => switchView('archived'));

  // Modal actions
  modalCancelBtn.addEventListener('click', () => confirmModal.close());
  modalConfirmBtn.addEventListener('click', confirmDeleteNote);

  // Theme toggling
  themeToggleButton.addEventListener('click', toggleTheme);

  // Custom events from web components
  document.addEventListener('archive-note', handleArchiveNote);
  document.addEventListener('delete-note', handleDeleteNote);
}

// Form Validation
function setupFormValidation() {
  // Title validation
  noteTitleInput.addEventListener('input', validateForm);

  // Body validation with character count
  noteBodyInput.addEventListener('input', (e) => {
    const remainingChars = maxBodyLength - e.target.value.length;
    charsCount.textContent = remainingChars;

    if (remainingChars < 0) {
      bodyRemainingChars.style.color = 'var(--secondary-color)';
    } else if (remainingChars < 20) {
      bodyRemainingChars.style.color = 'var(--warning-color)';
    } else {
      bodyRemainingChars.style.color = '';
    }

    validateForm();
  });
}

function validateForm() {
  let isValid = true;

  // Validate title
  if (noteTitleInput.value.length < 3) {
    titleValidation.textContent = 'Title must be at least 3 characters';
    noteTitleInput.classList.add('invalid');
    isValid = false;
  } else {
    titleValidation.textContent = '';
    noteTitleInput.classList.remove('invalid');
  }

  // Validate body
  if (noteBodyInput.value.length < 5) {
    bodyValidation.textContent = 'Content must be at least 5 characters';
    noteBodyInput.classList.add('invalid');
    isValid = false;
  } else if (noteBodyInput.value.length > maxBodyLength) {
    bodyValidation.textContent = `Content exceeds maximum length of ${maxBodyLength} characters`;
    noteBodyInput.classList.add('invalid');
    isValid = false;
  } else {
    bodyValidation.textContent = '';
    noteBodyInput.classList.remove('invalid');
  }

  // Enable/disable save button
  saveButton.disabled = !isValid;

  return isValid;
}

// Theme Handling
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggleButton.textContent = '☀️';
  } else {
    themeToggleButton.textContent = '🌙';
  }
}

function toggleTheme() {
  const isDarkTheme = document.body.classList.toggle('dark-theme');
  themeToggleButton.textContent = isDarkTheme ? '☀️' : '🌙';
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');

  // Add animation class for smooth transition (Optional Criteria 3)
  document.body.classList.add('theme-transition');
  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 500);

  // Show toast notification
  showNotification(isDarkTheme ? 'Dark theme activated' : 'Light theme activated');
}

// API Integration Functions
async function loadNotesFromAPI() {
  try {
    loadingIndicator.show('Loading notes...');
    
    if (currentViewMode === 'all') {
      notes = await NotesAPI.getAllNotes();
    } else {
      notes = await NotesAPI.getArchivedNotes();
    }
    
    renderNotes();
  } catch (error) {
    showNotification('Failed to load notes. Please try again.', 'error');
    console.error('Error loading notes:', error);
  } finally {
    loadingIndicator.hide();
  }
}

// Notes CRUD Operations
async function handleAddNote(event) {
  event.preventDefault();

  if (!validateForm()) return;

  const title = noteTitleInput.value.trim();
  const body = noteBodyInput.value.trim();

  try {
    loadingIndicator.show('Saving note...');
    
    // Create note through API
    const newNote = await NotesAPI.createNote(title, body);
    
    // Add to notes array
    notes.unshift(newNote);

    // Reset form
    addNoteForm.reset();
    charsCount.textContent = maxBodyLength;
    bodyRemainingChars.style.color = '';

    // Render notes (ensure we're viewing non-archived)
    if (currentViewMode === 'archived') {
      switchView('all');
    } else {
      renderNotes();
    }

    // Show success notification
    showNotification('Note added successfully!', 'success');

    // Disable save button until form is valid again
    saveButton.disabled = true;
  } catch (error) {
    showNotification('Failed to add note. Please try again.', 'error');
    console.error('Error adding note:', error);
  } finally {
    loadingIndicator.hide();
  }
}

async function handleArchiveNote(event) {
  const noteId = event.detail.noteId;
  const noteIndex = notes.findIndex(note => note.id === noteId);

  if (noteIndex !== -1) {
    const note = notes[noteIndex];
    const isArchived = note.archived;
    
    try {
      loadingIndicator.show(isArchived ? 'Unarchiving note...' : 'Archiving note...');
      
      // Toggle archived state through API
      if (isArchived) {
        await NotesAPI.unarchiveNote(noteId);
      } else {
        await NotesAPI.archiveNote(noteId);
      }
      
      // Refresh notes from API
      await loadNotesFromAPI();
      
      // Show notification
      const action = isArchived ? 'unarchived' : 'archived';
      showNotification(`Note ${action} successfully!`, 'success');
    } catch (error) {
      showNotification(`Failed to ${isArchived ? 'unarchive' : 'archive'} note. Please try again.`, 'error');
      console.error(`Error ${isArchived ? 'unarchiving' : 'archiving'} note:`, error);
    } finally {
      loadingIndicator.hide();
    }
  }
}

function handleDeleteNote(event) {
  currentNoteId = event.detail.noteId;

  // Open confirmation modal
  confirmModal.open();
}

async function confirmDeleteNote() {
  if (!currentNoteId) return;

  try {
    loadingIndicator.show('Deleting note...');
    
    // Find note for notification
    const noteIndex = notes.findIndex(note => note.id === currentNoteId);
    const noteTitle = noteIndex !== -1 ? notes[noteIndex].title : '';
    
    // Delete note through API
    await NotesAPI.deleteNote(currentNoteId);
    
    // Refresh notes from API
    await loadNotesFromAPI();
    
    // Show notification
    showNotification(`"${noteTitle}" has been deleted.`, 'warning');
  } catch (error) {
    showNotification('Failed to delete note. Please try again.', 'error');
    console.error('Error deleting note:', error);
  } finally {
    // Close modal
    confirmModal.close();
    currentNoteId = null;
    loadingIndicator.hide();
  }
}

// Search and Filtering
function handleSearch(event) {
  searchTerm = event.target.value.trim().toLowerCase();
  renderNotes();
}

async function switchView(viewMode) {
  if (currentViewMode === viewMode) return;
  
  currentViewMode = viewMode;

  // Update UI
  if (viewMode === 'all') {
    viewAllButton.classList.add('active');
    viewArchivedButton.classList.remove('active');
  } else {
    viewAllButton.classList.remove('active');
    viewArchivedButton.classList.add('active');
  }

  // Load notes from API based on view mode
  await loadNotesFromAPI();
}

// Rendering
function renderNotes() {
  // Clear notes container
  notesContainer.innerHTML = '';

  // Filter notes based on search
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' ||
      note.title.toLowerCase().includes(searchTerm) ||
      note.body.toLowerCase().includes(searchTerm);

    return matchesSearch;
  });

  if (filteredNotes.length === 0) {
    // Show empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';

    if (searchTerm) {
      emptyState.textContent = `No notes found matching "${searchTerm}"`;
    } else if (currentViewMode === 'archived') {
      emptyState.textContent = 'No archived notes yet. Archive notes to see them here.';
    } else {
      emptyState.textContent = 'No notes yet. Create your first note!';
    }

    notesContainer.appendChild(emptyState);
    return;
  }

  // Render each note using the note-item custom element
  filteredNotes.forEach(note => {
    // Create note-item custom element
    const noteItem = document.createElement('note-item');

    // Set attributes
    noteItem.setAttribute('note-id', note.id);
    noteItem.setAttribute('title', note.title);
    noteItem.setAttribute('date', note.createdAt);
    noteItem.setAttribute('content', note.body);

    if (note.archived) {
      noteItem.setAttribute('archived', '');
    }

    // Add animation class (Optional Criteria 3)
    noteItem.classList.add('note-animate');

    // Add to container
    notesContainer.appendChild(noteItem);
  });
}

// Utility Functions
function showNotification(message, type = 'info') {
  notificationToast.show(message, type);
}

// Add network error handling (Optional Criteria 2)
window.addEventListener('offline', () => {
  showNotification('You are currently offline. Some features may not work properly.', 'warning');
});

window.addEventListener('online', () => {
  showNotification('You are back online!', 'success');
  // Reload notes when connection is restored
  loadNotesFromAPI();
});

// Export for webpack
export default { initializeApp };