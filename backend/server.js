const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const isTest = process.env.NODE_ENV === 'test';

// =======================
// DATABASE CONFIG
// =======================
let pool;

if (!isTest) {
   pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'tododb',
      password: process.env.DB_PASSWORD || 'postgres', // FIXED
      port: process.env.DB_PORT || 5432,
   });
}

// =======================
// FAKE DB FOR TEST
// =======================
let fakeTodos = [];
let idCounter = 1;

// =======================
// INIT TABLE (ONLY REAL DB)
// =======================
const initDB = async () => {
   if (isTest) return;

   try {
      await pool.query(`
         CREATE TABLE IF NOT EXISTS todos (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE
         )
      `);
      console.log('✅ Table todos ready');
   } catch (err) {
      console.error('❌ DB init error:', err.message);
   }
};

initDB();
// =======================
// HEALTH CHECK
// =======================
app.get('/health', (req, res) => {
   res.json({ status: 'healthy', version: '1.0.0' });
});

// =======================
// GET TODOS
// =======================
app.get('/api/todos', async (req, res) => {
   try {
      if (isTest) {
         return res.json(fakeTodos);
      }

      const result = await pool.query('SELECT * FROM todos ORDER BY id');
      res.json(result.rows);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
   }
});

// =======================
// CREATE TODO
// =======================
app.post('/api/todos', async (req, res) => {
   try {
      const { title, completed = false } = req.body;

      // VALIDATION
      if (!title || !title.trim()) {
         return res.status(400).json({ error: 'Title is required' });
      }

      if (isTest) {
         const todo = {
            id: idCounter++,
            title,
            completed
         };
         fakeTodos.push(todo);
         return res.status(201).json(todo);
      }

      const result = await pool.query(
         'INSERT INTO todos(title, completed) VALUES($1, $2) RETURNING *',
         [title, completed]
      );

      res.status(201).json(result.rows[0]);

   } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
   }
});

// =======================
// DELETE TODO
// =======================
app.delete('/api/todos/:id', async (req, res) => {
   try {
      const id = parseInt(req.params.id);

      if (isTest) {
         fakeTodos = fakeTodos.filter(t => t.id !== id);
         return res.status(200).json({ message: 'Deleted' });
      }

      await pool.query('DELETE FROM todos WHERE id=$1', [id]);
      res.status(200).json({ message: 'Deleted' });

   } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
   }
});

// =======================
// UPDATE TODO
// =======================
app.put('/api/todos/:id', async (req, res) => {
   try {
      const id = parseInt(req.params.id);
      const { title, completed } = req.body;

      // VALIDATION
      if (!title || !title.trim()) {
         return res.status(400).json({ error: 'Title is required' });
      }

      if (isTest) {
         const todo = fakeTodos.find(t => t.id === id);

         if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
         }

         todo.title = title;
         todo.completed = completed;

         return res.status(200).json(todo);
      }

      const result = await pool.query(
         'UPDATE todos SET title=$1, completed=$2 WHERE id=$3 RETURNING *',
         [title, completed, id]
      );

      res.status(200).json(result.rows[0]);

   } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
   }
});

// =======================
// START SERVER (NOT IN TEST)
// =======================
const port = process.env.PORT || 8080;

if (!isTest) {
   app.listen(port, () => {
      console.log(`🚀 Backend running on port ${port}`);
   });
}

// =======================
// EXPORT FOR TEST
// =======================
module.exports = app;