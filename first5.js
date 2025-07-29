import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';
import mysql from 'mysql2/promise';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3010;
const swaggerDocument = yaml.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let db; 
let watchlist = []; 


const loadWatchlist = async () => {
  const [rows] = await db.execute("SELECT symbol FROM stock_pool");
  watchlist = rows.map(row => row.symbol.toUpperCase());
};

const startServer = async () => {
  try {

    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',        
      password: 'n3u3da!', 
      database: 'currency_db'
    });

    console.log('Connect to DB sucessfully!!!');

   
    await loadWatchlist();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Cannot start server:', err);
  }
};


app.get('/api/watchlist', async (req, res) => {
  try {
    await loadWatchlist(); 
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


app.post('/api/watchlist', async (req, res) => {
  const { symbol } = req.body;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Missing symbol or lack of symbol..' });
  }

  try {
    await db.execute('INSERT INTO stock_pool (symbol) VALUES (?)', [symbol.toUpperCase()]);
    await loadWatchlist();
    res.json({ message: 'Add successfully', symbol: symbol.toUpperCase() });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Already in this watchlist' });
    } else {
      console.error('Cannot insert:', err);
      res.status(500).json({ error: 'Fail to add the watchlist' });
    }
  }
});

//
app.get('/api/strategy/:symbol', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'Symbol 参数缺失' });

  try {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 40);

    const history = await yahooFinance.historical(symbol, {
      period1: past,
      period2: today,
      interval: '1d'
    });

    const closes = history.map(d => d.close);
    const dates = history.map(d => d.date.toISOString().split('T')[0]);

    const sma = (data, days) => {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        if (i < days - 1) {
          result.push(null);
        } else {
          const slice = data.slice(i - days + 1, i + 1);
          const avg = slice.reduce((a, b) => a + b, 0) / days;
          result.push(+avg.toFixed(2));
        }
      }
      return result;
    };

    const sma7 = sma(closes, 7);
    const sma14 = sma(closes, 14);
    const currentPrice = closes.at(-1)?.toFixed(2);

    let suggestion = "Hold";
    if (currentPrice > sma7.at(-1) && sma7.at(-1) > sma14.at(-1)) suggestion = "Strong Buy";
    else if (currentPrice > sma7.at(-1)) suggestion = "Buy";
    else if (currentPrice < sma7.at(-1) && sma7.at(-1) < sma14.at(-1)) suggestion = "Strong Sell";
    else if (currentPrice < sma7.at(-1)) suggestion = "Sell";

    res.json({
      symbol,
      currentPrice,
      suggestion,
      dates,
      closes,
      sma7,
      sma14
    });
  } catch (err) {
    console.error("Strategy cannnot analyse:", err);
    res.status(500).json({ error: 'cannot get strategy data' });
  }
});



app.get('/api/simulate-dca/:symbol', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  try {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 90);

    const result = await yahooFinance.historical(symbol, {
      period1: past.toISOString(),
      period2: today.toISOString(),
      interval: '1d'
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No historical data found" });
    }

    const closes = result.map(d => d.close);
    const dates = result.map(d => d.date.toISOString().split('T')[0]);

    // === DCA Simulation ===
    const investmentPerBuy = 100; // $100 each time
    const frequencyDays = 7;

    let totalInvested = 0;
    let totalShares = 0;

    for (let i = 0; i < closes.length; i += frequencyDays) {
      const price = closes[i];
      if (!price) continue;

      const shares = investmentPerBuy / price;
      totalInvested += investmentPerBuy;
      totalShares += shares;
    }

    const latestPrice = closes[closes.length - 1];
    const currentValue = totalShares * latestPrice;
    const averageCost = totalInvested / totalShares;

    res.json({
      symbol,
      currentPrice: latestPrice,
      dca: {
        totalInvested: +totalInvested.toFixed(2),
        totalShares: +totalShares.toFixed(4),
        averageCostPerShare: +averageCost.toFixed(2),
        currentValue: +currentValue.toFixed(2),
        gainLoss: +(currentValue - totalInvested).toFixed(2),
        gainLossPercent: +(((currentValue - totalInvested) / totalInvested) * 100).toFixed(2),
        dates,
        closes
      }
    });

  } catch (error) {
    console.error("DCA strategy error:", error);
    res.status(500).json({ error: "Failed to fetch DCA data" });
  }
});

