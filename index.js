import express from 'express';
import cashRouter from './routes/index.js';
import pool from './config/db.js';
import yaml from 'yamljs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

// import fec from './backend/fetchtest.js'
import apis from './backend/tradingApi.js'
import transation from './backend/transactionRecord.js';
import cors from 'cors'
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const swaggerDocument = yaml.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

console.log("load success");

app.use(cors());

async function start() {
  try {
    // 测试数据库连接
    const [rows] = await pool.query('SELECT * from holdings');
    console.log('✅ MySQL 连接成功:', rows);

    // // Use Router
    app.use('/api', cashRouter);
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
