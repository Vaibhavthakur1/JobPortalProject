import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services';
import { AuthSignalStore } from '../../../store/auth.signal';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  showPassword = false;

  form = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['JobSeeker', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    readonly authStore: AuthSignalStore,
    readonly uiStore: UISignalStore,
    private router: Router,
  ) {}

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.authStore.setLoading(true);
    this.authStore.setError(null);

    this.authService.register(this.form.value as any)
      .then(() => {
        this.uiStore.showToast(
          'Registration successful! Please verify your email.',
          'success',
        );
        this.authStore.setLoading(false);
        this.router.navigate(['/verify-otp'], {
          queryParams: { email: this.form.get('email')?.value },
        });
      })
      .catch((error) => {
        console.error('Registration error:', error);
        
        let errorMsg = 'Registration failed. Please try again.';
        
        // Handle different error types
        if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error?.message === 'timeout of 10000ms exceeded') {
          errorMsg = 'Request timeout. The server is taking too long to respond. Please check if the backend is running.';
        } else if (error?.code === 'ECONNREFUSED') {
          errorMsg = 'Cannot connect to the server. Make sure the backend is running on http://localhost:5001';
        } else if (error?.code === 'ENOTFOUND') {
          errorMsg = 'Server not found. Please verify the server address.';
        } else if (error?.message) {
          errorMsg = error.message;
        }
        
        this.authStore.setError(errorMsg);
        this.uiStore.showToast(errorMsg, 'error');
        this.authStore.setLoading(false);
      });

    // Fallback timeout in case something goes wrong
    setTimeout(() => {
      if (this.authStore.isLoading()) {
        console.warn('Registration request timed out');
        this.authStore.setLoading(false);
        this.authStore.setError('Request took too long. Please try again.');
        this.uiStore.showToast('Request timeout. Please try again.', 'error');
      }
    }, 15000); // 15 seconds total timeout
  }
}
