// Import necessary modules
const request = require('supertest');  
// const app = require('../cashBalancetest.js');  
const app = require('../transactionTest');          
const db = require('../db');       


// jest.mock('../db', () => ({
//     execute: jest.fn().mockResolvedValue([[{ amount: 1000 }]])  // Simulate DB response
//   }));
  
  // describe('GET /api/cashbalance', () => {
  //   test('should return cash balance when found', async () => {
  //     // Log when the mock function is called
  //     db.execute.mockImplementation(() => {
  //       console.log('Mocked DB execute called');
  //       return Promise.resolve([[{ amount: 1000 }]]);
  //     });
  
  //     const response = await request(app).get('/api/cashbalance');
      
  //     // Log the response to ensure everything works as expected
  //     console.log('Response:', response.body);
  
  //     expect(response.statusCode).toBe(200);  // Expected: 200 OK
  //     expect(response.body.cashBalance).toBe(1000);  // Expected: 1000 cash balance


      
  //   });

  //   test('should return 404 when no cash balance record is found', async () => {
  //       // Simulate no records being returned from the database (empty array)
  //       require('../db.js').execute.mockResolvedValue([[]]);  // Empty array (no rows found)
    
  //       // Make the GET request
  //       const response = await request(app).get('/api/cashbalance');
    
  //       // Assert that the response status code is 404 (Not Found)
  //       expect(response.statusCode).toBe(404);
  //       expect(response.body.error).toBe('Cash balance not found');
  //     });
    
  //     // Test 3: Should return 500 when there is a database error
  //     test('should return 500 when there is a server error (DB failure)', async () => {
  //       // Simulate a database error (e.g., database connection failure)
  //       require('../db.js').execute.mockRejectedValue(new Error('Database error'));
    
  //       // Make the GET request
  //       const response = await request(app).get('/api/cashbalance');
    
  //       // Assert that the response status code is 500 (Internal Server Error)
  //       expect(response.statusCode).toBe(500);
  //       expect(response.body.error).toBe('Internal server error');
  //     });
    
    
  // });



jest.mock('../db.js', () => ({
  execute: jest.fn()   // Mock the 'execute' method of the db module
}));

describe('GET /api/portfolio/transactions', () => {

  // Test 1: Should return transaction history when found
  test('should return transaction history when found', async () => {
    // Mocked database response with a list of transactions
    const mockTransactions = [
      { symbol: 'AAPL', shares: 10, price: 150, type: 'buy', transaction_date: '2023-08-01' },
      { symbol: 'GOOG', shares: 5, price: 2800, type: 'sell', transaction_date: '2023-07-15' }
    ];

    // Simulate database response with mocked data
    db.execute.mockResolvedValue([mockTransactions]);

    // Make the GET request
    const response = await request(app).get('/api/portfolio/transactions');

    // Assert that the response status code is 200 (OK)
    expect(response.statusCode).toBe(200);
    
    // Assert that the response body contains the expected transactions
    expect(response.body).toEqual(mockTransactions);
  });

  // Test 2: Should return 500 when there is a database error
  test('should return 500 when there is a server error (DB failure)', async () => {
    // Simulate a database error (e.g., failed query)
    db.execute.mockRejectedValue(new Error('Database error'));

    // Make the GET request
    const response = await request(app).get('/api/portfolio/transactions');

    // Assert that the response status code is 500 (Internal Server Error)
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Internal server error');
  });

});

  