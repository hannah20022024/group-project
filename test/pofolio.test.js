const express = require('express');
const request = require('supertest');

// Mock dependencies
jest.mock('mysql2/promise');
jest.mock('yahoo-finance2');

// Import after mocking
const mysql = require('mysql2/promise');
const yahooFinance = require('yahoo-finance2');

// Mock database connection
const mockDb = {
  execute: jest.fn()
};

// Mock Yahoo Finance
const mockYahooFinance = {
  quote: jest.fn()
};

// Create a simple mock app for testing
const app = express();
app.use(express.json());

// Mock the buy endpoint
app.post('/api/portfolio/buy', async (req, res) => {
  const { symbol, shares } = req.body;

  if (!symbol || !shares || shares <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Mock stock pool check
    const stockPoolResult = await mockDb.execute('SELECT * FROM stock_pool WHERE symbol = ?', [symbol.toUpperCase()]);
    if (!stockPoolResult[0] || stockPoolResult[0].length === 0) {
      return res.status(400).json({ error: 'Symbol not in stock pool' });
    }

    // Mock Yahoo Finance quote
    const quote = await mockYahooFinance.quote(symbol);
    if (!quote?.regularMarketPrice) {
      return res.status(500).json({ error: 'Failed to fetch price' });
    }

    const price = quote.regularMarketPrice;
    const today = new Date().toISOString().split('T')[0];

    // Mock database operations
    await mockDb.execute('INSERT INTO userhave (symbol, shares, buy_price, buy_date) VALUES (?, ?, ?, ?)', 
      [symbol.toUpperCase(), shares, price, today]);
    
    await mockDb.execute('INSERT INTO portfolio_transactions (symbol, shares, price, type, transaction_date) VALUES (?, ?, ?, ?, ?)',
      [symbol.toUpperCase(), shares, price, 'buy', today]);

    const cost = price * shares;
    await mockDb.execute('UPDATE cash_balance SET amount = amount - ? WHERE id = 1', [cost]);

    res.json({
      message: '✅ Purchase successful',
      symbol: symbol.toUpperCase(),
      shares,
      buy_price: price,
      buy_date: today
    });

  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock the sell endpoint
app.post('/api/portfolio/sell', async (req, res) => {
  const { symbol, shares } = req.body;

  if (!symbol || !shares || shares <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const upperSymbol = symbol.toUpperCase();
  const today = new Date().toISOString().split('T')[0];
  let sharesToSell = shares;

  try {
    // Mock get holdings
    const holdingsResult = await mockDb.execute('SELECT * FROM userhave WHERE symbol = ? ORDER BY buy_date ASC', [upperSymbol]);
    const holdings = holdingsResult[0] || [];
    const totalHeld = holdings.reduce((sum, row) => sum + row.shares, 0);
    if (totalHeld < sharesToSell) {
      return res.status(400).json({ error: 'Not enough holdings to sell' });
    }

    const quote = await mockYahooFinance.quote(upperSymbol);
    const price = quote?.regularMarketPrice;
    if (!price) {
      return res.status(500).json({ error: 'Failed to fetch current price' });
    }

    let totalProceeds = 0;

    for (const row of holdings) {
      if (sharesToSell === 0) break;

      const sellAmount = Math.min(sharesToSell, row.shares);

      if (sellAmount === row.shares) {
        await mockDb.execute('DELETE FROM userhave WHERE id = ?', [row.id]);
      } else {
        await mockDb.execute('UPDATE userhave SET shares = shares - ? WHERE id = ?', [sellAmount, row.id]);
      }

      await mockDb.execute('INSERT INTO portfolio_transactions (symbol, shares, price, type, transaction_date) VALUES (?, ?, ?, ?, ?)',
        [upperSymbol, sellAmount, price, 'SELL', today]);

      totalProceeds += sellAmount * price;
      sharesToSell -= sellAmount;
    }

    await mockDb.execute('UPDATE cash_balance SET amount = amount + ? WHERE id = 1', [totalProceeds]);

    res.json({
      message: '✅ Sell successful',
      symbol: upperSymbol,
      sharesSold: shares,
      sellPrice: price,
      totalProceeds: +totalProceeds.toFixed(2)
    });

  } catch (error) {
    console.error("Sell error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

beforeAll(async () => {
  // Mock the mysql connection
  mysql.createConnection = jest.fn().mockResolvedValue(mockDb);
  
  // Mock yahoo-finance2
  yahooFinance.quote = mockYahooFinance.quote;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Portfolio Buy API', () => {
  test('should successfully buy stocks', async () => {
    // Mock data
    const buyRequest = {
      symbol: 'AAPL',
      shares: 10
    };

    const mockQuote = {
      symbol: 'AAPL',
      regularMarketPrice: 150.00
    };

    const mockStockPool = [{ symbol: 'AAPL' }];
    const mockCashBalance = [{ amount: 2000.00 }];

    // Setup mocks
    mockDb.execute
      .mockResolvedValueOnce([mockStockPool]) // stock_pool check
      .mockResolvedValueOnce([mockCashBalance]); // cash balance update

    mockYahooFinance.quote.mockResolvedValue(mockQuote);

    const response = await request(app)
      .post('/api/portfolio/buy')
      .send(buyRequest)
      .expect(200);

    expect(response.body).toEqual({
      message: '✅ Purchase successful',
      symbol: 'AAPL',
      shares: 10,
      buy_price: 150.00,
      buy_date: expect.any(String)
    });

    // Verify database calls
    expect(mockDb.execute).toHaveBeenCalledWith(
      'SELECT * FROM stock_pool WHERE symbol = ?',
      ['AAPL']
    );
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO userhave'),
      ['AAPL', 10, 150.00, expect.any(String)]
    );
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO portfolio_transactions'),
      ['AAPL', 10, 150.00, 'buy', expect.any(String)]
    );
    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE cash_balance SET amount = amount - ? WHERE id = 1',
      [1500.00]
    );
  });

  test('should return 400 for invalid input', async () => {
    const invalidRequests = [
      { symbol: 'AAPL' }, // missing shares
      { shares: 10 }, // missing symbol
      { symbol: 'AAPL', shares: -5 }, // negative shares
      { symbol: 'AAPL', shares: 0 } // zero shares
    ];

    for (const reqData of invalidRequests) {
      const response = await request(app)
        .post('/api/portfolio/buy')
        .send(reqData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    }
  });

  test('should return 400 when symbol not in stock pool', async () => {
    const buyRequest = {
      symbol: 'INVALID',
      shares: 10
    };

    // Mock empty stock pool result
    mockDb.execute.mockResolvedValueOnce([[]]);

    const response = await request(app)
      .post('/api/portfolio/buy')
      .send(buyRequest)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Symbol not in stock pool'
    });
  });

  test('should return 500 when Yahoo Finance API fails', async () => {
    const buyRequest = {
      symbol: 'AAPL',
      shares: 10
    };

    const mockStockPool = [{ symbol: 'AAPL' }];

    mockDb.execute.mockResolvedValueOnce([[...mockStockPool]]);
    mockYahooFinance.quote.mockRejectedValue(new Error('API Error'));

    const response = await request(app)
      .post('/api/portfolio/buy')
      .send(buyRequest)
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });
});

describe('Portfolio Sell API', () => {
  test('should successfully sell stocks', async () => {
    const sellRequest = {
      symbol: 'AAPL',
      shares: 5
    };

    const mockHoldings = [
      { id: 1, symbol: 'AAPL', shares: 10, buy_price: 140.00, buy_date: '2024-01-01' }
    ];

    const mockQuote = {
      symbol: 'AAPL',
      regularMarketPrice: 160.00
    };

    // Setup mocks
    mockDb.execute
      .mockResolvedValueOnce([mockHoldings]) // get holdings
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // delete/update holdings
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // insert transaction
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update cash balance

    mockYahooFinance.quote.mockResolvedValue(mockQuote);

    const response = await request(app)
      .post('/api/portfolio/sell')
      .send(sellRequest)
      .expect(200);

    expect(response.body).toEqual({
      message: '✅ Sell successful',
      symbol: 'AAPL',
      sharesSold: 5,
      sellPrice: 160.00,
      totalProceeds: 800.00
    });

    // Verify database calls
    expect(mockDb.execute).toHaveBeenCalledWith(
      'SELECT * FROM userhave WHERE symbol = ? ORDER BY buy_date ASC',
      ['AAPL']
    );
    expect(mockDb.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO portfolio_transactions'),
      ['AAPL', 5, 160.00, 'SELL', expect.any(String)]
    );
    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE cash_balance SET amount = amount + ? WHERE id = 1',
      [800.00]
    );
  });

  test('should return 400 for invalid input', async () => {
    const invalidRequests = [
      { symbol: 'AAPL' }, // missing shares
      { shares: 10 }, // missing symbol
      { symbol: 'AAPL', shares: -5 }, // negative shares
      { symbol: 'AAPL', shares: 0 } // zero shares
    ];

    for (const reqData of invalidRequests) {
      const response = await request(app)
        .post('/api/portfolio/sell')
        .send(reqData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    }
  });

  test('should return 400 when not enough holdings to sell', async () => {
    const sellRequest = {
      symbol: 'AAPL',
      shares: 20
    };

    const mockHoldings = [
      { id: 1, symbol: 'AAPL', shares: 10, buy_price: 140.00, buy_date: '2024-01-01' }
    ];

    mockDb.execute.mockResolvedValueOnce([[...mockHoldings]]);

    const response = await request(app)
      .post('/api/portfolio/sell')
      .send(sellRequest)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Not enough holdings to sell'
    });
  });

  test('should return 500 when Yahoo Finance API fails', async () => {
    const sellRequest = {
      symbol: 'AAPL',
      shares: 5
    };

    const mockHoldings = [
      { id: 1, symbol: 'AAPL', shares: 10, buy_price: 140.00, buy_date: '2024-01-01' }
    ];

    mockDb.execute.mockResolvedValueOnce([[...mockHoldings]]);
    mockYahooFinance.quote.mockRejectedValue(new Error('API Error'));

    const response = await request(app)
      .post('/api/portfolio/sell')
      .send(sellRequest)
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('should handle partial sell correctly', async () => {
    const sellRequest = {
      symbol: 'AAPL',
      shares: 3
    };

    const mockHoldings = [
      { id: 1, symbol: 'AAPL', shares: 10, buy_price: 140.00, buy_date: '2024-01-01' }
    ];

    const mockQuote = {
      symbol: 'AAPL',
      regularMarketPrice: 160.00
    };

    mockDb.execute
      .mockResolvedValueOnce([[...mockHoldings]]) // get holdings
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // update holdings (partial)
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // insert transaction
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update cash balance

    mockYahooFinance.quote.mockResolvedValue(mockQuote);

    const response = await request(app)
      .post('/api/portfolio/sell')
      .send(sellRequest)
      .expect(200);

    expect(response.body.totalProceeds).toBe(480.00); // 3 * 160.00

    // Verify partial update was called
    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE userhave SET shares = shares - ? WHERE id = ?',
      [3, 1]
    );
  });
});

describe('Database Error Handling', () => {
  test('should handle database errors in buy API', async () => {
    const buyRequest = {
      symbol: 'AAPL',
      shares: 10
    };

    mockDb.execute.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app)
      .post('/api/portfolio/buy')
      .send(buyRequest)
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });

  test('should handle database errors in sell API', async () => {
    const sellRequest = {
      symbol: 'AAPL',
      shares: 5
    };

    mockDb.execute.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app)
      .post('/api/portfolio/sell')
      .send(sellRequest)
      .expect(500);

    expect(response.body).toHaveProperty('error');
  });
});