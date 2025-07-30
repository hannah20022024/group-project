import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

let db; // 定义全局 db
let watchlist = []; // 初始化空的 watchlist

// 🔹 封装获取最新的 watchlist（从数据库拉取）
const loadWatchlist = async () => {
  const [rows] = await db.execute("SELECT symbol FROM stock_pool");
  watchlist = rows.map(row => row.symbol.toUpperCase());
};

const startServer = async () => {
  try {
    // 建立数据库连接
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',        // 替换为你的用户名
      password: 'n3u3da!', // 替换为你的密码
      database: 'currency_db'
    });

    console.log('✅ 已连接数据库');

    // 加载初始 watchlist
    await loadWatchlist();

    // 🟢 启动服务器
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ 无法启动服务器:', err);
  }
};

// 🔹 获取 watchlist 中所有股票的当前行情
app.get('/api/watchlist', async (req, res) => {
  try {
    await loadWatchlist(); // 每次请求都刷新 watchlist
    const results = await Promise.all(
      watchlist.map(async (symbol) => {
        const quote = await yahooFinance.quote(symbol);
        return {
          symbol: quote.symbol,
          name: quote.shortName,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          percentChange: quote.regularMarketChangePercent,
          marketTime: quote.regularMarketTime,
          currency: quote.currency
        };
      })
    );
    res.json(results);
  } catch (err) {
    console.error('Yahoo API Error (watchlist):', err);
    res.status(500).json({ error: 'Yahoo API Error' });
  }
});

// 🔹 添加 symbol 到 watchlist
app.post('/api/watchlist', async (req, res) => {
  const { symbol } = req.body;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: '缺少或无效的 symbol' });
  }

  try {
    await db.execute('INSERT INTO stock_pool (symbol) VALUES (?)', [symbol.toUpperCase()]);
    await loadWatchlist();
    res.json({ message: '添加成功', symbol: symbol.toUpperCase() });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: '该股票已在 watchlist 中' });
    } else {
      console.error('❌ 插入失败:', err);
      res.status(500).json({ error: '添加失败' });
    }
  }
});

// 🔹 删除 symbol
app.delete('/api/watchlist/:symbol', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();

  if (!symbol) {
    return res.status(400).json({ error: '无效的 symbol 参数' });
  }

  try {
    const [result] = await db.execute('DELETE FROM stock_pool WHERE symbol = ?', [symbol]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '未找到该 symbol' });
    }

    await loadWatchlist();
    res.json({ message: '删除成功', symbol });
  } catch (err) {
    console.error('❌ 删除失败:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 启动服务器
startServer();