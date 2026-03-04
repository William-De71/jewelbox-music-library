import { getAllArtists, getAllLabels } from '../db/queries.js';

export async function metaRoutes(fastify) {
  fastify.get('/artists', async () => getAllArtists());
  fastify.get('/labels', async () => getAllLabels());
}
