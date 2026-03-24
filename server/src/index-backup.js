import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import multipart from '@fastify/multipart';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// import { albumRoutes } from './routes/albums.js';
// import { searchRoutes } from './routes/search.js';
// import { metaRoutes } from './routes/meta.js';
// import { databaseRoutes } from './routes/databases.js';
// import { getDb } from './db/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
});

await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

// Serve uploaded covers
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '../../data/uploads'));
fs.mkdirSync(uploadsDir, { recursive: true });
await fastify.register(staticFiles, {
  root: uploadsDir,
  prefix: '/uploads/',
  decorateReply: true,
});

// Serve built frontend in production
const clientDist = path.resolve(process.env.CLIENT_DIST || path.join(__dirname, '../../client/dist'));
if (fs.existsSync(clientDist)) {
  await fastify.register(staticFiles, {
    root: clientDist,
    prefix: '/',
    decorateReply: false,
  });
}

// Mock database routes
fastify.get('/api/databases', async (req, reply) => {
  return { databases: [], active: null };
});

fastify.post('/api/databases', async (req, reply) => {
  const { name, description } = req.body;
  return reply.code(201).send({
    id: Date.now(),
    name: name,
    description: description || '',
    message: 'Database created successfully (mock)'
  });
});

// Cover upload endpoint
fastify.post('/api/upload/cover', async (req, reply) => {
  const data = await req.file();
  if (!data) return reply.code(400).send({ error: 'No file provided' });

  const { randomUUID } = await import('crypto');
  const ext = (data.filename.split('.').pop() || 'jpg').toLowerCase();
  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(filepath);
    data.file.pipe(ws);
    ws.on('finish', resolve);
    ws.on('error', reject);
  });

  return { url: `/uploads/${filename}` };
});

// Health check
fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// SPA fallback
fastify.setNotFoundHandler((req, reply) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    try {
      return reply.sendFile('index.html', clientDist);
    } catch {}
  }
  reply.code(404).send({ error: 'Not found' });
});

// Init DB on startup
getDb();

const PORT = 3001;
const HOST = process.env.HOST || '0.0.0.0';

try {
  await fastify.listen({ port: PORT, host: HOST });
  fastify.log.info(`JewelBox server running on http://${HOST}:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
