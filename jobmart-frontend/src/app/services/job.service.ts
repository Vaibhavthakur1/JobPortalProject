import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { Job, JobSearchParams, PaginatedResponse } from '../models';
import { AuthSignalStore } from '../store/auth.signal';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private api: AxiosInstance;

  constructor(private authStore: AuthSignalStore) {
    this.api = axios.create({
      baseURL: environment.apiBaseUrls.jobs,
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use((config) => {
      const token = this.authStore.accessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  searchJobs(params: JobSearchParams) {
    return this.api.get<PaginatedResponse<Job>>('/api/jobs/search', {
      params,
    });
  }

  getJobDetail(jobId: string) {
    return this.api.get<Job>(`/api/jobs/${jobId}`);
  }

  createJob(data: Partial<Job>) {
    return this.api.post<Job>('/api/jobs', data);
  }

  updateJob(jobId: string, data: Partial<Job>) {
    return this.api.put<Job>(`/api/jobs/${jobId}`, data);
  }

  getMyListings() {
    return this.api.get<Job[]>('/api/jobs/my-listings');
  }

  closeJob(jobId: string) {
    return this.api.patch(`/api/jobs/${jobId}/close`);
  }

  archiveJob(jobId: string) {
    return this.api.patch(`/api/jobs/${jobId}/archive`);
  }
}
