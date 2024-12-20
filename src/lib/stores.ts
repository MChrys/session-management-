import { writable } from 'svelte/store';
import type { SessionState, QueueInfo } from './auth/types';

export const sessionStatus = writable<SessionState>({
    isActive: false,
    position: null,
    email: null
});

export const queueInfo = writable<QueueInfo>({
    activeUsers: [],
    waitingQueue: [],
    maxUsers: 0
});