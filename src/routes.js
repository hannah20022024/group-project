const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const {
  getWatchlist,
  getPortfolio,
  getPortfolioCount,
  addPortfolioItem,
  deletePortfolioItem,
  getStockDetails,
  getPortfolioItem,
  getInvestmentAmount
} = require('./db');

const router = express.Router();

// GET /watchlist
router.get('/watchlist', async (req, res) => {
  try {
    const rows = await getWatchlist();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /portfolio
router.get('/portfolio', async (req, res) => {
  try {
    const rows = await getPortfolio();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /portfolio
router.post('/portfolio', async (req, res) => {
  const { symbol, volume } = req.body;
  if (!symbol || !Number.isInteger(volume) || volume <= 0) {
    return res.status(400).json({ error: 'Invalid symbol or volume' });
  }

  try {
    const stock = await getStockDetails(symbol);
    if (!stock) return res.status(400).json({ error: 'Stock not in watchlist' });

    const existingItem = await getPortfolioItem(symbol);
    if (existingItem) return res.status(400).json({ error: 'Stock already in portfolio' });

    const currentPrice = stock.current_price; // Use cached price from stock_pool
    const transactionDate = new Date().toISOString().split('T')[0];
    const id = await addPortfolioItem(symbol, volume, currentPrice, transactionDate);
    res.status(201).json({ message: 'Item added', id });
  } catch (err) {
    console.error('Error adding portfolio item:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// DELETE /portfolio/:id
router.delete('/portfolio/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const rows = await getPortfolio();
    const item = rows.find(item => item.id === id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const stock = await getStockDetails(item.symbol);
    const currentPrice = stock.current_price;
    const transactionDate = new Date().toISOString().split('T')[0];

    await deletePortfolioItem(id, item.volume, currentPrice, transactionDate);
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('DELETE /portfolio/:id error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /portfolio/:symbol/details
router.get('/portfolio/:symbol/details', async (req, res) => {
  const symbol = req.params.symbol;
  const startDate = req.query.start_date || '2023-01-01';
  const endDate = req.query.end_date || new Date().toISOString().split('T')[0];

  try {
    // 1. 检查股票是否在 watchlist
    const stock = await getStockDetails(symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found in watchlist' });
    }

    // 2. 检查股票是否在 portfolio
    const portfolioItem = await getPortfolioItem(symbol);
    if (!portfolioItem) {
      return res.status(404).json({ error: 'Stock not in portfolio' });
    }

    // 3. 计算总投资金额
    const investmentAmount = await getInvestmentAmount(portfolioItem.id);
    if (isNaN(investmentAmount)) {
      throw new Error('Invalid investment amount calculation');
    }

    // 4. 尝试从 Yahoo Finance 获取数据
    let currentPrice = stock.current_price;
    let historicalPrices = [];

    try {
      const quote = await yahooFinance.quote(symbol);
      currentPrice = quote.regularMarketPrice;

      const hist = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      });

      historicalPrices = hist.map(row => ({
        date: row.date.toISOString().split('T')[0], // 修正: toISOString()
        price: parseFloat(row.close.toFixed(2))     // 修正: toFixed()
      }));
    } catch (yahooError) {
      console.warn('Yahoo Finance API failed, using cached price:', yahooError.message);
    }

    // 5. 返回数据
    res.json({
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      investmentAmount: parseFloat(investmentAmount.toFixed(2)),
      historicalPrices
    });
  } catch (err) {
    console.error('GET /portfolio/:symbol/details error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;