import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-applications.component.html'
})
export class MyApplicationsComponent implements OnInit {
  applications = signal<any[]>([]);
  loading = signal(true);
  filterStatus = signal('All');
  withdrawTargetId = signal<string | null>(null);
  withdrawing = signal(false);

  statuses = ['All', 'Submitted', 'Screening', 'Interview', 'Offered', 'Accepted', 'Rejected', 'Withdrawn'];
  filtered = signal<any[]>([]);

  constructor(private appService: ApplicationService, private uiStore: UISignalStore) {}

  ngOnInit() {
    this.appService.getMyApplications().then(res => {
      const d = res.data as any;
      this.applications.set(Array.isArray(d) ? d : (d?.items ?? []));
      this.updateFiltered();
    }).catch(() => {}).finally(() => this.loading.set(false));
  }

  setFilter(s: string) {
    this.filterStatus.set(s);
    this.updateFiltered();
  }

  updateFiltered() {
    const s = this.filterStatus();
    this.filtered.set(s === 'All' ? this.applications() : this.applications().filter(a => a.status === s));
  }

  confirmWithdraw(id: string) {
    this.withdrawTargetId.set(id);
  }

  cancelWithdraw(event?: MouseEvent) {
    if (event && !(event.target as HTMLElement).classList.contains('fixed')) return;
    this.withdrawTargetId.set(null);
  }

  doWithdraw() {
    const id = this.withdrawTargetId();
    if (!id) return;
    this.withdrawing.set(true);
    this.appService.withdrawApplication(id)
      .then(() => {
        this.applications.update(apps => apps.map(a => a.id === id ? { ...a, status: 'Withdrawn' } : a));
        this.updateFiltered();
        this.uiStore.showToast('Application withdrawn', 'info');
        this.withdrawTargetId.set(null);
      })
      .catch(e => this.uiStore.showToast(e?.response?.data?.message || 'Failed to withdraw', 'error'))
      .finally(() => this.withdrawing.set(false));
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      'Submitted':  'bg-blue-100 text-blue-700',
      'Screening':  'bg-yellow-100 text-yellow-700',
      'Interview':  'bg-purple-100 text-purple-700',
      'Offered':    'bg-green-100 text-green-700',
      'Accepted':   'bg-emerald-100 text-emerald-700',
      'Rejected':   'bg-red-100 text-red-700',
      'Withdrawn':  'bg-gray-100 text-gray-500',
    };
    return map[status] || 'bg-gray-100 text-gray-500';
  }
}
