<!-- Update error handling in App.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { sessionStatus, queueInfo } from './lib/stores';
  import { login, logout, register } from './lib/api';
  import { syncWithSupabase } from './lib/auth/syncService';
  import { AUTH_ERRORS } from './lib/auth/errors';
  
  let email = '';
  let password = '';
  let error = '';
  let isRegistering = false;
  let isLoading = true;
  let syncError = '';
  
  onMount(async () => {
    try {
      await syncWithSupabase();
    } catch (e: any) {
      syncError = e.message;
      console.error('Sync error:', e);
    } finally {
      isLoading = false;
    }
  });
  
  async function handleRegister() {
    try {
      error = '';
      await register(email, password);
      isRegistering = false;
      email = '';
      password = '';
    } catch (e: any) {
      if (e.code === AUTH_ERRORS.USER_EXISTS) {
        error = 'This email is already registered. Please login instead.';
      } else {
        error = e.message || 'Registration failed. Please try again.';
      }
    }
  }
  
  async function handleLogin() {
    try {
      error = '';
      await login(email, password);
    } catch (e: any) {
      if (e.code === AUTH_ERRORS.INVALID_CREDENTIALS) {
        error = 'Invalid email or password.';
      } else {
        error = e.message || 'Login failed. Please try again.';
      }
    }
  }
  
  async function handleLogout() {
    try {
      await logout();
    } catch (e: any) {
      error = e.message || 'Logout failed. Please try again.';
    }
  }
</script>

<!-- Rest of the template remains the same -->
{#if isLoading}
  <div class="loading">
    <p>Loading...</p>
  </div>
{:else if syncError}
  <div class="error-container">
    <h2>Database Synchronization Error</h2>
    <p class="error">{syncError}</p>
    <p>Please contact support to resolve this issue.</p>
  </div>
{:else if !$sessionStatus.isActive && !$sessionStatus.position}
  <div class="login-form">
    <h1>{isRegistering ? 'Register' : 'Login'}</h1>
    {#if error}
      <div class="error">{error}</div>
    {/if}
    <input
      type="email"
      bind:value={email}
      placeholder="Email"
    />
    <input
      type="password"
      bind:value={password}
      placeholder="Password"
    />
    <button on:click={isRegistering ? handleRegister : handleLogin}>
      {isRegistering ? 'Register' : 'Login'}
    </button>
    <button class="secondary" on:click={() => isRegistering = !isRegistering}>
      {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
    </button>
  </div>
{:else if $sessionStatus.position}
  <div class="waiting">
    <h2>Waiting in Queue</h2>
    <p>Your position: {$sessionStatus.position}</p>
    <p>Users ahead of you: {$queueInfo.waitingQueue.indexOf($sessionStatus.email)}</p>
  </div>
{:else}
  <div class="active-session">
    <h2>Welcome, {$sessionStatus.email}!</h2>
    <p>Your session will expire in 20 minutes</p>
    <button on:click={handleLogout}>Logout</button>
  </div>
{/if}

<div class="status">
  <h3>System Status</h3>
  <p>Active Users: {$queueInfo.activeUsers.length}/{$queueInfo.maxUsers}</p>
  <p>Users in Queue: {$queueInfo.waitingQueue.length}</p>
</div>

<style>
/* Styles remain the same */
</style>