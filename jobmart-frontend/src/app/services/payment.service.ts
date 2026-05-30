import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { Wallet, Transaction } from '../models';
import { AuthSignalStore } from '../store/auth.signal';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api: AxiosInstance;

  constructor(private authStore: AuthSignalStore) {
    this.api = axios.create({ baseURL: environment.apiBaseUrls.payment });
    this.api.interceptors.request.use((config) => {
      const token = this.authStore.accessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  getWallet() {
    return this.api.get<Wallet>('/api/payment/wallet');
  }

  initiatePayment(points: number, currency = 'USD') {
    return this.api.post<{ orderId: string; amount: number; currency: string; gatewayKey: string }>(
      '/api/payment/initiate', { points, currency }
    );
  }

  confirmPayment(data: { points: number; amount: number; currency: string; paymentGatewayRef: string }) {
    return this.api.post<Wallet>('/api/payment/confirm', data);
  }

  cancelPayment(orderId: string, status: 'Cancelled' | 'Failed') {
    return this.api.post('/api/payment/cancel', { orderId, status });
  }

  getTransactions(page = 1, pageSize = 20) {
    return this.api.get<Transaction[]>('/api/payment/transactions', { params: { page, pageSize } });
  }
}
