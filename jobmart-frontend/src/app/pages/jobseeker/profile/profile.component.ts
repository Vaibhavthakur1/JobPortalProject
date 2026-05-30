import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { AuthSignalStore } from '../../../store/auth.signal';
import { UISignalStore } from '../../../store/ui.signal';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  loading = signal(true);
  submitting = signal(false);
  success = signal(false);
  error = signal('');
  newSkill = '';

  skills = signal<string[]>([]);

  jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  noticePeriodOptions = ['Immediate', '15 days', '30 days', '60 days', '90 days', '3+ months'];
  experienceOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];

  form: FormGroup;

  constructor(
    private profileService: ProfileService,
    readonly authStore: AuthSignalStore,
    readonly uiStore: UISignalStore,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      preferredLocation: ['', Validators.required],
      preferredRole: ['', Validators.required],
      jobType: ['', Validators.required],
      isCurrentlyWorking: [false],
      noticePeriod: ['Immediate'],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{7,15}$/)]],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      bio: [''],
    });
  }

  ngOnInit() {
    this.profileService.getProfile().then(profile => {
      if (profile) {
        this.form.patchValue({
          preferredLocation: profile.preferredLocation || '',
          preferredRole: profile.preferredRole || '',
          jobType: profile.jobType || '',
          isCurrentlyWorking: profile.isCurrentlyWorking || false,
          noticePeriod: profile.noticePeriod || 'Immediate',
          email: profile.email || '',
          contactNumber: profile.contactNumber || '',
          experienceYears: profile.experienceYears || 0,
          bio: profile.bio || '',
        });
        this.skills.set(profile.skills || []);
      } else {
        // Pre-fill email from auth store
        const user = this.authStore.user();
        if (user?.email) {
          this.form.patchValue({ email: user.email });
        }
      }
    }).finally(() => this.loading.set(false));
  }

  get isCurrentlyWorking(): boolean {
    return this.form.get('isCurrentlyWorking')?.value || false;
  }

  addSkill(event: Event) {
    event.preventDefault();
    const input = (event.target as HTMLFormElement)?.querySelector?.('input') ||
                  document.getElementById('skill-input') as HTMLInputElement;
    if (!input) return;

    const val = input.value.trim();
    if (val && !this.skills().includes(val)) {
      this.skills.update(s => [...s, val]);
      input.value = '';
    }
  }

  addSkillFromInput(input: HTMLInputElement) {
    const val = input.value.trim();
    if (val && !this.skills().includes(val)) {
      this.skills.update(s => [...s, val]);
      input.value = '';
    }
  }

  removeSkill(skill: string) {
    this.skills.update(s => s.filter(sk => sk !== skill));
  }

  onSkillKeydown(event: KeyboardEvent, input: HTMLInputElement) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSkillFromInput(input);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set('');
    this.success.set(false);

    const formVal = this.form.value;
    const profileData = {
      ...formVal,
      skills: this.skills(),
      noticePeriod: formVal.isCurrentlyWorking ? formVal.noticePeriod : 'Immediate',
    };

    this.profileService.saveProfile(profileData)
      .then(() => {
        this.success.set(true);
        this.uiStore.showToast('Profile saved successfully!', 'success');
        // Auto-dismiss success message
        setTimeout(() => this.success.set(false), 4000);
      })
      .catch(e => this.error.set('Failed to save profile. Please try again.'))
      .finally(() => this.submitting.set(false));
  }

  getAvatarUrl(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=ffffff&bold=true&size=128`;
  }

  getCompletionPercentage(): number {
    let total = 0;
    let filled = 0;
    const checks = [
      this.form.get('preferredLocation')?.value,
      this.form.get('preferredRole')?.value,
      this.form.get('jobType')?.value,
      this.form.get('email')?.value,
      this.form.get('contactNumber')?.value,
      this.form.get('bio')?.value,
      this.skills().length > 0,
    ];
    total = checks.length;
    filled = checks.filter(Boolean).length;
    return Math.round((filled / total) * 100);
  }
}
