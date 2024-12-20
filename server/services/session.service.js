import { redis, SESSION_TIMEOUT } from '../config.js';
import * as queueService from './queue.service.js';

export async function checkSessions() {
  const currentTime = Math.floor(Date.now() / 1000);
  const activeUsers = await queueService.getActiveUsers();
  
  for (const user of activeUsers) {
    const sessionStart = await redis.get(`session:${user}`);
    if (sessionStart && (currentTime - parseInt(sessionStart)) > SESSION_TIMEOUT) {
      await handleLogout(user);
    }
  }
}

export async function handleLogout(email) {
  await queueService.removeFromActiveUsers(email);
  await queueService.promoteFromQueue();
}