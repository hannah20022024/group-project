import express from 'express';
// import indexRouter from './routes/index.js';
import pool from './config/db.js';
// import fec from './backend/fetchtest.js'
import apis from './backend/tradingApi.js'
import transation from './backend/transactionRecord.js';
import cors from 'cors'
const app = express();

app.use(cors());

async function start() {
  try {
    // 测试数据库连接
    // const [rows] = await pool.query('SELECT * from holdings');
    // console.log('✅ MySQL 连接成功:', rows);
    apis();
    // Use Router
    // app.use('/', indexRouter);

    app.listen(4000, () => {
      console.log('服务器启动：http://localhost:4000');
    });
  } catch (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
}

start();
