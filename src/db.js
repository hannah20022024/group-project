const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: '1234', 
  database: 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initDb = async () => {
  try {
    // Tables are created via schema.sql
    // Verify stock_pool has 6 stocks
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM stock_pool');
    if (rows[0].count === 0) {
      const stocks = [
        ['AAPL', 'Apple Inc.', 'Technology', 'US - Consumer electronics, NASDAQ', 192.34, '2025-07-26'],
        ['BIDU', 'Baidu Inc.', 'Technology', 'China - Search and AI, NASDAQ ADR', 115.20, '2025-07-26'],
        ['JNJ', 'Johnson & Johnson', 'Healthcare', 'US - Pharmaceuticals & medical devices, NYSE', 158.45, '2025-07-26'],
        ['BYD', 'BYD Electronic', 'Healthcare', 'China - Medical electronics, HKEX', 28.10, '2025-07-26'],
        ['PLD', 'Prologis Inc.', 'Real Estate', 'US - Industrial REIT, NYSE', 121.60, '2025-07-26'],
        ['1109.HK', 'China Resources Land', 'Real Estate', 'China - Residential/commercial RE, HKEX', 32.70, '2025-07-26']
      ];
      await pool.query('INSERT INTO stock_pool (symbol, name, sector, description, current_price, last_updated) VALUES ?', [stocks]);
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

const getWatchlist = async () => {
  const [rows] = await pool.query('SELECT id, symbol, name, sector, description, current_price, last_updated FROM stock_pool');
  return rows;
};

const getPortfolio = async () => {
  const [rows] = await pool.query('SELECT id, symbol, volume FROM portfolio');
  return rows;
};

const getPortfolioCount = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM portfolio');
  return rows[0].count;
};

const addPortfolioItem = async (symbol, volume, price, transactionDate) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query('INSERT INTO portfolio (symbol, volume) VALUES (?, ?)', [symbol, volume]);
    const portfolioId = result.insertId;
    await connection.query(
      'INSERT INTO portfolio_transactions (portfolio_id, transaction_type, volume, price, transaction_date) VALUES (?, ?, ?, ?, ?)',
      [portfolioId, 'BUY', volume, price, transactionDate]
    );
    await connection.commit();
    return portfolioId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const deletePortfolioItem = async (id, volume, price, transactionDate) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // 1. 先删除关联的交易记录
    await connection.query('DELETE FROM portfolio_transactions WHERE portfolio_id = ?', [id]);
    
    // 2. 再删除投资项
    await connection.query('DELETE FROM portfolio WHERE id = ?', [id]);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const getStockDetails = async (symbol) => {
  const [rows] = await pool.query('SELECT symbol, name, current_price FROM stock_pool WHERE symbol = ?', [symbol]);
  return rows[0];
};

const getPortfolioItem = async (symbol) => {
  const [rows] = await pool.query('SELECT id, symbol, volume FROM portfolio WHERE symbol = ?', [symbol]);
  return rows[0];
};

const getInvestmentAmount = async (portfolioId) => {
  try {
    const [rows] = await pool.query(
      'SELECT transaction_type, volume, price FROM portfolio_transactions WHERE portfolio_id = ?',
      [portfolioId]
    );

    if (!rows || rows.length === 0) {
      return 0; // 如果没有交易记录，返回0
    }

    let totalAmount = 0;
    rows.forEach(row => {
      const amount = row.volume * row.price;
      if (row.transaction_type === 'BUY') {
        totalAmount += amount;
      } else if (row.transaction_type === 'SELL') {
        totalAmount -= amount;
      }
    });

    return totalAmount;
  } catch (err) {
    console.error('getInvestmentAmount error:', err);
    throw err;
  }
};

module.exports = {
  initDb,
  getWatchlist,
  getPortfolio,
  getPortfolioCount,
  addPortfolioItem,
  deletePortfolioItem,
  getStockDetails,
  getPortfolioItem,
  getInvestmentAmount
};