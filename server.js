// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

var currentFood ={x: getRandomInt(0, 60), y: getRandomInt(0, 40)};

var currentSnake = {x: 0, y: 0, xspeed: 1, yspeed: 0, total: 0, tail: []};

// Tell server where to look for files
app.use(express.static('public'));


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Create socket connection
let io = require('socket.io').listen(server);

let events = io.of('/event');

// Listen for clients to connect
//broadcast the positions of apple and snake
events.on('connection', function (socket) {
  console.log('A client connected: ' + socket.id);
  events.emit('foodUpdate', currentFood);
  events.emit('snakeUpdate', currentSnake);

  // Listen for keypressed messages
  socket.on('keyPressed', function (data) {
 

    // Send data to all clients
    events.emit('keyPressed', data);
  });


// Listen for data of current apple(position)
// and generate a new apple randomly 
  socket.on('foodUpdate', function(data){
  	currentFood = {x: getRandomInt(0, 60),
  	                y: getRandomInt(0, 40)};

//send the positon of new apple
  	events.emit('foodUpdate', currentFood);
  });

// Listen for data of current snake position
  socket.on('snakeUpdate', function(data){
  	// console.log(data);
  	currentSnake = data;
    //events.emit('snakeUpdate', currentSnake);
  });




  // Listen for this input client to disconnect
  socket.on('disconnect', function () {
    console.log("Client has disconnected " + socket.id);
  });
});