const express = require('express'); 
const app = express(); 
const port = 3000; 
app.get('/', (req, res) => { 
res.send('Hello, Express!'); 
}); 
app.listen(port, () => { 
console.log(`Server is running on http://localhost:${port}`); 
}); 
app.get('/about', (req, res) => { 
res.send('This is the About Page.'); 
}); 