const API_BASE = '/api';

export const albumsApi = {
  // Get all albums from active database
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE}/albums?${queryString}` : `${API_BASE}/albums`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch albums');
    }
    return response.json();
  },

  // Get genres from active database
  async getGenres() {
    const response = await fetch(`${API_BASE}/albums/genres`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch genres');
    }
    return response.json();
  },

  // Update an album (partial update)
  async update(id, data) {
    const response = await fetch(`${API_BASE}/albums/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update album');
    }
    return response.json();
  },

  // Get active database info
  async getActiveDatabase() {
    const response = await fetch(`${API_BASE}/database/active`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch active database');
    }
    return response.json();
  }
};
