import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecruiterService } from '../../../services/recruiter.service';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './company-profile.component.html'
})
export class CompanyProfileComponent implements OnInit {
  loading = signal(true);
  submitting = signal(false);
  isEditMode = signal(false);
  error = signal('');
  success = signal(false);

  form = this.fb.group({
    companyName: ['', Validators.required],
    companyDescription: ['', Validators.required],
    industry: ['', Validators.required],
    website: [''],
    location: ['', Validators.required],
  });

  constructor(
    private recruiterService: RecruiterService,
    private fb: FormBuilder,
    private uiStore: UISignalStore,
  ) {}

  ngOnInit() {
    this.recruiterService.getProfile()
      .then(res => {
        const p = res.data;
        this.isEditMode.set(true);
        this.form.patchValue({
          companyName: p.companyName,
          companyDescription: p.companyDescription || '',
          industry: p.industry,
          website: p.website,
          location: p.location,
        });
      })
      .catch(e => {
        if (e?.response?.status === 404) {
          this.isEditMode.set(false);
        }
      })
      .finally(() => this.loading.set(false));
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    this.success.set(false);

    const data = this.form.value as any;
    const call = this.isEditMode()
      ? this.recruiterService.updateProfile(data)
      : this.recruiterService.createProfile(data);

    call
      .then(() => {
        this.success.set(true);
        this.isEditMode.set(true);
        this.uiStore.showToast('Company profile saved!', 'success');
      })
      .catch(e => this.error.set(e?.response?.data?.message || 'Failed to save profile.'))
      .finally(() => this.submitting.set(false));
  }
}
