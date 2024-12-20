export interface UserRecord {
    id: string;
    email: string;
    is_active?: boolean;
    last_login?: string;
    session_started_at?: string;
    session_expires_at?: string;
}

export interface LoginResponse {
    status: 'active' | 'queued';
    position?: number;
    message?: string;
}

export interface SessionState {
    isActive: boolean;
    position: number | null;
    email: string | null;
}

export interface QueueInfo {
    activeUsers: string[];
    waitingQueue: string[];
    maxUsers: number;
}

export interface TableColumn {
    column_name: string;
    data_type: string;
    is_nullable: boolean;
}

export interface TableSchema {
    columns: TableColumn[];
}