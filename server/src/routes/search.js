const MB_BASE = 'https://musicbrainz.org/ws/2';
const MB_HEADERS = {
  'User-Agent': 'JewelBox-Music-Library/1.0 (jewelbox@example.com)',
  'Accept': 'application/json',
};

async function fetchJson(url) {
  const res = await fetch(url, { headers: MB_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function searchByEAN(ean) {
  const data = await fetchJson(
    `${MB_BASE}/release?query=barcode:${encodeURIComponent(ean)}&fmt=json&limit=1`
  );
  if (!data.releases?.length) return null;
  return normalizeMBRelease(data.releases[0]);
}

async function searchByQuery(query) {
  const data = await fetchJson(
    `${MB_BASE}/release?query=${encodeURIComponent(query)}&fmt=json&limit=10&inc=artist-credits+labels+recordings`
  );
  if (!data.releases?.length) return [];
  return data.releases.map(normalizeMBRelease);
}

async function getFullRelease(mbid) {
  const data = await fetchJson(
    `${MB_BASE}/release/${mbid}?inc=artist-credits+labels+recordings+genres&fmt=json`
  );
  return normalizeMBRelease(data);
}

function normalizeMBRelease(r) {
  const artist = r['artist-credit']?.[0]?.artist?.name || '';
  const label = r['label-info']?.[0]?.label?.name || '';
  const year = r.date ? Number(r.date.split('-')[0]) : null;
  const genre = r.genres?.[0]?.name || '';

  const tracks = [];
  (r.media || []).forEach((medium) => {
    (medium.tracks || []).forEach((t) => {
      tracks.push({
        position: t.position,
        title: t.title,
        duration: t.length ? msToMMSS(t.length) : null,
      });
    });
  });

  const total_duration = tracks.length
    ? null
    : r['track-count']
    ? null
    : null;

  const totalMs = (r.media || []).reduce((acc, m) => {
    return acc + (m.tracks || []).reduce((a, t) => a + (t.length || 0), 0);
  }, 0);

  return {
    mbid: r.id,
    title: r.title || '',
    artist_name: artist,
    label_name: label,
    year,
    genre,
    ean: r.barcode || '',
    cover_url: r.id ? `https://coverartarchive.org/release/${r.id}/front-250` : '',
    total_duration: totalMs ? msToMMSS(totalMs) : '',
    tracks,
  };
}

function msToMMSS(ms) {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function searchRoutes(fastify) {
  // GET /api/search?q=<query>   →  search by title/artist
  // GET /api/search?ean=<ean>   →  lookup by barcode
  fastify.get('/search', async (req, reply) => {
    const { q, ean } = req.query;

    if (!q && !ean) {
      return reply.code(400).send({ error: 'Provide q or ean parameter' });
    }

    try {
      if (ean) {
        const result = await searchByEAN(ean);
        if (!result) return reply.code(404).send({ error: 'No release found for this barcode' });
        const full = await getFullRelease(result.mbid);
        return full;
      }

      const results = await searchByQuery(q);
      return results;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(502).send({ error: 'External API error', detail: err.message });
    }
  });

  // GET /api/search/:mbid  →  get full release details
  fastify.get('/search/:mbid', async (req, reply) => {
    try {
      const full = await getFullRelease(req.params.mbid);
      return full;
    } catch (err) {
      fastify.log.error(err);
      return reply.code(502).send({ error: 'External API error', detail: err.message });
    }
  });
}
