import { sessionStatus, queueInfo } from './stores';
import { io } from 'socket.io-client';
import { signUp, signIn, signOut } from './auth/authService';
import { loginToServer, logoutFromServer } from './auth/apiClient';
import { updateSessionState } from './auth/sessionManager';
import { supabase } from './supabaseClient';

const API_URL = 'http://localhost:8000';
const socket = io(API_URL);

socket.on('status_update', (data) => {
    queueInfo.set({
        activeUsers: data.active_users,
        waitingQueue: data.waiting_queue,
        maxUsers: data.max_users
    });
});

export async function register(email: string, password: string) {
    const { user } = await signUp(email, password);
    return user;
}

export async function login(email: string, password: string) {
    const { user } = await signIn(email, password);
    const serverResponse = await loginToServer(email, password);
    updateSessionState(serverResponse, email);
    return serverResponse;
}

export async function logout() {
    const session = await supabase.auth.getSession();
    const email = session.data.session?.user?.email;
    
    if (email) {
        await logoutFromServer(email);
    }
    await signOut();
    
    sessionStatus.set({
        isActive: false,
        position: null,
        email: null
    });
}