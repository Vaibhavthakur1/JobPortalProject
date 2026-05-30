import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthSignalStore } from '../../../store/auth.signal';
import { UISignalStore } from '../../../store/ui.signal';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  notifLoading = signal(false);
  notifError = signal('');
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  jobSeekerLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/jobs', label: 'Browse Jobs' },
    { path: '/my-applications', label: 'Applications' },
    { path: '/resumes', label: 'Resumes' },
    { path: '/profile', label: 'My Profile' },
  ];
  recruiterLinks = [
    { path: '/recruiter/dashboard', label: 'Dashboard' },
    { path: '/recruiter/post-job', label: 'Post Job' },
    { path: '/recruiter/listings', label: 'Listings' },
    { path: '/recruiter/wallet', label: 'Wallet' },
  ];
  adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/flagged-jobs', label: 'Flagged' },
    { path: '/admin/audit-logs', label: 'Audit Logs' },
  ];

  constructor(
    readonly authStore: AuthSignalStore,
    readonly uiStore: UISignalStore,
    private authService: AuthService,
    private notifService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.authStore.isAuthenticated()) this.loadNotifications();
  }

  toggleNotifications() {
    this.uiStore.toggleNotifications();
    if (this.uiStore.isNotificationsOpen() && this.notifications().length === 0) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.notifLoading.set(true);
    this.notifError.set('');
    this.notifService.getNotifications(1, 20)
      .then(res => {
        const data = res.data as any;
        this.notifications.set(Array.isArray(data) ? data : (data?.items ?? []));
      })
      .catch(() => this.notifError.set('Failed to load notifications'))
      .finally(() => this.notifLoading.set(false));
  }

  markRead(n: Notification) {
    if (n.isRead) return;
    this.notifService.markAsRead(n.id).then(() => {
      this.notifications.update(list => list.map(item => item.id === n.id ? { ...item, isRead: true } : item));
    }).catch(() => {});
  }

  markAllRead() {
    this.notifService.markAllAsRead().then(() => {
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    }).catch(() => {});
  }

  deleteNotif(event: Event, id: string) {
    event.stopPropagation();
    this.notifService.deleteNotification(id).then(() => {
      this.notifications.update(list => list.filter(n => n.id !== id));
    }).catch(() => {});
  }

  closeDropdowns() {
    this.uiStore.isNotificationsOpen.set(false);
    this.uiStore.isProfileOpen.set(false);
  }

  logout() {
    this.authService.logout()
      .catch(() => {})
      .finally(() => {
        this.authStore.clearAuth();
        this.router.navigate(['/login']);
      });
  }

  getAvatarUrl(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=ffffff&bold=true`;
  }
}
