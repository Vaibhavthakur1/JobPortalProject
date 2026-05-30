import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthService } from './app/services/auth.service';
import { AuthSignalStore } from './app/store/auth.signal';
import { User } from './app/models';

function initAuth(authService: AuthService, authStore: AuthSignalStore) {
  return () =>
    authService.refreshToken()
      .then(res => {
        const data = res.data as any;
        const user: User = {
          id:        data.userId,
          fullName:  data.fullName || authStore.user()?.fullName || 'User',
          email:     authStore.user()?.email || '',
          role:      data.role,
          verified:  true,
          createdAt: new Date().toISOString(),
        };
        authStore.setAuth(data, user);
      })
      .catch(() => {
        authStore.clearAuth();
      })
      .finally(() => {
        authStore.markInitialized();
      });
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService, AuthSignalStore],
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
