import express from 'express';
const router = express.Router();
import pool from '../config/db.js';
import dotenv from 'dotenv';
import yahooFinance from 'yahoo-finance2';

// // 配置数据库连接
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',       // 改成你的 MySQL 用户名
//     password: '1234', // 改成你的 MySQL 密码
//     database: 'portfolio_db'
// });



router.get('/getCash', async (req, res) => {
    // const conn = await pool.getConnection();
    // await conn.query('SELECT amount FROM cash_balance where id = 1', (err, results) => {
    //     if (err) return res.status(500).json({ error: err.message });
    //     res.json(results[0]);
    // });
    try {
        const conn = await pool.getConnection();   // 注意 await
        const [rows] = await conn.query('SELECT amount FROM cash_balance WHERE id = 1');
        conn.release();  // 记得释放连接
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 历史买入记录
// router.get('/historyBuy', async (req, res) => {
//     // const { page = 1, pageSize = 10 } = req.query;
//     // const offset = (page - 1) * pageSize;

//     pool.query('SELECT COUNT(*) as total FROM portofolio_transaction', (err, countResult) => {
//         if (err) return res.status(500).json({ error: err.message });
//         const total = countResult[0].total;

//         db.query('SELECT * FROM portofolio_transaction', (err, results) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json({
//                 data: results,
//                 total: total
//             });
//         });
//     });
// });

// routes/index.js
router.get('/historyBuy', async (req, res) => {
    try {
        // 查询总数
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM portfolio_transactions');
        const total = countResult[0].total;

        // 查询具体数据
        const [results] = await pool.query('SELECT * FROM portfolio_transactions');

        res.json({
            data: results,
            total: total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



// 获取收益
router.get('/getEarns', (req, res) => {

    const quote = yahooFinance.quote(symbol);
    // return {
    //     symbol: quote.symbol,
    //     name: quote.shortName,
    //     price: quote.regularMarketPrice,
    //     change: quote.regularMarketChange,
    //     percentChange: quote.regularMarketChangePercent,
    //     marketTime: quote.regularMarketTime,
    //     currency: quote.currency
    // };

    const result = pool.query('SELECT * FROM portofolio_transaction where transaction_type is sell');
});

export default router;