app.post('/api/simulate-dca', async (req, res) => {
  const { symbol, amount, weeks } = req.body;
  if (!symbol || !amount || !weeks) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (weeks * 7));

    const result = await yahooFinance.historical(symbol, {
      period1: start.toISOString(),
      period2: end.toISOString(),
      interval: '1wk'
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    let totalInvested = 0;
    let totalShares = 0;

    result.slice(-weeks).forEach(entry => {
      const price = entry.close;
      const shares = amount / price;
      totalInvested += amount;
      totalShares += shares;
    });

    const latestPrice = result[result.length - 1].close;
    const finalValue = totalShares * latestPrice;
    const profit = finalValue - totalInvested;
    const percent = (profit / totalInvested) * 100;

    res.json({
      totalInvested,
      totalShares,
      finalValue,
      profit,
      percent
    });
  } catch (err) {
    console.error("DCA POST route failed:", err);
    res.status(500).json({ error: "Internal error in DCA simulation" });
  }
});



app.delete('/api/watchlist/:symbol', async (req, res) => {
  const symbol = req.params.symbol?.toUpperCase();

  if (!symbol) {
    return res.status(400).json({ error: 'Invaild symbol' });
  }

  try {
    const [result] = await db.execute('DELETE FROM stock_pool WHERE symbol = ?', [symbol]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cannot find this symbol' });
    }

    await loadWatchlist();
    res.json({ message: 'Delete successfully', symbol });
  } catch (err) {
    console.error('Fail to delete:', err);
    res.status(500).json({ error: 'Fail to delete' });
  }
});

