import express from 'express';
import cors from 'cors';

const db = require('./db');  

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/portfolio/transactions', async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT symbol, shares, price, type, transaction_date
        FROM portfolio_transactions
        ORDER BY transaction_date DESC
      `);
  
      res.json(rows);
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching transaction history:', error);
          }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  module.exports = app;