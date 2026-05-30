import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  step = 1;
  loading = false;
  error = '';

  emailForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  resetForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private uiStore: UISignalStore) {}

  sendOtp() {
    if (this.emailForm.invalid) return;
    this.loading = true; this.error = '';
    this.authService.forgotPassword(this.emailForm.get('email')!.value!)
      .then(() => { this.step = 2; this.uiStore.showToast('OTP sent to your email', 'success'); })
      .catch(e => { this.error = e?.response?.data?.message || 'Failed to send OTP'; })
      .finally(() => this.loading = false);
  }

  resetPassword() {
    if (this.resetForm.invalid) return;
    this.loading = true; this.error = '';
    const { otp, newPassword } = this.resetForm.value;
    this.authService.resetPasswordOtp(this.emailForm.get('email')!.value!, otp!, newPassword!)
      .then(() => { this.uiStore.showToast('Password reset! Please login.', 'success'); this.router.navigate(['/login']); })
      .catch(e => { this.error = e?.response?.data?.message || 'Invalid OTP or expired'; })
      .finally(() => this.loading = false);
  }
}
