import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthSignalStore } from '../../../store/auth.signal';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recruiter-dashboard.component.html'
})
export class RecruiterDashboardComponent implements OnInit {
  jobs = signal<any[]>([]);
  loading = signal(true);
  activeJobs = signal(0);
  pointsBalance = signal(0);

  constructor(private jobService: JobService, private paymentService: PaymentService, readonly authStore: AuthSignalStore) {}

  ngOnInit() {
    this.jobService.getMyListings().then(res => {
      const d = res.data as any;
      const items = Array.isArray(d) ? d : (d?.items ?? []);
      this.jobs.set(items);
      this.activeJobs.set(items.filter((j: any) => j.status === 'Active').length);
    }).catch(() => {}).finally(() => this.loading.set(false));

    this.paymentService.getWallet().then(res => {
      const d = res.data as any;
      this.pointsBalance.set(d?.pointsBalance ?? d?.balance ?? 0);
    }).catch(() => {});
  }
}
