import { Server } from 'socket.io';
import * as queueService from './services/queue.service.js';

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', async (socket) => {
    await broadcastStatus(io);
  });

  return io;
}

export async function broadcastStatus(io) {
  const activeUsers = await queueService.getActiveUsers();
  const waitingQueue = await queueService.getWaitingQueue();
  
  io.emit('status_update', {
    active_users: activeUsers,
    waiting_queue: waitingQueue,
    max_users: MAX_ACTIVE_USERS
  });
}