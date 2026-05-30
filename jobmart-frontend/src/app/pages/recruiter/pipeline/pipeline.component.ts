import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RecruiterService } from '../../../services/recruiter.service';
import { ApplicationService } from '../../../services/application.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pipeline.component.html',
})
export class ApplicantsPipelineComponent implements OnInit {
  pipeline = signal<any[]>([]);
  loading = signal(true);
  stageFilter = signal('All');
  loadingResume = signal<Record<string, boolean>>({});
  filtered = signal<any[]>([]);
  activeResume = signal<any>(null);
  pdfUrl = signal<SafeResourceUrl | null>(null);
  private _rawPdfUrl: string | null = null;
  jobId = '';

  stages = ['All', 'New', 'Shortlisted', 'Contacted', 'Rejected'];
  pipelineStages = ['New', 'Shortlisted', 'Contacted', 'Rejected'];

  constructor(
    private route: ActivatedRoute,
    private recruiterService: RecruiterService,
    private appService: ApplicationService,
    private uiStore: UISignalStore,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.jobId = this.route.snapshot.paramMap.get('jobId')!;
    this.loadPipeline();
  }

  loadPipeline() {
    this.loading.set(true);
    this.recruiterService.getPipeline(this.jobId)
      .then(res => {
        const d = res.data as any;
        this.pipeline.set(Array.isArray(d) ? d : (d?.items ?? []));
        this.updateFiltered();
      })
      .catch(() => this.uiStore.showToast('Failed to load pipeline', 'error'))
      .finally(() => this.loading.set(false));
  }

  setFilter(s: string) {
    this.stageFilter.set(s);
    this.updateFiltered();
  }

  updateFiltered() {
    const s = this.stageFilter();
    this.filtered.set(s === 'All' ? this.pipeline() : this.pipeline().filter(e => e.stage === s));
  }

  updateStage(id: string, stage: string) {
    if (!stage) return;
    this.recruiterService.updatePipelineStage(id, stage)
      .then(() => {
        this.pipeline.update(p => p.map(e => e.id === id ? { ...e, stage } : e));
        this.updateFiltered();
        this.uiStore.showToast('Stage updated', 'success');
      })
      .catch(e => this.uiStore.showToast(e?.response?.data?.message || 'Failed to update stage', 'error'));
  }

  viewResume(entry: any) {
    this.loadingResume.update(v => ({ ...v, [entry.id]: true }));
    this.recruiterService.viewResume(entry.id)
      .then(res => {
        const data = res.data as any;
        this.activeResume.set(data);
        this.pdfUrl.set(null);
        if (this._rawPdfUrl) { URL.revokeObjectURL(this._rawPdfUrl); this._rawPdfUrl = null; }

        if (data?.resumeType === 'Uploaded') {
          this.recruiterService.getResumeFile(entry.id)
            .then(fileRes => {
              const blob = new Blob([fileRes.data as any], { type: 'application/pdf' });
              this._rawPdfUrl = URL.createObjectURL(blob);
              this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this._rawPdfUrl));
            })
            .catch(() => this.uiStore.showToast('Failed to load PDF', 'error'));
        }

        // Update pipeline entry to reflect access is now active
        this.pipeline.update(p => p.map(e =>
          e.id === entry.id ? { ...e, resumeViewed: true, isResumeAccessActive: true } : e
        ));
        this.updateFiltered();

        if (!entry.isResumeAccessActive) {
          this.uiStore.showToast('10 points deducted — resume access granted for 30 days', 'success');
        }
      })
      .catch(e => this.uiStore.showToast(e?.response?.data?.message || 'Failed to load resume', 'error'))
      .finally(() => this.loadingResume.update(v => ({ ...v, [entry.id]: false })));
  }

  downloadPdf() {
    if (!this._rawPdfUrl) return;
    const name = this.activeResume()?.uploadedFileName || 'resume.pdf';
    const a = document.createElement('a');
    a.href = this._rawPdfUrl; a.download = name; a.click();
  }

  hasResumeData(): boolean {
    const r = this.activeResume();
    if (!r) return false;
    if (r.resumeType === 'Uploaded') return true;
    return (r.fullName && r.fullName !== 'N/A')
      || r.summary
      || r.skills?.length > 0
      || r.experiences?.length > 0
      || r.educations?.length > 0
      || r.email || r.phone;
  }

  closeResume(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('fixed')) this.closeModal();
  }

  closeModal() {
    this.activeResume.set(null);
    this.pdfUrl.set(null);
    if (this._rawPdfUrl) { URL.revokeObjectURL(this._rawPdfUrl); this._rawPdfUrl = null; }
  }

  updateAppStatus(applicationId: string, status: string, selectEl: HTMLSelectElement) {
    if (!status || !applicationId) return;
    this.appService.updateApplicationStatus(applicationId, status)
      .then(() => {
        this.uiStore.showToast(`Application moved to ${status}`, 'success');
        selectEl.value = '';
      })
      .catch(e => {
        this.uiStore.showToast(e?.response?.data?.message || 'Status update failed', 'error');
        selectEl.value = '';
      });
  }

  getStageClass(stage: string): string {
    const map: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-700',
      'Shortlisted': 'bg-indigo-100 text-indigo-700',
      'Contacted': 'bg-yellow-100 text-yellow-700',
      'Rejected': 'bg-red-100 text-red-700',
    };
    return map[stage] || 'bg-gray-100 text-gray-500';
  }
}
