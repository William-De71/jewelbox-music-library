// Simple in-memory cache for MusicBrainz search results
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCacheKey(query, type = 'search') {
  return `${type}:${query.toLowerCase().trim()}`;
}

export function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  
  // Check if cache entry is still valid
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  console.log(`[Cache] Hit for ${key}`);
  return entry.data;
}

export function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`[Cache] Set ${key}`);
}

export function clearCache() {
  cache.clear();
  console.log('[Cache] Cleared');
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, CACHE_TTL);
