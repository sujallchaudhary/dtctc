const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dbConnection = require('./src/database/connection');
const {initializeSocket}= require('./src/socket/socket');
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
dbConnection();

app.use(cors());
app.use(express.json());
initializeSocket(io);

const health = require('./src/routes/health.route');

app.use('/health', health);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
