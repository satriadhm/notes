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
      throw error;
    }
  }
}

export default NotesAPI;