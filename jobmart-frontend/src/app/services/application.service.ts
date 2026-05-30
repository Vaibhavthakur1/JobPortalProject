import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { Application } from '../models';
import { AuthSignalStore } from '../store/auth.signal';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private api: AxiosInstance;

  constructor(private authStore: AuthSignalStore) {
    this.api = axios.create({ baseURL: environment.apiBaseUrls.applications });
    this.api.interceptors.request.use((config) => {
      const token = this.authStore.accessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  createApplication(data: { jobId: string; recruiterId: string; resumeId: string; coverLetter?: string }) {
    return this.api.post<Application>('/api/applications', data);
  }

  getApplicationDetail(applicationId: string) {
    return this.api.get<Application>(`/api/applications/${applicationId}`);
  }

  getMyApplications() {
    return this.api.get<Application[]>('/api/applications/my');
  }

  getJobApplicants(jobId: string) {
    return this.api.get<Application[]>(`/api/applications/job/${jobId}`);
  }

  updateApplicationStatus(applicationId: string, newStatus: string, note?: string) {
    return this.api.patch(`/api/applications/${applicationId}/status`, { newStatus, note });
  }

  withdrawApplication(applicationId: string) {
    return this.api.patch(`/api/applications/${applicationId}/withdraw`);
  }
}
