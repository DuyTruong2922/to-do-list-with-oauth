const express = require('express')
const app = express()
const port = 3000
const http = require('http');
const path = require('path');




app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/dashbroad.html'));
})


const server = http.createServer(app);
server.listen(port, () => {
    console.log('Server started on port 3000');
    
  });