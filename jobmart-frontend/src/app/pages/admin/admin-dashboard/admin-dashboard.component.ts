import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = signal(0);
  pendingFlags = signal(0);
  auditCount = signal(0);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getUsers(1, 1).then(res => {
      const d = res.data as any;
      // Backend now returns { items: [], totalCount: number, page, pageSize, totalPages }
      this.totalUsers.set(d?.totalCount ?? 0);
    }).catch(() => {});
    this.adminService.getFlaggedJobs('Pending', 1, 1).then(res => {
      const d = res.data as any;
      this.pendingFlags.set(d?.totalCount ?? (Array.isArray(d) ? d.length : 0));
    }).catch(() => {});
    this.adminService.getAuditLogs(undefined, undefined, 1, 1).then(res => {
      const d = res.data as any;
      this.auditCount.set(d?.totalCount ?? (Array.isArray(d) ? d.length : 0));
    }).catch(() => {});
  }
}
