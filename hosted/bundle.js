"use strict";

var canvas = void 0;
var ctx = void 0;
var socket = void 0;
var characters = {};
var hash = void 0;
var leftarrow = 37;
var leftarrowBool = false;
var rightarrow = 39;
var rightarrowBool = false;
var spacebar = 32;
var spacebarBool = false;
var walkImage = void 0;
var timer = void 0;
var previousTime = void 0;

var spriteSize = {
    WIDTH: 100,
    HEIGHT: 100
};

var init = function init() {

    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
    walkImage = document.querySelector("#walk");

    //connect to socket
    socket = io.connect();

    timer = 0;
    previousTime = Date.now();

    //after connect to socket
    socket.on("Joined", function (data) {

        characters[data.hash] = data;
        hash = data.hash;
    });

    //other users joined
    socket.on("userJoined", function (data) {
        if (!characters[data.hash]) {
            characters[data.hash] = data;
        }
    });

    socket.on("left", function (data) {
        delete characters[data.hashout];
    });

    //update position of all chars
    socket.on("serverUpdatepos", function (data) {

        if (data.character != undefined) {
            if (!characters[data.character.hash]) {
                characters[data.character.hash] = data.character;
            } else if (characters[data.character.hash].lastUpdate >= data.character.lastUpdate) {
                return;
            } else if (data.character.hash != hash) {
                characters[data.character.hash].prevX = data.character.prevX;
                characters[data.character.hash].destX = data.character.destX;
                characters[data.character.hash].destY = data.character.destY;
                characters[data.character.hash].prevY = data.character.prevY;
                characters[data.character.hash].alpha = data.character.alpha;
                characters[data.character.hash].frameCount = data.character.frameCount;
                characters[data.character.hash].frame = data.character.frame;
                characters[data.character.hash].direction = data.character.direction;
                characters[data.character.hash].lastUpdate = data.character.lastUpdate;
            } else {
                characters[data.character.hash].lastUpdate = data.character.lastUpdate;
            }
        }

        socket.on("serverGravity", function (data) {
            if (data.square != undefined) {
                if (!characters[data.square.hash]) {
                    characters[data.square.hash] = data.square;
                } else if (characters[data.square.hash].lastUpdate >= data.square.lastUpdate) {
                    return;
                } else {
                    characters[data.square.hash].destY = data.square.destY;
                    characters[data.square.hash].lastUpdate = data.square.lastUpdate;
                }
            }
        });
    });

    //start drawing
    draw();

    //handle buttons
    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("keyup", keyUpHandler);
};

//draw objects on screen
var draw = function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePosition();
    var keys = Object.keys(characters);
    for (var x = 0; x < keys.length; x++) {

        var object = characters[keys[x]];

        if (object.hash === hash) {
            if (leftarrowBool || rightarrowBool) {
                object.frameCount++;

                if (object.frameCount % 3 === 0) {
                    if (object.frame < 3) {
                        object.frame++;
                    } else {
                        object.frame = 1;
                    }
                }
            } else {
                object.frame = 0;
            }

            if (leftarrowBool) {
                object.direction = 0;
            } else if (rightarrowBool) {
                object.direction = 1;
            } else {
                object.direction = 0;
            }

            characters[hash] = object;
        }

        if (object.hash === hash) {
            ctx.filter = "none";
        } else {
            ctx.filter = "hue-rotate(90deg)";
        }

        ctx.drawImage(walkImage, spriteSize.WIDTH * object.frame, spriteSize.HEIGHT * object.direction, spriteSize.WIDTH, spriteSize.HEIGHT, object.x, object.y, spriteSize.WIDTH, spriteSize.HEIGHT);
    }
    socket.emit("updateFromclient", { "character": characters[hash], "hash": hash });
    requestAnimationFrame(draw);
};

//update positions
var updatePosition = function updatePosition() {

    moveLeftandRight();

    var keys = Object.keys(characters);
    //grab each user
    for (var x = 0; x < keys.length; x++) {
        var square = characters[keys[x]];

        if (square.alpha < 1) {
            square.alpha += 0.05;
        }

        square.prevX = square.x;
        square.prevY = square.y;
        square.x = lerp(square.prevX, square.destX, square.alpha);
        square.y = lerp(square.prevY, square.destY, square.alpha);

        characters[keys[x]] = square;
    }

    jumping();
};

//lerp
var lerp = function lerp(v0, v1, alpha) {
    return (1 - alpha) * v0 + alpha * v1;
};

// look for keycodes
var keydownHandler = function keydownHandler(e) {
    var keyCode = e.keyCode;
    console.log(keyCode);
    if (keyCode == leftarrow) {
        leftarrowBool = true;
    } else if (keyCode == rightarrow) {
        rightarrowBool = true;
    } else if (keyCode == spacebar) {
        spacebarBool = true;
    }
};

//if keys are released
var keyUpHandler = function keyUpHandler(e) {
    var keyCode = e.keyCode;

    if (keyCode == leftarrow) {
        leftarrowBool = false;
    } else if (keyCode == rightarrow) {
        rightarrowBool = false;
    } else if (keyCode = spacebar) {
        spacebarBool = false;
    }
};

var moveLeftandRight = function moveLeftandRight() {

    var square = characters[hash];

    if (square != undefined) {
        if (leftarrowBool && square.destX > 0) {

            square.destX -= 2;
            square.alpha = 0.05;
        } else if (rightarrowBool && square.destX < 400) {
            square.destX += 2;
            square.alpha = 0.05;
        }
        if (spacebarBool && square.hasJumped == false && square.y > 399) {
            square.hasJumped = true;
            square.alpha = 0.05;
            previousTime = Date.now();
        }
    }
};

var jumping = function jumping() {

    if (hash != undefined && characters[hash].hasJumped) {
        var square = characters[hash];
        var currentTime = Date.now();
        var deltaTime = currentTime - previousTime;
        timer += deltaTime;
        previousTime = currentTime;

        if (timer < 1000) {
            square.destY -= 5;
        } else {
            timer = 0;
            square.hasJumped = false;
        }
    }
};

window.onload = init;
