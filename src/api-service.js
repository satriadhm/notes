// API Service for Notes App
// This file handles all communication with the Notes API

const BASE_URL = 'https://notes-api.dicoding.dev/v2';

class NotesAPI {
  static async getAllNotes() {
    try {
      const response = await fetch(`${BASE_URL}/notes`);
      const responseJson = await response.json();
      
      if (responseJson.status !== 'success') {
        return [];
      }
      
      return responseJson.data;
    } catch (error) {
      console.error('Error getting notes:', error);
      // Utilize Browser API for error feedback (Optional Criteria 2)
      alert(`Failed to get notes: ${error.message}`);
      return [];
    }
  }

  static async getArchivedNotes() {
    try {
      const response = await fetch(`${BASE_URL}/notes/archived`);
      const responseJson = await response.json();
      
      if (responseJson.status !== 'success') {
        return [];
      }
      
      return responseJson.data;
    } catch (error) {
      console.error('Error getting archived notes:', error);
      // Utilize Browser API for error feedback
      alert(`Failed to get archived notes: ${error.message}`);
      return [];
    }
  }

  static async getNoteById(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}`);
      const responseJson = await response.json();
      
      if (responseJson.status !== 'success') {
        return null;
      }
      
      return responseJson.data;
    } catch (error) {
      console.error(`Error getting note with id ${id}:`, error);
      alert(`Failed to get note details: ${error.message}`);
      return null;
    }
  }

  static async createNote(title, body) {
    try {
      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, body })
      });
      
      const responseJson = await response.json();
      
      if (responseJson.status !== 'success') {
        throw new Error(responseJson.message);
      }
      
      return responseJson.data;
    } catch (error) {
      console.error('Error creating note:', error);
      alert(`Failed to create note: ${error.message}`);
      throw error;
    }
  }

  static async archiveNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}/archive`, {
        method: 'POST'
      });
      
      const responseJson = await response.json();
      
      if (responseJson.status !== 'success') {
        throw new Error(responseJson.message);
      }
      
      return true;
    } catch (error) {
      console.error(`Error archiving note with id ${id}:`, error);
      alert(`Failed to archive note: ${error.message}`);
      throw error;
    }
  }

  static async unarchiveNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}/unarchive`, {
        method: 'POST'
      });
      
      const responseJson = await response.json();
      
      if (responseJson.status !== 'success') {
        throw new Error(responseJson.message);
      }
      
      return true;
    } catch (error) {
      console.error(`Error unarchiving note with id ${id}:`, error);
      alert(`Failed to unarchive note: ${error.message}`);
      throw error;
    }
  }

  static async deleteNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}`, {
        method: 'DELETE'
      });
      
      const responseJson = await response.json();
      
      if (responseJson.status !== 'success') {
        throw new Error(responseJson.message);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting note with id ${id}:`, error);
      alert(`Failed to delete note: ${error.message}`);
      throw error;
    }
  }
}

export default NotesAPI;