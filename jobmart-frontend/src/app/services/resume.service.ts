import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { Resume } from '../models';
import { AuthSignalStore } from '../store/auth.signal';

@Injectable({
  providedIn: 'root',
})
export class ResumeService {
  private api: AxiosInstance;

  constructor(private authStore: AuthSignalStore) {
    this.api = axios.create({
      baseURL: environment.apiBaseUrls.resumes,
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

  getMyResumes() {
    return this.api.get<Resume[]>('/api/resumes');
  }

  getResumeDetail(resumeId: string) {
    return this.api.get<Resume>(`/api/resumes/${resumeId}`);
  }

  createResume(data: Partial<Resume>) {
    return this.api.post<Resume>('/api/resumes', data);
  }

  updateResume(resumeId: string, data: Partial<Resume>) {
    return this.api.put<Resume>(`/api/resumes/${resumeId}`, data);
  }

  setDefaultResume(resumeId: string) {
    return this.api.patch(`/api/resumes/${resumeId}/set-default`);
  }

  downloadResume(resumeId: string) {
    return this.api.get(`/api/resumes/${resumeId}/export-pdf`, { responseType: 'blob' });
  }

  uploadResume(title: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    return this.api.post<any>('/api/resumes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  downloadUploaded(resumeId: string) {
    return this.api.get(`/api/resumes/${resumeId}/download-uploaded`, { responseType: 'blob' });
  }

  deleteResume(resumeId: string) {
    return this.api.delete(`/api/resumes/${resumeId}`);
  }
}
