import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ResumeService } from '../../../services/resume.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-resume-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resume-editor.component.html'
})
export class ResumeEditorComponent implements OnInit {
  loading = signal(true);
  loadError = signal('');
  saving = signal(false);
  saveError = signal('');
  saveSuccess = signal(false);
  skills = signal<string[]>([]);
  templates = ['Classic', 'Modern', 'Creative', 'ATS-Friendly'];
  resumeId = '';

  form = this.fb.group({
    title: ['', Validators.required],
    template: ['Classic'],
    personal: this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: ['', Validators.required],
      linkedInUrl: [''],
      gitHubUrl: [''],
      summary: [''],
    }),
    educations: this.fb.array([]),
    experiences: this.fb.array([]),
    projects: this.fb.array([]),
  });

  get educationsArray() { return this.form.get('educations') as FormArray; }
  get experiencesArray() { return this.form.get('experiences') as FormArray; }
  get projectsArray() { return this.form.get('projects') as FormArray; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resumeService: ResumeService,
    private fb: FormBuilder,
    private uiStore: UISignalStore,
  ) {}

  ngOnInit() {
    this.resumeId = this.route.snapshot.paramMap.get('id')!;
    this.resumeService.getResumeDetail(this.resumeId)
      .then(res => {
        const r = res.data;
        this.form.patchValue({ title: r.title, template: r.template, personal: r.personal as any });
        this.skills.set(r.skills || []);
        (r.educations || []).forEach(e => this.educationsArray.push(this.makeEducationGroup(e)));
        (r.experiences || []).forEach(e => this.experiencesArray.push(this.makeExperienceGroup(e)));
        (r.projects || []).forEach(p => this.projectsArray.push(this.makeProjectGroup(p)));
      })
      .catch(() => this.loadError.set('Failed to load resume.'))
      .finally(() => this.loading.set(false));
  }

  makeEducationGroup(e?: any): FormGroup {
    return this.fb.group({
      institution: [e?.institution || ''],
      degree: [e?.degree || ''],
      fieldOfStudy: [e?.fieldOfStudy || ''],
      startDate: [e?.startDate ? e.startDate.slice(0, 10) : ''],
      endDate: [e?.endDate ? e.endDate.slice(0, 10) : ''],
      isCurrent: [e?.isCurrent || false],
      grade: [e?.grade || ''],
    });
  }

  makeExperienceGroup(e?: any): FormGroup {
    return this.fb.group({
      company: [e?.company || ''],
      jobTitle: [e?.jobTitle || ''],
      location: [e?.location || ''],
      startDate: [e?.startDate ? e.startDate.slice(0, 10) : ''],
      endDate: [e?.endDate ? e.endDate.slice(0, 10) : ''],
      isCurrent: [e?.isCurrent || false],
      description: [e?.description || ''],
    });
  }

  makeProjectGroup(p?: any): FormGroup {
    return this.fb.group({
      name: [p?.name || ''],
      description: [p?.description || ''],
      url: [p?.url || ''],
      technologiesStr: [(p?.technologies || []).join(', ')],
    });
  }

  addSkill(s: string) { if (s.trim()) this.skills.update(sk => [...sk, s.trim()]); }
  removeSkill(i: number) { this.skills.update(sk => sk.filter((_, idx) => idx !== i)); }
  addEducation() { this.educationsArray.push(this.makeEducationGroup()); }
  removeEducation(i: number) { this.educationsArray.removeAt(i); }
  addExperience() { this.experiencesArray.push(this.makeExperienceGroup()); }
  removeExperience(i: number) { this.experiencesArray.removeAt(i); }
  addProject() { this.projectsArray.push(this.makeProjectGroup()); }
  removeProject(i: number) { this.projectsArray.removeAt(i); }

  save() {
    this.saving.set(true);
    this.saveError.set('');
    this.saveSuccess.set(false);

    const v = this.form.value;
    const payload = {
      title: v.title,
      template: v.template,
      personal: v.personal,
      skills: this.skills(),
      educations: (v.educations as any[]).map(e => ({ ...e, endDate: e.endDate || null })),
      experiences: (v.experiences as any[]).map(e => ({ ...e, endDate: e.endDate || null })),
      projects: (v.projects as any[]).map(p => ({
        name: p.name, description: p.description, url: p.url || null,
        technologies: p.technologiesStr ? p.technologiesStr.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      })),
    };

    this.resumeService.updateResume(this.resumeId, payload as any)
      .then(() => {
        this.saveSuccess.set(true);
        this.uiStore.showToast('Resume updated!', 'success');
        setTimeout(() => this.router.navigate(['/resumes']), 1200);
      })
      .catch(e => this.saveError.set(e?.response?.data?.message || 'Failed to save resume.'))
      .finally(() => this.saving.set(false));
  }
}
