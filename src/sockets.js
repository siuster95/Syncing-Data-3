const xxh = require('xxhashjs');

const Character = require('./Characters.js');

const phsyics = require('./physics.js');

const characters = {};

let io;

const setupSockets = (ioServer) => {
  io = ioServer;

  // make a new square and send it
  io.on('connection', (sock) => {
    const socket = sock;

    socket.join('room1');

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    characters[hash] = new Character(hash);
    characters[hash].id = socket.id;

    socket.emit('Joined', characters[hash]);
    socket.broadcast.emit('userJoined', characters[hash]);

    socket.on('updateFromclient', (data) => {
      if (data.hash !== undefined) {
        characters[data.hash] = data.character;
        phsyics.setcharacters(characters);
        characters[data.hash].lastUpdate = new Date().getTime();
        io.sockets.in('room1').emit('serverUpdatepos', { "character":characters[data.hash]});


      }
    });

    socket.on('disconnect', () => {
      const keys = Object.keys(characters);

      for (let i = 0; i < keys.length; i++) {
        const object = characters[keys[i]];

        if (object.id === socket.id) {
          delete characters[keys[i]];
        }
      }


      socket.leave('room1');
    });
  });
};

// send position update of one square
const updatingpositions = (square) => {
  io.sockets.in('room1').emit('serverUpdatepos', { square });
};

// send position updates of all squares
const serverGravity = (square) => {
  io.sockets.in('room1').emit('serverGravity', { square });
};


module.exports.setupSockets = setupSockets;
module.exports.serverGravity = serverGravity;
module.exports.characters = characters;
