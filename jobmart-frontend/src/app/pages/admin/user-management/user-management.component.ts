import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  users = signal<any[]>([]);
  filtered = signal<any[]>([]);
  loading = signal(true);
  page = signal(1);
  totalCount = signal(0);
  searchCtrl = new FormControl('');

  constructor(private adminService: AdminService, readonly uiStore: UISignalStore) {}

  ngOnInit() {
    this.load();
    this.searchCtrl.valueChanges.subscribe(q => this.applyFilter(q || ''));
  }

  load() {
    this.loading.set(true);
    this.adminService.getUsers(this.page(), 20).then(res => {
      const d = res.data as any;
      // Backend now returns { items: [], totalCount: number, page, pageSize, totalPages }
      const items = d?.items ?? (Array.isArray(d) ? d : []);
      this.users.set(items);
      this.totalCount.set(d?.totalCount ?? items.length);
      this.applyFilter(this.searchCtrl.value || '');
    }).catch(e => {
      console.error('Failed to load users', e);
    }).finally(() => this.loading.set(false));
  }

  applyFilter(q: string) {
    const lower = q.toLowerCase();
    this.filtered.set(q
      ? this.users().filter(u =>
          u.fullName?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower) ||
          u.role?.toLowerCase().includes(lower))
      : this.users());
  }

  changeRole(id: string, role: string) {
    this.adminService.changeUserRole(id, role)
      .then(() => {
        this.users.update(u => u.map(user => user.id === id ? { ...user, role } : user));
        this.applyFilter(this.searchCtrl.value || '');
      })
      .catch(() => {});
  }

  deactivate(id: string) {
    if (!confirm('Deactivate this user?')) return;
    this.adminService.deactivateUser(id).then(() => {
      this.users.update(u => u.filter(user => user.id !== id));
      this.applyFilter(this.searchCtrl.value || '');
    }).catch(() => {});
  }

  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage() { this.page.update(p => p + 1); this.load(); }
}
