// const data = {
//     id: 1,  // assume id is 1
//     volume: 10,       
//     price: 150.50     

// };

// // function fetchTest() {
//     fetch('http://localhost:3000/portfolio/buy', {
//         method: 'POST',  
//         headers: {
//             'Content-Type': 'application/json' 
//         },
//         body: JSON.stringify(data)  
//     })
//     .then(response => {
//         if (!response.ok) {
//             
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.text();  
//     })
//     .then(text => {
//         console.log('Response Text:', text);  
//         try {
//             const jsonData = JSON.parse(text);  
//             console.log('Parsed JSON:', jsonData);  
//         } catch (error) {
//             console.error('Failed to parse JSON:', error);  
//         }
//     })
//     .catch(error => console.error('Error:', error)); 
// // }


function sellStock(portfolioId, volume) {
    const data = {
        portfolio_id: portfolioId,
        volume: volume
    };

    fetch('http://localhost:3000/portfolio/sell', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'  
        },
        body: JSON.stringify(data)  // Convert the JavaScript object to a JSON string
    })
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
        console.log('Success:', data);  // Log the success message

    })
    .catch(error => {
        console.error('Error:', error);  // Handle any errors that occur during the fetch
    });
}

sellStock(1, 10);  


// function addCashToAccount(cashAmount) {
//     const data = {
//         cash: cashAmount
//     };

//     fetch('http://localhost:3000/account/cash/add', {
//         method: 'PATCH',  
//         headers: {
//             'Content-Type': 'application/json'  
//         },
//         body: JSON.stringify(data)  
//     })
//     .then(response => response.json())  // Parse the JSON response
//     .then(data => {
//         if (data.message) {
//             console.log('Success:', data.message);  
//         } else {
//             console.log('Error:', data.error);  
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);  
      
//     });
// }
// addCashToAccount(100); 
