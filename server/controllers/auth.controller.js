import { MAX_ACTIVE_USERS, supabase } from '../config.js';
import * as queueService from '../services/queue.service.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    const activeUsers = await queueService.getActiveUsers();
    
    if (activeUsers.length >= MAX_ACTIVE_USERS) {
      const position = await queueService.addToWaitingQueue(email);
      return res.json({ status: 'queued', position });
    }
    
    await queueService.addToActiveUsers(email);
    res.json({ status: 'active', message: 'Login successful' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

export async function logout(req, res) {
  const { email } = req.body;
  await queueService.removeFromActiveUsers(email);
  await queueService.promoteFromQueue();
  res.json({ status: 'success', message: 'Logged out successfully' });
}