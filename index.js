import {
  pipe,
} from 'ramda';

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

  socket.on('user registration validation', (userEmail) => {
    const existentUser = usersDb.find(({ email }) => email === userEmail).length;
    console.log('existentUser:', existentUser);
    io.emit('user registration check', !existentUser);
  });

  socket.on('register user', (usr) => {
    console.log('registering user:', usr);
    const updatedDb = [...usersDb, usr];
    writeJSONFile('./usersDb.json')(updatedDb);

    io.emit('user registered', usr);
  });

  socket.on('user authentication validation', ({ email: userEmail, password: userPassword }) => {
    const authenticatedUser = usersDb.find(({ email, password }) => email === userEmail && password === userPassword).length;
    console.log('authenticatedUser:', authenticatedUser);
    io.emit('user authetication check', !authenticatedUser);
  });

  socket.on('authenticate user', (usr) => {
    console.log('authenticating user:', usr);
    const existentUser
    io.emit('user authenticated', usr);
  });

  socket.on('user authenticated', (usr) => {
    console.log('user authenticated:', usr);
    io.emit('user authenticated', usr);
  });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});

// io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

server.listen(3000, () => {
  console.log('listening on *:3000');
});
