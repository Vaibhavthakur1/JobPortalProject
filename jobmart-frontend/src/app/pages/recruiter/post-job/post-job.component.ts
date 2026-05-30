import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './post-job.component.html'
})
export class PostJobComponent {
  skills = signal<string[]>([]);
  submitting = signal(false);
  error = signal('');

  form = this.fb.group({
    title: ['', Validators.required], company: ['', Validators.required],
    location: ['', Validators.required], jobType: ['Full-time', Validators.required],
    industry: ['Technology', Validators.required], salaryMin: [null], salaryMax: [null],
    experienceYears: [0, Validators.required], description: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private jobService: JobService, private router: Router, private uiStore: UISignalStore) {}

  addSkill(s: string) { if (s.trim()) this.skills.update(sk => [...sk, s.trim()]); }
  removeSkill(i: number) { this.skills.update(sk => sk.filter((_, idx) => idx !== i)); }

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true); this.error.set('');
    const payload = { ...this.form.value, requiredSkills: this.skills() };
    this.jobService.createJob(payload as any).then(() => {
      this.uiStore.showToast('Job posted successfully!', 'success');
      this.router.navigate(['/recruiter/listings']);
    }).catch(e => this.error.set(e?.response?.data?.message || 'Failed to post job'))
    .finally(() => this.submitting.set(false));
  }
}
