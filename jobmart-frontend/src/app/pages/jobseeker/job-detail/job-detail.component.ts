import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { ApplicationService } from '../../../services/application.service';
import { ResumeService } from '../../../services/resume.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './job-detail.component.html'
})
export class JobDetailComponent implements OnInit {
  job = signal<any>(null);
  resumes = signal<any[]>([]);
  builtResumes = computed(() => this.resumes().filter(r => r.resumeType !== 'Uploaded'));
  uploadedResumes = computed(() => this.resumes().filter(r => r.resumeType === 'Uploaded'));
  loading = signal(true);
  showApplyModal = signal(false);
  applying = signal(false);
  applyError = signal('');

  applyForm = this.fb.group({ resumeId: ['', Validators.required], coverLetter: [''] });

  constructor(private route: ActivatedRoute, private jobService: JobService, private appService: ApplicationService, private resumeService: ResumeService, private fb: FormBuilder, private uiStore: UISignalStore) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.jobService.getJobDetail(id).then(res => this.job.set(res.data)).catch(() => {}).finally(() => this.loading.set(false));
    this.resumeService.getMyResumes().then(res => { const d = res.data as any; this.resumes.set(Array.isArray(d) ? d : (d?.items ?? [])); }).catch(() => {});
  }

  apply() {
    if (this.applyForm.invalid) return;
    this.applying.set(true); this.applyError.set('');
    const payload = {
      jobId: this.job().id,
      recruiterId: this.job().recruiterId,   // required by backend for RabbitMQ routing
      resumeId: this.applyForm.value.resumeId,
      coverLetter: this.applyForm.value.coverLetter,
    };
    this.appService.createApplication(payload as any)
      .then(() => {
        this.showApplyModal.set(false);
        this.uiStore.showToast('Application submitted!', 'success');
      })
      .catch(e => {
        const msg = e?.response?.data?.message || 'Failed to apply';
        // 409 = already applied
        if (e?.response?.status === 409) {
          this.applyError.set(msg);
        } else {
          this.applyError.set(msg);
        }
      })
      .finally(() => this.applying.set(false));
  }
}
