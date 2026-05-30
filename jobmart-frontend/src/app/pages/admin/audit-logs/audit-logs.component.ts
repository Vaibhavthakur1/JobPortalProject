import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent implements OnInit {
  logs = signal<any[]>([]);
  loading = signal(true);
  page = signal(1);
  entityFilter = new FormControl('');

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getAuditLogs(undefined, this.entityFilter.value || undefined, this.page(), 50)
      .then(res => {
        const d = res.data as any;
        this.logs.set(Array.isArray(d) ? d : (d?.items ?? []));
      }).catch(() => {}).finally(() => this.loading.set(false));
  }

  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage() { this.page.update(p => p + 1); this.load(); }
}