//  Buy API
app.post('/api/portfolio/buy', async (req, res) => {
  const { symbol, shares } = req.body;

  if (!symbol || !shares || shares <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // 1. Check symbol exists in stock_pool
    const [rows] = await db.execute(
      'SELECT * FROM stock_pool WHERE symbol = ?',
      [symbol.toUpperCase()]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Symbol not in stock pool' });
    }

    // 2. Fetch price
    const quote = await yahooFinance.quote(symbol);
    const price = quote?.regularMarketPrice;
    if (!price) {
      return res.status(500).json({ error: 'Failed to fetch price' });
    }

    const today = new Date().toISOString().split('T')[0];

    // 3. Insert into userhave
    await db.execute(
      `INSERT INTO userhave (symbol, shares, buy_price, buy_date)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         shares = shares + VALUES(shares)`,
      [symbol.toUpperCase(), shares, price, today]
    );
    
    await db.execute(
      `INSERT INTO portfolio_transactions (symbol, shares, price, type, transaction_date)
       VALUES (?, ?, ?, 'buy', ?)`,
      [symbol.toUpperCase(), shares, price, today]
    );

    const cost = price * shares;
    await db.execute(`UPDATE cash_balance SET amount = amount - ? WHERE id = 1`, [cost]);

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


//sell
app.post('/api/portfolio/sell', async (req, res) => {
  const { symbol, shares } = req.body;

  if (!symbol || !shares || shares <= 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const upperSymbol = symbol.toUpperCase();
  const today = new Date().toISOString().split('T')[0];
  let sharesToSell = shares;

  try {
    // 1. Get all lots of that symbol (FIFO order)
    const [rows] = await db.execute(
      'SELECT * FROM userhave WHERE symbol = ? ORDER BY buy_date ASC',
      [upperSymbol]
    );

    const totalHeld = rows.reduce((sum, row) => sum + row.shares, 0);
    if (totalHeld < sharesToSell) {
      return res.status(400).json({ error: 'Not enough holdings to sell' });
    }

    const quote = await yahooFinance.quote(upperSymbol);
    const price = quote?.regularMarketPrice;
    if (!price) {
      return res.status(500).json({ error: 'Failed to fetch current price' });
    }

    let totalProceeds = 0;

    for (const row of rows) {
      if (sharesToSell === 0) break;

      const sellAmount = Math.min(sharesToSell, row.shares);

      if (sellAmount === row.shares) {
        // Delete this row completely
        await db.execute('DELETE FROM userhave WHERE id = ?', [row.id]);
      } else {
        // Partially reduce shares
        await db.execute(
          'UPDATE userhave SET shares = shares - ? WHERE id = ?',
          [sellAmount, row.id]
        );
      }

      // Log the sale in transactions
      await db.execute(
        `INSERT INTO portfolio_transactions (symbol, shares, price, type, transaction_date)
         VALUES (?, ?, ?, 'SELL', ?)`,
        [upperSymbol, sellAmount, price, today]
      );

      totalProceeds += sellAmount * price;
      sharesToSell -= sellAmount;
    }

    // 3. Update cash balance
    await db.execute(
      'UPDATE cash_balance SET amount = amount + ? WHERE id = 1',
      [totalProceeds]
    );

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


//get cash
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

//add cash
app.patch('/api/cashbalance/add', async (req, res) => {
  const { cash } = req.body;

  if (typeof cash !== 'number' || cash <= 0) {
    return res.status(400).json({ error: 'Invalid cash amount' });
  }

  try {
    // Add the cash to the balance
    const [result] = await db.execute(
      'UPDATE cash_balance SET amount = amount + ? WHERE id = 1',
      [cash]
    );

    res.json({ message: '✅ Cash added successfully', added: cash });
  } catch (err) {
    console.error('Error adding cash:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//extract cash
app.patch('/api/cashbalance/extract', async (req, res) => {
  const { cash } = req.body;

  if (!cash || typeof cash !== 'number' || cash <= 0) {
    return res.status(400).json({ error: 'Invalid cash amount' });
  }

  try {
    // Get current balance
    const [rows] = await db.execute('SELECT amount FROM cash_balance WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cash balance not found' });
    }

    const currentBalance = rows[0].amount;

    if (cash > currentBalance) {
      return res.status(400).json({ error: 'Insufficient balance to extract' });
    }

    // Subtract the amount
    await db.execute('UPDATE cash_balance SET amount = amount - ? WHERE id = 1', [cash]);

    res.json({
      message: '✅ Cash extracted to credit card successfully',
      extracted: cash,
      remainingBalance: currentBalance - cash
    });

  } catch (err) {
    console.error('Error extracting cash:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//profit
app.get('/api/portfolio/summary', async (req, res) => {
  try {
    const [result] = await db.execute(`
      SELECT
        SUM(u.shares * u.buy_price) AS total_invested,
        SUM(u.shares * s.current_price) AS current_value,
        SUM(u.shares * (s.current_price - u.buy_price)) AS gain
      FROM userhave u
      JOIN stock_pool s ON u.symbol = s.symbol
    `);

    res.json(result[0]);
  } catch (err) {
    console.error('Error in summary API:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//stock portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        symbol,
        SUM(shares) AS total_shares,
        ROUND(SUM(shares * buy_price) / SUM(shares), 2) AS average_price
      FROM userhave
      GROUP BY symbol
    `);

    if (rows.length === 0) return res.json([]);

    const quotes = await yahooFinance.quote(rows.map(r => r.symbol));
    const quoteMap = Array.isArray(quotes)
      ? Object.fromEntries(quotes.map(q => [q.symbol, q]))
      : { [quotes.symbol]: quotes };

    const result = rows.map(row => {
      const quote = quoteMap[row.symbol];
      const shares = parseFloat(row.total_shares);
      const avgPrice = parseFloat(row.average_price);
      const price = parseFloat(quote?.regularMarketPrice ?? 0);
      const totalValue = shares * price;
      const cost = shares * avgPrice;
      const gain = totalValue - cost;

      return {
        symbol: row.symbol,
        shares,
        averagePrice: +avgPrice.toFixed(2),
        currentPrice: +price.toFixed(2),
        totalValue: +totalValue.toFixed(2),
        gain: +gain.toFixed(2),
        gainPercent: +(cost === 0 ? 0 : (gain / cost * 100).toFixed(2)),
        currency: quote.currency,
        marketTime: quote.regularMarketTime
      };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Portfolio API Error:", err);
    res.status(500).json({ error: '获取投资组合失败' });
  }
});

//get transactions
app.get('/api/portfolio/transactions', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT symbol, shares, price, type, date_format(transaction_date,"%Y-%m-%d") as transaction_date
      FROM portfolio_transactions
      ORDER BY transaction_date DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.use(express.static('public'));

startServer();



