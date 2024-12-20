import { supabase } from '../supabaseClient';
import { AuthError, AUTH_ERRORS } from './errors';
import * as userService from './userService';

export async function signUp(email: string, password: string) {
    try {
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password
        });

        if (signUpError) {
            if (signUpError.message.includes('already registered')) {
                throw new AuthError('Email already registered', AUTH_ERRORS.USER_EXISTS);
            }
            throw new AuthError(signUpError.message);
        }

        if (!data.user) {
            throw new AuthError('Registration failed');
        }

        const { error: userError } = await userService.createUserRecord(
            data.user.id,
            data.user.email!
        );

        if (userError) {
            console.error('Error creating user record:', userError);
        }

        return { user: data.user };
    } catch (error: any) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError(error.message || 'Registration failed');
    }
}

export async function signIn(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                throw new AuthError('Invalid email or password', AUTH_ERRORS.INVALID_CREDENTIALS);
            }
            throw new AuthError(error.message);
        }

        if (!data.user) {
            throw new AuthError('Login failed');
        }

        await userService.updateLastLogin(data.user.id);
        return { user: data.user };
    } catch (error: any) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError(error.message || 'Login failed');
    }
}

export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw new AuthError(error.message);
    } catch (error: any) {
        throw new AuthError(error.message || 'Logout failed');
    }
}