import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthSignalStore } from '../store/auth.signal';

// APP_INITIALIZER in main.ts guarantees the silent refresh completes before
// the router runs, so initialized is always true here. Guards are synchronous.

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authStore: AuthSignalStore) {}
  canActivate() {
    if (this.authStore.isAuthenticated()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class JobSeekerGuard implements CanActivate {
  constructor(private router: Router, private authStore: AuthSignalStore) {}
  canActivate() {
    if (this.authStore.isAuthenticated() && this.authStore.user()?.role === 'JobSeeker') return true;
    this.redirectByRole(this.authStore.user()?.role);
    return false;
  }
  private redirectByRole(role?: string) {
    if (role === 'Recruiter') this.router.navigate(['/recruiter/dashboard']);
    else if (role === 'Admin') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/login']);
  }
}

@Injectable({ providedIn: 'root' })
export class RecruiterGuard implements CanActivate {
  constructor(private router: Router, private authStore: AuthSignalStore) {}
  canActivate() {
    if (this.authStore.isAuthenticated() && this.authStore.user()?.role === 'Recruiter') return true;
    this.redirectByRole(this.authStore.user()?.role);
    return false;
  }
  private redirectByRole(role?: string) {
    if (role === 'JobSeeker') this.router.navigate(['/dashboard']);
    else if (role === 'Admin') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/login']);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private authStore: AuthSignalStore) {}
  canActivate() {
    if (this.authStore.isAuthenticated() && this.authStore.user()?.role === 'Admin') return true;
    this.redirectByRole(this.authStore.user()?.role);
    return false;
  }
  private redirectByRole(role?: string) {
    if (role === 'JobSeeker') this.router.navigate(['/dashboard']);
    else if (role === 'Recruiter') this.router.navigate(['/recruiter/dashboard']);
    else this.router.navigate(['/login']);
  }
}
