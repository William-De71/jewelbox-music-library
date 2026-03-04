import { useState, useCallback } from 'preact/hooks';
import { api } from '../api/client.js';

export function useLibrary() {
  const [albums, setAlbums] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlbums = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAlbums(params);
      setAlbums(result.data);
      setTotal(result.total);
      return result;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { albums, total, loading, error, fetchAlbums };
}
