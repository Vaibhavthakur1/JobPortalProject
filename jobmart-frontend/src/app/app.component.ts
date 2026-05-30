import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthSignalStore } from './store/auth.signal';
import { UISignalStore } from './store/ui.signal';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  isLanding = signal(false);

  constructor(
    readonly authStore: AuthSignalStore,
    readonly uiStore: UISignalStore,
    private router: Router,
  ) {}

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.isLanding.set(e.urlAfterRedirects === '/');
    });
    this.isLanding.set(this.router.url === '/');
  }
}
