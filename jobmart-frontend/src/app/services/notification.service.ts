import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { Notification } from '../models';
import { AuthSignalStore } from '../store/auth.signal';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api: AxiosInstance;

  constructor(private authStore: AuthSignalStore) {
    this.api = axios.create({ baseURL: environment.apiBaseUrls.notifications });
    this.api.interceptors.request.use((config) => {
      const token = this.authStore.accessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  getNotifications(page = 1, pageSize = 20) {
    return this.api.get<Notification[]>('/api/notifications', { params: { page, pageSize } });
  }

  getUnreadCount() {
    return this.api.get<{ count: number }>('/api/notifications/unread-count');
  }

  markAsRead(notificationId: string) {
    return this.api.patch(`/api/notifications/${notificationId}/read`);
  }

  markAllAsRead() {
    return this.api.patch('/api/notifications/read-all');
  }

  deleteNotification(notificationId: string) {
    return this.api.delete(`/api/notifications/${notificationId}`);
  }
}
