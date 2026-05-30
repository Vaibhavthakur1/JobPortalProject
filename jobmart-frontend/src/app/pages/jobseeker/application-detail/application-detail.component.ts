import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { UISignalStore } from '../../../store/ui.signal';
import { Application } from '../../../models';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './application-detail.component.html'
})
export class ApplicationDetailComponent implements OnInit {
  app = signal<Application | null>(null);
  loading = signal(true);
  error = signal('');
  withdrawing = signal(false);

  constructor(
    private route: ActivatedRoute,
    private appService: ApplicationService,
    private uiStore: UISignalStore,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.appService.getApplicationDetail(id)
      .then(res => this.app.set(res.data))
      .catch(() => this.error.set('Failed to load application details.'))
      .finally(() => this.loading.set(false));
  }

  withdraw() {
    if (!this.app()) return;
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    this.withdrawing.set(true);
    this.appService.withdrawApplication(this.app()!.id)
      .then(() => {
        this.app.update(a => a ? { ...a, isWithdrawn: true, status: 'Withdrawn' } : a);
        this.uiStore.showToast('Application withdrawn', 'info');
      })
      .catch(e => this.uiStore.showToast(e?.response?.data?.message || 'Failed to withdraw', 'error'))
      .finally(() => this.withdrawing.set(false));
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Submitted': 'bg-blue-100 text-blue-700',
      'Screening': 'bg-yellow-100 text-yellow-700',
      'Interview': 'bg-purple-100 text-purple-700',
      'Offered': 'bg-green-100 text-green-700',
      'Accepted': 'bg-emerald-100 text-emerald-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Withdrawn': 'bg-gray-100 text-gray-500',
      'Draft': 'bg-gray-100 text-gray-500',
    };
    return map[status] || 'bg-gray-100 text-gray-500';
  }
}
