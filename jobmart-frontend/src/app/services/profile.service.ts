import { Injectable } from '@angular/core';
import { JobSeekerProfile } from '../models';
import { AuthSignalStore } from '../store/auth.signal';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private authStore: AuthSignalStore) {}

  private get profileKey(): string {
    const userId = this.authStore.user()?.id;
    if (!userId) throw new Error('User not authenticated');
    return `jobseeker_profile_${userId}`;
  }

  async getProfile(): Promise<JobSeekerProfile | null> {
    try {
      const raw = localStorage.getItem(this.profileKey);
      if (!raw) return null;
      return JSON.parse(raw) as JobSeekerProfile;
    } catch {
      return null;
    }
  }

  async saveProfile(data: JobSeekerProfile): Promise<JobSeekerProfile> {
    localStorage.setItem(this.profileKey, JSON.stringify(data));
    return data;
  }

  async isProfileComplete(): Promise<boolean> {
    const profile = await this.getProfile();
    if (!profile) return false;
    return !!(
      profile.preferredLocation &&
      profile.preferredRole &&
      profile.jobType &&
      profile.email &&
      profile.contactNumber
    );
  }
}
