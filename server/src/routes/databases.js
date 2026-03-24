import { initializeManagerDatabase, getAllDatabases, getActiveDatabase, createDatabase, setActiveDatabase, deleteDatabase, updateDatabase } from '../db/manager.js';

// Initialize manager database on first request
let isInitialized = false;
const ensureInitialized = () => {
  if (!isInitialized) {
    try {
      initializeManagerDatabase();
      isInitialized = true;
      console.log('[DatabaseRoutes] Manager database initialized');
    } catch (error) {
      console.error('[DatabaseRoutes] Failed to initialize manager database:', error);
      throw error;
    }
  }
};

export function databaseRoutes(fastify, opts, done) {
  // Get all databases
  fastify.get('/api/databases', async (req, reply) => {
    try {
      ensureInitialized();
      const databases = getAllDatabases();
      const activeDb = getActiveDatabase();
      
      return {
        databases,
        active: activeDb
      };
    } catch (err) {
      console.error('[DB] Error fetching databases:', err);
      return reply.code(500).send({ error: 'Failed to fetch databases' });
    }
  });

  // Create new database
  fastify.post('/api/databases', async (req, reply) => {
    try {
      ensureInitialized();
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return reply.code(400).send({ error: 'Database name is required' });
      }

      const result = createDatabase(name.trim(), description || '');
      
      return reply.code(201).send({
        id: result.lastInsertRowid,
        name: name.trim(),
        description: description || '',
        message: 'Database created successfully'
      });
    } catch (err) {
      console.error('[DB] Error creating database:', err);
      
      if (err.message.includes('UNIQUE constraint failed')) {
        return reply.code(409).send({ error: 'Database name already exists' });
      }
      
      return reply.code(500).send({ error: 'Failed to create database' });
    }
  });

  // Update database
  fastify.patch('/api/databases/:id', async (req, reply) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      if (!name || name.trim() === '') {
        return reply.code(400).send({ error: 'Database name is required' });
      }

      const result = updateDatabase(parseInt(id), name.trim(), description || '');
      
      if (result.changes === 0) {
        return reply.code(404).send({ error: 'Database not found' });
      }

      return {
        message: 'Database updated successfully'
      };
    } catch (err) {
      console.error('[DB] Error updating database:', err);
      
      if (err.message.includes('UNIQUE constraint failed')) {
        return reply.code(409).send({ error: 'Database name already exists' });
      }
      
      return reply.code(500).send({ error: 'Failed to update database' });
    }
  });

  // Set active database
  fastify.post('/api/databases/:id/activate', async (req, reply) => {
    try {
      const { id } = req.params;
      
      const result = setActiveDatabase(parseInt(id));
      
      if (result.changes === 0) {
        return reply.code(404).send({ error: 'Database not found' });
      }

      return {
        message: 'Database activated successfully'
      };
    } catch (err) {
      console.error('[DB] Error activating database:', err);
      return reply.code(500).send({ error: 'Failed to activate database' });
    }
  });

  // Delete database
  fastify.delete('/api/databases/:id', async (req, reply) => {
    try {
      const { id } = req.params;
      
      const result = deleteDatabase(parseInt(id));
      
      if (!result) {
        return reply.code(404).send({ error: 'Database not found' });
      }

      return {
        message: 'Database deleted successfully'
      };
    } catch (err) {
      console.error('[DB] Error deleting database:', err);
      return reply.code(500).send({ error: 'Failed to delete database' });
    }
  });

  done();
}
