import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { ProfileService } from '../../../services/profile.service';
import { AuthSignalStore } from '../../../store/auth.signal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  applications = signal<any[]>([]);
  loading = signal(true);
  inProgressCount = signal(0);
  offersCount = signal(0);
  profileComplete = signal(false);

  constructor(
    private appService: ApplicationService,
    private profileService: ProfileService,
    readonly authStore: AuthSignalStore,
  ) {}

  ngOnInit() {
    // Load applications
    this.appService.getMyApplications().then(res => {
      const data = res.data as any;
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      this.applications.set(items);
      this.inProgressCount.set(items.filter((a: any) => ['Screening','Interview'].includes(a.status)).length);
      this.offersCount.set(items.filter((a: any) => ['Offered','Accepted'].includes(a.status)).length);
    }).catch(() => {}).finally(() => this.loading.set(false));

    // Check profile completion
    this.profileService.isProfileComplete().then(complete => {
      this.profileComplete.set(complete);
    });
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      'Submitted': 'bg-blue-100 text-blue-700',
      'Screening': 'bg-yellow-100 text-yellow-700',
      'Interview': 'bg-purple-100 text-purple-700',
      'Offered': 'bg-green-100 text-green-700',
      'Accepted': 'bg-emerald-100 text-emerald-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Withdrawn': 'bg-gray-100 text-gray-500'
    };
    return map[status] || 'bg-gray-100 text-gray-500';
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
