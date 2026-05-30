import { Injectable, signal, computed } from '@angular/core';
import { User, AuthResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthSignalStore {
  // ── Access token: in-memory ONLY ──────────────────────────────────────────
  accessToken = signal<string | null>(null);

  // ── User info: sessionStorage (no tokens, just display data) ──────────────
  user = signal<User | null>(
    (() => {
      try {
        const raw = sessionStorage.getItem('user');
        return raw ? (JSON.parse(raw) as User) : null;
      } catch { return null; }
    })()
  );

  isLoading = signal(false);
  error = signal<string | null>(null);

  // ── Initialization state — guards wait for this before redirecting ─────────
  // true  = initial refresh attempt finished (success or fail)
  // false = still waiting for the silent refresh on startup
  initialized = signal(false);

  isAuthenticated = computed(() => !!this.accessToken());

  setAuth(auth: AuthResponse, user: User) {
    this.accessToken.set(auth.accessToken);
    sessionStorage.setItem('user', JSON.stringify(user));
    this.user.set(user);
    this.error.set(null);
  }

  setUser(user: User) {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.user.set(user);
  }

  clearAuth() {
    this.accessToken.set(null);
    this.user.set(null);
    this.error.set(null);
    sessionStorage.removeItem('user');
    // Clean up legacy localStorage entries
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  markInitialized() {
    this.initialized.set(true);
  }

  setLoading(loading: boolean) { this.isLoading.set(loading); }
  setError(error: string | null) { this.error.set(error); }

  loadFromStorage() {
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) this.user.set(JSON.parse(raw) as User);
    } catch { this.user.set(null); }
  }
}
