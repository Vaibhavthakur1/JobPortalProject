import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { UserDto, FlaggedJob, AuditLog, PaginatedResponse } from '../models';
import { AuthSignalStore } from '../store/auth.signal';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api: AxiosInstance;

  constructor(private authStore: AuthSignalStore) {
    this.api = axios.create({ baseURL: environment.apiBaseUrls.admin });
    this.api.interceptors.request.use((config) => {
      const token = this.authStore.accessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  getUsers(page = 1, pageSize = 20) {
    return this.api.get<UserDto[]>('/api/admin/users', { params: { page, pageSize } });
  }

  changeUserRole(userId: string, role: string) {
    return this.api.patch(`/api/admin/users/${userId}/role`, { role });
  }

  deactivateUser(userId: string) {
    return this.api.patch(`/api/admin/users/${userId}/deactivate`);
  }

  getFlaggedJobs(status?: string, page = 1, pageSize = 20) {
    return this.api.get<FlaggedJob[]>('/api/admin/flagged-jobs', { params: { status, page, pageSize } });
  }

  flagJob(jobId: string, reason: string) {
    return this.api.post<FlaggedJob>('/api/admin/flag-job', { jobId, reason });
  }

  reviewFlaggedJob(id: string, status: 'Reviewed' | 'Dismissed') {
    return this.api.patch<FlaggedJob>(`/api/admin/flagged-jobs/${id}`, { status });
  }

  getAuditLogs(userId?: string, entity?: string, page = 1, pageSize = 50) {
    return this.api.get<PaginatedResponse<AuditLog>>('/api/admin/audit-logs', { params: { userId, entity, page, pageSize } });
  }
}
