import { Component } from '@angular/core';

// Only truly stubbed component — not in scope for full implementation
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 class="text-2xl font-black text-gray-900 mb-2">Forgot Password</h1>
        <p class="text-gray-500">Password reset is not yet implemented.</p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {}
