import express from 'express';
import cashRouter from './routes/index.js';
import pool from './config/db.js';
import yaml from 'yamljs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const swaggerDocument = yaml.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

console.log("load success");

async function start() {
  try {
    // 测试数据库连接
    const [rows] = await pool.query('SELECT * from holdings');
    console.log('✅ MySQL 连接成功:', rows);

    // // Use Router
    app.use('/api', cashRouter);

    app.listen(3000, () => {
      console.log('🚀 服务器启动：http://localhost:3000');
    });
  } catch (err) {
    console.error('❌ 数据库连接失败:', err);
    process.exit(1);
  }
}

start();
