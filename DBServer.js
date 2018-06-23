var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    http = require('http').Server(app),
    serverIO = require('socket.io')(http);

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
    
    // Inform all instance of app.js to update thier db
    serverIO.sockets.emit('syncDB', {'key':key, 'val':val}); 
});

// Listening socket from all app.js instance
serverIO.on('connection', function(socket) {
    console.log('connection');
    
    // once the connection is established - pass loaded data to new app.js instance
    if (Object.keys(keyValueDatabase).length != 0) {
        socket.emit('initDB', keyValueDatabase);
    }

    socket.on('syncDB', function(pair){
        console.log('synching...' + pair.key + ":" + pair.val);
        if (!keyValueDatabase[pair.key])
            keyValueDatabase[pair.key] = pair.val;

    // sending to all clients except sender
    socket.broadcast.emit('syncDB', {'key':pair.key, 'val':pair.val});
    
    });
});

var PORT = 8080;

http.listen(PORT, function () {
	console.log('Server started on port ' + PORT);
});
