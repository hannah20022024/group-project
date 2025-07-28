import express from 'express';
import bodyParser from 'body-parser';
// const mysql = require('mysql2/promise')
// import mysql from 'mysql2'
import pool from '../config/db.js'

const app = express()
app.use(bodyParser.json())

// const connection = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"n3u3da!",
//     database:"portfolio_db"
// })

// const pool = mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"n3u3da!",
//     database:"portfolio_db",
//     waitForConnections:true,
//     connectionLimit:10
// })

// pool.query('SELECT * FROM portfolio')
//     .then(([rows, fields]) => {
//         console.log(rows);
//     })
//     .catch(err => {
//         console.error('Database error:', err);
//     });

// async function testConnection(pool){
//     try{
//         const conn = await pool.getConnection()
//         console.log('connect successfully')
//         conn.release()
//     }catch(error){
//         console.error('connect failed')
//     }
// }
// testConnection(pool)

// connection.connect(error=>{
//     if(error){
//         console.error("DB connection failed:", error)
//         return
//     }
//     console.log("Connected to mysql database")
// })

//  Get account detail
// app.get('/accounts',async(req,res)=>{
//     try{
        
//     }
// })
function APIS(){
// ADD Cash to account
app.patch('/account/cash/add',async (req,res)=>{
    const { cash } = req.body
    const conn = await pool.getConnection();
    try{
        await conn.query('UPDATE cash_balance SET amount = amount + ?', [cash])
        res.json({message:'Add successfully'})
    }finally{
        conn.release()
    }
   
})

// Buy stock
app.post('/portfolio/buy', async (req,res)=>{
    const { id, volume, price } = req.body;
    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction()

        // const [[stock]] = await conn.query('SELECT price FROM portfolio_transactions WHERE portfolio_id=?', [portfolio_id])
        const [[stock]] = await conn.query('SELECT volume,price FROM portfolio_table WHERE id = ?', [id]);
        if (!stock) {
            await conn.rollback();
            return res.status(400).json({ error: 'Stock not exist' });
        }
        const [[account]] = await conn.query('SELECT amount FROM cash_balance WHERE id = 1'); 

        const cost = stock.volume * stock.price;

        if(account.amount < cost){
            await conn.rollback()
           return res.status(400).json({error:'Not enought balance'})
        }
           // Update balance
        const temp = parseFloat(account.amount) - parseFloat(cost);
        const temp1 = parseFloat(account.amount) ;
        
        await conn.query('UPDATE cash_balance SET amount = ? WHERE id =1', [parseFloat(temp)]);

        // Update record
        const transactionDate = new Date();
        await conn.query('INSERT INTO portfolio_transactions (portfolio_id, transaction_type, volume, price, transaction_date) VALUES (?, "BUY", ?, ?, ?)', 
            [id, volume, price, transactionDate]);

        // Update stock data
        await conn.query('UPDATE portfolio SET volume = volume + ? WHERE id = ?', [volume, id]);

        await conn.commit();
        res.json({ message: 'Buy successfully' });
    }catch(error){
        await conn.rollback();
        console.error(error);
        res.status(500).json({ error: 'Cannot buy this stock' });
    }finally{
        conn.release()
    }
})

//  Sell stock
app.post('/portfolio/sell', async(req,res)=>{
    const { portfolio_id, volume } = req.body;
    const conn = await pool.getConnection()

    try{
        await conn.beginTransaction()

        // Get the current price
        const [[stock]] = await conn.query('SELECT price FROM portfolio_transactions WHERE portfolio_id = ?', [portfolio_id])
        if(!stock){
            await conn.rollback();
            return res.status(400).json({error: 'Not exist'})
        }
        // Get what user own
        const [[holding]] = await conn.query('SELECT volume FROM portfolio_table WHERE id = ?', [portfolio_id]);
        if (!holding || holding.volume < volume) {
            await conn.rollback();
            return res.status(400).json({ error: 'Holding is not enough' });
        }
        const income = volume * stock.price

        //Update the income
        await conn.query('UPDATE cash_balance SET amount = amount + ? WHERE id = 1', [income]);

        // Update portfolio's amount
        await conn.query('UPDATE portfolio_table SET volume = volume - ? WHERE id = ?', [volume, portfolio_id]);

        // Record transaction
        const transactionDate = new Date();
        await conn.query('INSERT INTO portfolio_transactions (portfolio_id, transaction_type, volume, price, transaction_date) VALUES (?, "SELL", ?, ?, ?)', 
            [portfolio_id, volume, stock.price, transactionDate]);

        await conn.commit();
        res.json({message:'sold successfully'})

    }catch(error){
        await conn.rollback()
        console.error(error)
    }finally{
        conn.release()
    }
})

}

app.listen(3000, () => {
    console.log(`Server is running on http://localhost3000`);
});

export default APIS;