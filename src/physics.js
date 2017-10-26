const sockets = require('./sockets.js');


let characters = {};

// gravity
const gravity = () => {
  const keys = Object.keys(characters);

  for (let x = 0; x < keys.length; x++) {
    const char = characters[keys[x]];
    if (char.destY + 100 < 499) {

      
      char.destY += 5;
      char.alpha = 0.05;
    } else {
      char.destY = 400;
    }

    characters[keys[x]] = char;
    characters[keys[x]].lastUpdate = new Date().getTime();
    sockets.serverGravity(characters[keys[x]]);
  }
  // send new position
};

// set the characters over here
const setcharacters = (chars) => {
  characters = chars;
};


setInterval(() => {
  gravity();
}, 40);

module.exports.setcharacters = setcharacters;
