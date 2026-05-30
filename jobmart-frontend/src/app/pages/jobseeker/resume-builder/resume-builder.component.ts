import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResumeService } from '../../../services/resume.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-resume-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './resume-builder.component.html'
})
export class ResumeBuilderComponent implements OnInit {
  resumes = signal<any[]>([]);
  loading = signal(true);
  showCreate = signal(false);
  showUpload = signal(false);
  currentStep = signal(0);
  skills = signal<string[]>([]);
  creating = signal(false);
  createError = signal('');
  // Upload state
  uploadFile = signal<File | null>(null);
  uploadTitle = '';
  uploading = signal(false);
  uploadError = signal('');
  steps = ['Basic Info', 'Personal', 'Skills', 'Preview'];
  templates = ['Classic', 'Modern', 'Creative', 'ATS-Friendly'];

  resumeForm = this.fb.group({
    title: ['', Validators.required],
    template: ['Classic', Validators.required],
    personal: this.fb.group({
      fullName: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required], location: ['', Validators.required],
      linkedInUrl: [''], gitHubUrl: [''], summary: ['']
    })
  });

  constructor(private resumeService: ResumeService, private fb: FormBuilder, private uiStore: UISignalStore) {}

  ngOnInit() {
    this.resumeService.getMyResumes().then(res => {
      const d = res.data as any;
      this.resumes.set(Array.isArray(d) ? d : (d?.items ?? []));
    }).catch(() => {}).finally(() => this.loading.set(false));
  }

  addSkill(skill: string) { if (skill.trim()) this.skills.update(s => [...s, skill.trim()]); }
  removeSkill(i: number) { this.skills.update(s => s.filter((_, idx) => idx !== i)); }
  isPastStep(i: number): boolean { return this.currentStep() > i; }
  prevStep() { this.currentStep.update(s => s - 1); }
  nextStep() { this.currentStep.update(s => s + 1); }

  createResume() {
    this.creating.set(true); this.createError.set('');
    const payload = {
      title: this.resumeForm.get('title')?.value,
      template: this.resumeForm.get('template')?.value,
      personal: this.resumeForm.get('personal')?.value,
      skills: this.skills(),
      educations: [], experiences: [], projects: []
    };
    this.resumeService.createResume(payload as any).then(res => {
      this.resumes.update(r => [...r, (res.data as any)]);
      this.showCreate.set(false); this.currentStep.set(0); this.skills.set([]);
      this.resumeForm.reset({ template: 'Classic' });
      this.uiStore.showToast('Resume created!', 'success');
    }).catch(e => this.createError.set(e?.response?.data?.message || 'Failed to create'))
    .finally(() => this.creating.set(false));
  }

  setDefault(id: string) {
    this.resumeService.setDefaultResume(id).then(() => {
      this.resumes.update(r => r.map(res => ({ ...res, isDefault: res.id === id })));
      this.uiStore.showToast('Default resume updated', 'success');
    }).catch(() => this.uiStore.showToast('Failed', 'error'));
  }

  download(r: any) {
    const call = r.resumeType === 'Uploaded'
      ? this.resumeService.downloadUploaded(r.id)
      : this.resumeService.downloadResume(r.id);
    const fileName = r.resumeType === 'Uploaded' ? (r.uploadedFileName || `resume_${r.id}`) : `resume_${r.id}.txt`;
    call.then(res => {
      const url = URL.createObjectURL(new Blob([res.data as any]));
      const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    }).catch(() => this.uiStore.showToast('Download failed', 'error'));
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.uploadFile.set(input.files[0]);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile.set(file);
  }

  submitUpload() {
    const file = this.uploadFile();
    if (!file) return;
    this.uploading.set(true);
    this.uploadError.set('');
    this.resumeService.uploadResume(this.uploadTitle || file.name.replace(/\.[^.]+$/, ''), file)
      .then(res => {
        this.resumes.update(r => [res.data, ...r]);
        this.showUpload.set(false);
        this.uploadFile.set(null);
        this.uploadTitle = '';
        this.uiStore.showToast('Resume uploaded!', 'success');
      })
      .catch(e => this.uploadError.set(e?.response?.data?.message || 'Upload failed. Check file type and size.'))
      .finally(() => this.uploading.set(false));
  }

  deleteResume(id: string) {
    if (!confirm('Delete this resume?')) return;
    this.resumeService.deleteResume(id).then(() => {
      this.resumes.update(r => r.filter(res => res.id !== id));
      this.uiStore.showToast('Resume deleted', 'info');
    }).catch(() => this.uiStore.showToast('Failed', 'error'));
  }
}
