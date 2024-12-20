from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional
import socketio
from supabase import create_client, Client

app = FastAPI()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio)
app.mount('/', socket_app)

# Configuration
REDIS_URL = "redis://localhost:6379"
SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_KEY"
MAX_ACTIVE_USERS = 5
SESSION_TIMEOUT = 20 * 60  # 20 minutes in seconds

# Redis connection
redis_client = redis.from_url(REDIS_URL, decode_responses=True)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_active_users() -> List[str]:
    return [user async for user in redis_client.smembers('active_users')]

async def get_waiting_queue() -> List[str]:
    return [user async for user in redis_client.lrange('waiting_queue', 0, -1)]

@app.post("/login")
async def login(email: str, password: str):
    try:
        # Verify user credentials with Supabase
        user = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        active_users = await get_active_users()
        
        if len(active_users) >= MAX_ACTIVE_USERS:
            # Add to waiting queue
            await redis_client.rpush('waiting_queue', email)
            position = await redis_client.llen('waiting_queue')
            return {"status": "queued", "position": position}
        
        # Add user to active users
        await redis_client.sadd('active_users', email)
        await redis_client.set(f'session:{email}', str(datetime.now().timestamp()))
        
        # Broadcast updated lists
        await broadcast_status()
        
        return {"status": "active", "message": "Login successful"}
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/logout")
async def logout(email: str):
    await redis_client.srem('active_users', email)
    await redis_client.delete(f'session:{email}')
    
    # Check waiting queue
    waiting_user = await redis_client.lpop('waiting_queue')
    if waiting_user:
        await redis_client.sadd('active_users', waiting_user)
        await redis_client.set(f'session:{waiting_user}', str(datetime.now().timestamp()))
    
    await broadcast_status()
    return {"status": "success", "message": "Logged out successfully"}

async def check_sessions():
    while True:
        current_time = datetime.now().timestamp()
        active_users = await get_active_users()
        
        for user in active_users:
            session_start = await redis_client.get(f'session:{user}')
            if session_start and (current_time - float(session_start)) > SESSION_TIMEOUT:
                await logout(user)
        
        await asyncio.sleep(60)  # Check every minute

@sio.on('connect')
async def connect(sid, environ):
    await broadcast_status()

async def broadcast_status():
    active_users = await get_active_users()
    waiting_queue = await get_waiting_queue()
    
    await sio.emit('status_update', {
        'active_users': active_users,
        'waiting_queue': waiting_queue,
        'max_users': MAX_ACTIVE_USERS
    })

# Start session checker
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(check_sessions())