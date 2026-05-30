import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { RecruiterProfile, Pipeline, CandidateResumeView } from '../models';
import { AuthSignalStore } from '../store/auth.signal';

@Injectable({ providedIn: 'root' })
export class RecruiterService {
  private api: AxiosInstance;

  constructor(private authStore: AuthSignalStore) {
    this.api = axios.create({ baseURL: environment.apiBaseUrls.recruiter });
    this.api.interceptors.request.use((config) => {
      const token = this.authStore.accessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  getProfile() {
    return this.api.get<RecruiterProfile>('/api/recruiter/profile');
  }

  createProfile(data: { companyName: string; companyDescription: string; industry: string; website: string; location: string }) {
    return this.api.post<RecruiterProfile>('/api/recruiter/profile', data);
  }

  updateProfile(data: { companyName?: string; companyDescription?: string; industry?: string; website?: string; location?: string }) {
    return this.api.put<RecruiterProfile>('/api/recruiter/profile', data);
  }

  getPipeline(jobId: string, stage?: string) {
    return this.api.get<Pipeline[]>(`/api/recruiter/pipeline/${jobId}`, { params: stage ? { stage } : {} });
  }

  updatePipelineStage(pipelineId: string, stage: string, notes?: string) {
    return this.api.patch<Pipeline>(`/api/recruiter/pipeline/${pipelineId}/stage`, { stage, notes });
  }

  viewResume(pipelineId: string) {
    return this.api.post<CandidateResumeView>(`/api/recruiter/pipeline/${pipelineId}/view-resume`);
  }

  getResumeFile(pipelineId: string) {
    return this.api.get(`/api/recruiter/pipeline/${pipelineId}/resume-file`, { responseType: 'blob' });
  }
}
