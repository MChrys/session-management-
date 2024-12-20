import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { PORT } from './config.js';
import { setupSocket, broadcastStatus } from './socket.js';
import * as authController from './controllers/auth.controller.js';
import { checkSessions } from './services/session.service.js';

const app = express();
const httpServer = createServer(app);
const io = setupSocket(httpServer);

app.use(cors());
app.use(express.json());

// Routes
app.post('/login', async (req, res) => {
  await authController.login(req, res);
  await broadcastStatus(io);
});

app.post('/logout', async (req, res) => {
  await authController.logout(req, res);
  await broadcastStatus(io);
});

// Start session checker
setInterval(checkSessions, 60000);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});