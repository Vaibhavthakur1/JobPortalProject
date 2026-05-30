import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-job-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './job-search.component.html'
})
export class JobSearchComponent implements OnInit {
  jobs = signal<any[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);

  searchForm = this.fb.group({ keyword: [''], location: [''], jobType: [''], industry: [''], minSalary: [null], maxSalary: [null], minExperience: [null] });

  constructor(private jobService: JobService, private fb: FormBuilder) {}

  ngOnInit() { this.search(); }

  search() {
    this.loading.set(true);
    const params = { ...this.searchForm.value, page: this.currentPage(), pageSize: 12 };
    this.jobService.searchJobs(params as any).then(res => {
      const data = res.data as any;
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      this.jobs.set(items);
      this.totalCount.set(data?.totalCount ?? items.length);
      this.totalPages.set(Math.ceil((data?.totalCount ?? items.length) / 12) || 1);
    }).catch(() => {}).finally(() => this.loading.set(false));
  }

  prevPage() { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.search(); } }
  nextPage() { if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.search(); } }
}
