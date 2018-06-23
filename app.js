var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    http = require('http').Server(app),
    clientIO = require('socket.io-client');

// To connect to DBServer
var clientSocket = clientIO.connect('http://localhost:8080', {reconnect: true});

app.use(bodyParser.urlencoded({
    extended: true
}));

// Object to store list of key-value pair
var keyValueDatabase = {};

app.get('/', function (req, res) {
    res.send('OK\n');
});

// REST API to get key, ex: curl localhost:8080/set/key1
app.get('/get/:key', function (req, res) {
    var key = req.params.key;
    var val = "";

    if (keyValueDatabase[key]) {
        val = keyValueDatabase[key];
    }

    res.send(val + '\n');
});

// REST API to set key-value, ex: curl localhost:8080/set/key1 -d "value=val1"
app.post('/set/:key', function (req, res) {
    var key = req.params.key;
    var val = req.body.value;
    
    keyValueDatabase[key] = val;
    res.send('OK\n');
    
    // Ask DBServer to update all instance of app.js
    clientSocket.emit('syncDB', {'key':key, 'val':val});
});


clientSocket.on('connect', function (socket) { 
    console.log('client connected');

    // once the connection is established - get loaded data from DBServer.js
    clientSocket.on('initDB', function(loadedData) {
        console.log('initDB called with value ' + JSON.stringify(loadedData));
        keyValueDatabase = JSON.parse(JSON.stringify(loadedData));
    }); 
});

// Update object keyValueDatabase, if set by other instance of app.js or DBServer
clientSocket.on('syncDB', function (pair) { 
    if (!keyValueDatabase[pair.key])
            keyValueDatabase[pair.key] = pair.val;
});

// Get PORT number from arg. We can create multiple process each with separate arg
var PORT = process.argv.slice(2)[0];

if ( PORT == undefined ) {
    console.log('Please enter PORT number in arugment, For example:');
    console.log('node app.js 8081');
} else {
    http.listen(PORT, function () {
        console.log('Server started on port ' + PORT);
    });
}
