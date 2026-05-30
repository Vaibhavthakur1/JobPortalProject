import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: environment.apiBaseUrls.auth,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      // Required so the browser sends the HttpOnly refresh token cookie
      withCredentials: true,
    });

    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        console.error('[AuthService] Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      },
    );
  }

  register(data: RegisterRequest) {
    return this.api.post<AuthResponse>('/api/auth/register', data);
  }

  verifyEmailOtp(data: VerifyOtpRequest) {
    return this.api.post<AuthResponse>('/api/auth/verify-email-otp', data);
  }

  resendOtp(data: ResendOtpRequest) {
    return this.api.post('/api/auth/resend-otp', data);
  }

  login(data: LoginRequest) {
    return this.api.post<AuthResponse>('/api/auth/login', data);
  }

  // No body needed — refresh token is sent automatically via HttpOnly cookie
  refreshToken() {
    return this.api.post<AuthResponse>('/api/auth/refresh');
  }

  forgotPassword(email: string) {
    return this.api.post('/api/auth/forgot-password', { email });
  }

  resetPasswordOtp(email: string, otp: string, newPassword: string) {
    return this.api.post('/api/auth/reset-password-otp', { email, otp, newPassword });
  }

  logout() {
    // Call backend to clear the HttpOnly cookie
    return this.api.post('/api/auth/logout').finally(() => {
      sessionStorage.removeItem('user');
      // Clean up any legacy localStorage entries
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    });
  }
}
