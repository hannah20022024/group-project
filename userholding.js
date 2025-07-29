import express from 'express';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import yahooFinance from 'yahoo-finance2';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let db;

// 🚀 初始化连接并启动服务器
const main = async () => {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'n3u3da!',
      database: 'currency_db'
    });

    console.log('✅ Connected to MySQL');

    // 🛒 购买股票 API
    app.post('/api/portfolio/buy', async (req, res) => {
      const { symbol, shares } = req.body;

      // 简单验证
      if (!symbol || !shares || shares <= 0) {
        return res.status(400).json({ error: 'Please provide valid symbol and shares > 0' });
      }

      try {
        // 查询当前价格
        const quote = await yahooFinance.quote(symbol);
        const price = quote?.regularMarketPrice;

        if (!price) {
          return res.status(500).json({ error: 'Failed to retrieve stock price' });
        }

        const date = new Date().toISOString().split('T')[0];

        // 插入记录
        const insertSQL = `
          INSERT INTO userhave (symbol, shares, buy_price, buy_date)
          VALUES (?, ?, ?, ?)
        `;
        const params = [symbol, shares, price, date];

        await db.execute(insertSQL, params);

        res.json({
          message: '✅ Purchase completed',
          symbol,
          shares,
          buy_price: price,
          buy_date: date
        });

      } catch (err) {
        console.error('❌ Internal Error:', err);
        res.status(500).json({ error: 'Failed to buy stock', detail: err.message });
      }
    });

    // 启动服务监听
    app.listen(PORT, () => {
      console.log(`✅ Server running: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
  }
};

main();

