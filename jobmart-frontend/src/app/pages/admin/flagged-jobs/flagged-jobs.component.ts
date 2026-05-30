import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-flagged-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flagged-jobs.component.html',
})
export class FlaggedJobsComponent implements OnInit {
  flags = signal<any[]>([]);
  loading = signal(true);
  statusFilter = signal('Pending');
  statuses = ['Pending', 'Reviewed', 'Dismissed'];

  constructor(
    private adminService: AdminService,
    private uiStore: UISignalStore,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getFlaggedJobs(this.statusFilter(), 1, 50).then(res => {
      const d = res.data as any;
      this.flags.set(Array.isArray(d) ? d : (d?.items ?? []));
    }).catch(() => {}).finally(() => this.loading.set(false));
  }

  review(id: string, status: 'Reviewed' | 'Dismissed') {
    this.adminService.reviewFlaggedJob(id, status).then(() => {
      this.flags.update(f => f.filter(flag => flag.id !== id));
      this.uiStore.showToast(`Flag marked as ${status}`, 'success');
    }).catch(() => this.uiStore.showToast('Failed', 'error'));
  }
}
