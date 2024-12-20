import { sessionStatus } from '../stores';
import type { SessionState, LoginResponse } from './types';

export function updateSessionState(data: LoginResponse, email: string): void {
  const newState: SessionState = {
    isActive: data.status === 'active',
    position: data.status === 'queued' ? data.position || null : null,
    email: data.status === 'queued' || data.status === 'active' ? email : null
  };
  
  sessionStatus.set(newState);
}