import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-listings.component.html'
})
export class MyListingsComponent implements OnInit {
  jobs = signal<any[]>([]);
  loading = signal(true);

  constructor(private jobService: JobService, private uiStore: UISignalStore) {}

  ngOnInit() {
    this.jobService.getMyListings().then(res => {
      const d = res.data as any;
      this.jobs.set(Array.isArray(d) ? d : (d?.items ?? []));
    }).catch(() => {}).finally(() => this.loading.set(false));
  }

  closeJob(id: string) {
    this.jobService.closeJob(id).then(() => {
      this.jobs.update(j => j.map(job => job.id === id ? { ...job, status: 'Closed' } : job));
      this.uiStore.showToast('Job closed', 'info');
    }).catch(() => this.uiStore.showToast('Failed', 'error'));
  }

  archiveJob(id: string) {
    this.jobService.archiveJob(id).then(() => {
      this.jobs.update(j => j.map(job => job.id === id ? { ...job, status: 'Archived' } : job));
      this.uiStore.showToast('Job archived', 'info');
    }).catch(() => this.uiStore.showToast('Failed', 'error'));
  }
}
