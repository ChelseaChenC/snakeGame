// Open and connect input socket
let socket = io('/event');

// Listen for confirmation of connection
socket.on('connect', function () {
  console.log("Connected", arguments);
});

var s;
//define the size of each grid
var scl = 20;
//the x y coodinates of apple
var food = {x: null, y: null};

function setup() {
  createCanvas(60*scl, 40*scl);
  frameRate(5);

  // Listen for keyPressed data
  socket.on('keyPressed', function (data) {
    keyCode = data.keyCode;
  
      if (keyCode === UP_ARROW) {
      s.dir(0, -1);
      } else if (keyCode === DOWN_ARROW) {
        s.dir(0, 1);
      } else if (keyCode === RIGHT_ARROW) {
        s.dir(1, 0);
      } else if (keyCode === LEFT_ARROW) {
        s.dir(-1, 0);
      }
  });


  // Listen for snakeUpdate data(position, length...)
  socket.on('snakeUpdate', function(data){
    s = new Snake(data.x, data.y, data.xspeed, data.yspeed, data.total, data.tail);
  });

  // Listen for appleUpdate data(positions)
  socket.on('foodUpdate', function (data) {
    food.x = data.x * scl;
    food.y = data.y * scl;
  });

}

// function pickLocation() {
//   var cols = floor(width/scl);
//   var rows = floor(height/scl);
//   food = createVector(floor(random(cols)), floor(random(rows)));
//   food.mult(scl);
// }


// function trackMouse() {
//   var cols = floor(width/scl);
//   var rows = floor(height/scl);
//   food = createVector(floor(mouseX/scl), floor(mouseY/scl));
//   food.mult(scl);
// }

// function mousePressed() {
//   trackMouse();
// }




function draw() {
  if (s == null) {
    return;
  }

  background(51);
  console.log(food);
  //if snake ate the apple, randomly update a new apple
  if (s.eat(food)) {
    socket.emit('foodUpdate', food);
  }
  s.death();
  // console.log('before death',s);
  s.update();
  // console.log('update',s);
  s.show();


  fill(255, 0, 100);
  rect(food.x, food.y, scl, scl);
  // console.log('rect',s);

  // Send data every time(every frame) the snake moves
  socket.emit('snakeUpdate', {
    x: s.x,
    y: s.y,
    xspeed: s.xspeed,
    yspeed: s.yspeed,
    total: s.total,
    tail: s.tail.map(function (vec) {return {x: vec.x, y: vec.y}})
  });
  // console.log('emit',s);

}


//how we differentiate players

function keyPressed() {  
    var checkUpDown = updownControl && (keyCode == UP_ARROW || keyCode == DOWN_ARROW)
    var checkLeftRight = !updownControl && (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW)
    console.log(checkUpDown, checkLeftRight, keyCode, (keyCode == UP_ARROW || keyCode == DOWN_ARROW), (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW));

//send directions data to server.
    if(checkLeftRight || checkUpDown) socket.emit('keyPressed', {keyCode: keyCode});
}



function Snake(x, y, xspeed, yspeed, total, tail) {
  this.x = x;
  this.y = y;
  this.xspeed = xspeed;
  this.yspeed = yspeed;
  this.total = total;
  this.tail = tail.map(function (pos) {return createVector(pos.x, pos.y)});

  this.eat = function(food) {
    var d = dist(this.x, this.y, food.x, food.y);
    if (d < 1) {
      this.total++;
      return true;
    } else {
      return false;
    }
  }

  this.dir = function(x, y) {
    this.xspeed = x;
    this.yspeed = y;
  }

  this.death = function() {
    for (var i = 0; i < this.tail.length; i++) {
      var pos = this.tail[i];
      var d = dist(this.x, this.y, pos.x, pos.y);
      console.log(this.x - pos.x);
      if (d < 1) {
        console.log('starting over');
        this.total = 0;
        this.tail = [];
      }
    }
  }

  this.update = function() {
    for (var i = 0; i < this.tail.length - 1; i++) {
      this.tail[i] = this.tail[i + 1];
    }
    if (this.total >= 1) {
      this.tail[this.total - 1] = createVector(this.x, this.y);
    }

    this.x = this.x + this.xspeed * scl;
    this.y = this.y + this.yspeed * scl;

    this.x = constrain(this.x, 0, width - scl);
    this.y = constrain(this.y, 0, height - scl);
  }

  this.show = function() {
    fill(255);
    for (var i = 0; i < this.tail.length; i++) {
      rect(this.tail[i].x, this.tail[i].y, scl, scl);
    }
    rect(this.x, this.y, scl, scl);

  }
}