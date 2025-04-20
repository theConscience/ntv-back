const {
  pipe,
  curry,
} = require('ramda');

// NOTE: server
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// NOTE: db
const fs = require('fs');
const loadJSONFile = pipe(
  fs.readFileSync,
  JSON.parse,
);

const usersDb = loadJSONFile('./usersDb.json');

const writeFileSync = curry(fs.writeFileSync);
const writeJSONFile = fileName => pipe(
  JSON.stringify,
  writeFileSync(fileName),
);

app.get('/', (req, res) => {
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(socket)
  io.emit('user connected', 'TEMP');

  socket.on('disconnect', (name) => {
    console.log('user disconnected', name);
    io.emit('user disconnected', name);
  });


  // Registration:

  socket.on('register user', (usr) => {
    const existentUser = usersDb.find(({ email }) => email === userEmail);
    console.log('existentUser:', existentUser);
    const userExists = existentUser ? existentUser.length : false;
    console.log('userExists:', userExists);

    if (userExists) {
      io.emit('user already exist', usr);
      return;
    }

    console.log('registering user:', usr);
    const updatedDb = [...usersDb, usr];
    writeJSONFile('./usersDb.json')(updatedDb);

    io.emit('user registered', usr);
  });


  // Authentication:

  socket.on('authenticate user', (usr) => {
    const authenticatedUser = usersDb.find(({ email, password }) => email === userEmail && password === userPassword);
    console.log('authenticatedUser:', authenticatedUser);
    const isAuthenticated = authenticatedUser ? authenticatedUser.length : false;
    console.log('isAuthenticated:', isAuthenticated);

    if (!isAuthenticated) {
      io.emit('unknown user', usr);
      return;
    }

    console.log('authenticating user:', usr);
    io.emit('user authenticated', usr);
  });

  socket.on('user authenticated', (usr) => {
    console.log('user authenticated:', usr);
    // io.emit('user authenticated', usr);
  });


  // Messaging:

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

// io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

server.listen(3000, () => {
  console.log('listening on *:3000');
});
