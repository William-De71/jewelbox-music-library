import {
  getAlbums, getAlbumById, createAlbum, updateAlbum, deleteAlbum, getGenres,
} from '../db/queries.js';
import { downloadCover } from '../utils/downloadCover.js';

export async function albumRoutes(fastify) {
  // GET /api/albums?page=1&limit=24&genre=Rock&rating=5&sort=title&order=asc&search=
  fastify.get('/albums', async (req, reply) => {
    const { page, limit, genre, rating, sort, order, search } = req.query;
    const result = getAlbums({
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 24,
      genre, rating, sort, order, search,
    });
    return result;
  });

  // GET /api/albums/genres
  fastify.get('/albums/genres', async (req, reply) => {
    return getGenres();
  });

  // GET /api/albums/:id
  fastify.get('/albums/:id', async (req, reply) => {
    const album = getAlbumById(Number(req.params.id));
    if (!album) return reply.code(404).send({ error: 'Album not found' });
    return album;
  });

  // POST /api/albums
  fastify.post('/albums', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'artist_name'],
        properties: {
          title:          { type: 'string', minLength: 1 },
          artist_name:    { type: 'string', minLength: 1 },
          label_name:     { type: 'string' },
          year:           { type: 'integer' },
          genre:          { type: 'string' },
          total_duration: { type: 'string' },
          ean:            { type: 'string' },
          rating:         { type: 'integer', minimum: 1, maximum: 5 },
          cover_url:      { type: 'string' },
          notes:          { type: 'string' },
          tracks: {
            type: 'array',
            items: {
              type: 'object',
              required: ['title'],
              properties: {
                position: { type: 'integer' },
                title:    { type: 'string' },
                duration: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (req, reply) => {
    const albumData = { ...req.body };
    
    // If cover_url is from coverartarchive.org, download it locally
    if (albumData.cover_url && albumData.cover_url.includes('coverartarchive.org')) {
      console.log('[CreateAlbum] Downloading cover from CoverArtArchive...');
      const localCoverUrl = await downloadCover(albumData.cover_url);
      if (localCoverUrl) {
        albumData.cover_url = localCoverUrl;
        console.log('[CreateAlbum] Cover downloaded successfully:', localCoverUrl);
      } else {
        console.log('[CreateAlbum] Cover download failed, keeping original URL');
      }
    }
    
    const album = createAlbum(albumData);
    return reply.code(201).send(album);
  });

  // PATCH /api/albums/:id
  fastify.patch('/albums/:id', async (req, reply) => {
    const album = updateAlbum(Number(req.params.id), req.body);
    if (!album) return reply.code(404).send({ error: 'Album not found' });
    return album;
  });

  // DELETE /api/albums/:id
  fastify.delete('/albums/:id', async (req, reply) => {
    const ok = deleteAlbum(Number(req.params.id));
    if (!ok) return reply.code(404).send({ error: 'Album not found' });
    return reply.code(204).send();
  });

  // PATCH /api/albums/:id/lend
  fastify.patch('/albums/:id/lend', {
    schema: {
      body: {
        type: 'object',
        required: ['is_lent'],
        properties: {
          is_lent: { type: 'boolean' },
          lent_to: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { is_lent, lent_to } = req.body;
    const album = updateAlbum(Number(req.params.id), {
      is_lent: is_lent ? 1 : 0,
      lent_to: is_lent ? (lent_to || null) : null,
    });
    if (!album) return reply.code(404).send({ error: 'Album not found' });
    return album;
  });
}
