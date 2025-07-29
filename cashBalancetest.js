import express from 'express';
import cors from 'cors';

const db = require('./db');  

const app = express();
app.use(cors());
app.use(express.json());

  app.get('/api/cashbalance', async (req, res) => {
    try {
   
      const [rows] = await db.execute('SELECT amount FROM cash_balance WHERE id = 1');
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Cash balance not found' });
      }
  
      res.json({ cashBalance: rows[0].amount });
    } catch (err) {
      console.error('Error fetching cash balance:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = app;
