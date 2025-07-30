const express = require("express");
const cors = require("cors");
const stockRoutes = require("./routes/stockRoutes");
require("dotenv").config();

// import fec from './backend/fetchtest.js'
import apis from './backend/tradingApi.js'
import transation from './backend/transactionRecord.js';
import cors from 'cors'
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/stocks", stockRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
