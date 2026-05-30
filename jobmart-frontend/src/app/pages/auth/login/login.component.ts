import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services';
import { AuthSignalStore } from '../../../store/auth.signal';
import { UISignalStore } from '../../../store/ui.signal';
import { User } from '../../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
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

    this.authService.login(this.form.value as any)
      .then((response) => {
        const authData = response.data;
        const user: User = {
          id: authData.userId,
          fullName: 'User',
          email: this.form.get('email')?.value || '',
          role: authData.role,
          verified: true,
          createdAt: new Date().toISOString(),
        };
        this.authStore.setAuth(authData, user);
        if (authData.role === 'JobSeeker') this.router.navigate(['/dashboard']);
        else if (authData.role === 'Recruiter') this.router.navigate(['/recruiter/dashboard']);
        else if (authData.role === 'Admin') this.router.navigate(['/admin/dashboard']);
        this.authStore.setLoading(false);
      })
      .catch((error) => {
        let msg = 'Login failed. Please try again.';
        if (error?.response?.status === 401 || error?.response?.status === 400)
          msg = 'Invalid email or password.';
        else if (error?.response?.data?.message)
          msg = error.response.data.message;
        this.authStore.setError(msg);
        this.authStore.setLoading(false);
      });
  }
}
