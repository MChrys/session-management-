import { redis } from '../config.js';

export async function getActiveUsers() {
  return await redis.smembers('active_users');
}

export async function getWaitingQueue() {
  return await redis.lrange('waiting_queue', 0, -1);
}

export async function addToActiveUsers(email) {
  await redis.sadd('active_users', email);
  await redis.set(`session:${email}`, Math.floor(Date.now() / 1000));
}

export async function addToWaitingQueue(email) {
  await redis.rpush('waiting_queue', email);
  return await redis.llen('waiting_queue');
}

export async function removeFromActiveUsers(email) {
  await redis.srem('active_users', email);
  await redis.del(`session:${email}`);
}

export async function promoteFromQueue() {
  const waitingUser = await redis.lpop('waiting_queue');
  if (waitingUser) {
    await addToActiveUsers(waitingUser);
  }
  return waitingUser;
}