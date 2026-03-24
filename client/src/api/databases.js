const API_BASE = '/api/databases';

export const databasesApi = {
  // Get all databases with active one
  async getAll() {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch databases');
    return response.json();
  },

  // Create new database
  async create(name, description = '') {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create database');
    }
    return response.json();
  },

  // Update database
  async update(id, name, description) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update database');
    }
    return response.json();
  },

  // Set active database
  async setActive(id) {
    const response = await fetch(`${API_BASE}/${id}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to activate database');
    }
    return response.json();
  },

  // Delete database
  async delete(id) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete database');
    }
    return response.json();
  }
};
