import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../services';
import { AuthSignalStore } from '../../../store/auth.signal';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './verify-otp.component.html',
})
export class VerifyOtpComponent {
  email = '';
  form = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    readonly authStore: AuthSignalStore,
    readonly uiStore: UISignalStore,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.email) return;

    this.authStore.setLoading(true);
    this.authStore.setError(null);

    this.authService
      .verifyEmailOtp({
        email: this.email,
        otp: this.form.get('otp')?.value,
      } as any)
      .then(() => {
        this.uiStore.showToast('Email verified! Please login.', 'success');
        this.authStore.setLoading(false);
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('OTP verification error:', error);

        let errorMsg = 'Verification failed. Please try again.';

        if (error?.response?.status === 400) {
          errorMsg = 'Invalid OTP. Please check and try again.';
        } else if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error?.message === 'timeout of 10000ms exceeded') {
          errorMsg =
            'Request timeout. The server is taking too long to respond. Please try again.';
        } else if (error?.code === 'ECONNREFUSED') {
          errorMsg = 'Cannot connect to the server. Please check if the backend is running.';
        } else if (error?.message) {
          errorMsg = error.message;
        }

        this.authStore.setError(errorMsg);
        this.uiStore.showToast(errorMsg, 'error');
        this.authStore.setLoading(false);
      });

    // Fallback timeout
    setTimeout(() => {
      if (this.authStore.isLoading()) {
        console.warn('OTP verification timeout');
        this.authStore.setLoading(false);
        this.authStore.setError('Request took too long. Please try again.');
        this.uiStore.showToast('Request timeout. Please try again.', 'error');
      }
    }, 15000);
  }

  resendOtp() {
    this.authService
      .resendOtp({ email: this.email, purpose: 'EmailVerification' })
      .then(() => {
        this.uiStore.showToast('OTP resent to your email.', 'info');
      })
      .catch((error) => {
        console.error('Resend OTP error:', error);

        let errorMsg = 'Failed to resend OTP.';

        if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error?.message === 'timeout of 10000ms exceeded') {
          errorMsg = 'Request timeout. Please try again.';
        } else if (error?.message) {
          errorMsg = error.message;
        }

        this.uiStore.showToast(errorMsg, 'error');
      });
  }
}
