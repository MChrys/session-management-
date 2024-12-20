export class AuthError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export const AUTH_ERRORS = {
    USER_EXISTS: 'user_already_exists',
    INVALID_CREDENTIALS: 'invalid_credentials'
} as const;