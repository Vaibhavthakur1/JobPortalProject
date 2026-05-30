import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JobSignalStore {
  jobs = signal<any[]>([]);
  selectedJob = signal<any | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  setJobs(jobs: any[]) { this.jobs.set(jobs); }
  setSelectedJob(job: any) { this.selectedJob.set(job); }
  setLoading(loading: boolean) { this.isLoading.set(loading); }
  setError(error: string | null) { this.error.set(error); }
  clearError() { this.error.set(null); }
}

@Injectable({ providedIn: 'root' })
export class UISignalStore {
  isSidebarOpen = signal(true);
  isNotificationsOpen = signal(false);
  isProfileOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isDarkMode = signal<boolean>(localStorage.getItem('theme') === 'dark');

  toast = signal<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null>(null);

  constructor() {
    // Apply saved theme on startup
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    }
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    const dark = this.isDarkMode();
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleSidebar() { this.isSidebarOpen.update(v => !v); }
  toggleNotifications() { this.isNotificationsOpen.update(v => !v); this.isProfileOpen.set(false); }
  toggleProfile() { this.isProfileOpen.update(v => !v); this.isNotificationsOpen.set(false); }
  toggleMobileMenu() { this.isMobileMenuOpen.update(v => !v); }
  closeMobileMenu() { this.isMobileMenuOpen.set(false); }

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    this.toast.set({ message, type, visible: true });
  }
  hideToast() { this.toast.set(null); }
}
