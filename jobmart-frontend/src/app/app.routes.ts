import { Routes } from '@angular/router';
import { JobSeekerGuard, RecruiterGuard, AdminGuard } from './guards/auth.guard';
import { LandingComponent } from './pages/landing/landing.component';

// Auth pages
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { VerifyOtpComponent } from './pages/auth/verify-otp/verify-otp.component';

// Stub (forgot-password only — not in scope)
import { ForgotPasswordComponent } from './pages/stub-components';

// JobSeeker pages
import { DashboardComponent } from './pages/jobseeker/dashboard/dashboard.component';
import { JobSearchComponent } from './pages/jobseeker/job-search/job-search.component';
import { JobDetailComponent } from './pages/jobseeker/job-detail/job-detail.component';
import { MyApplicationsComponent } from './pages/jobseeker/my-applications/my-applications.component';
import { ApplicationDetailComponent } from './pages/jobseeker/application-detail/application-detail.component';
import { ResumeBuilderComponent } from './pages/jobseeker/resume-builder/resume-builder.component';
import { ResumeEditorComponent } from './pages/jobseeker/resume-editor/resume-editor.component';
import { ProfileComponent } from './pages/jobseeker/profile/profile.component';

// Recruiter pages
import { RecruiterDashboardComponent } from './pages/recruiter/dashboard/recruiter-dashboard.component';
import { CompanyProfileComponent } from './pages/recruiter/company-profile/company-profile.component';
import { PostJobComponent } from './pages/recruiter/post-job/post-job.component';
import { MyListingsComponent } from './pages/recruiter/my-listings/my-listings.component';
import { ApplicantsPipelineComponent } from './pages/recruiter/pipeline/pipeline.component';
import { WalletComponent } from './pages/recruiter/wallet/wallet.component';

// Admin pages
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { FlaggedJobsComponent } from './pages/admin/flagged-jobs/flagged-jobs.component';
import { AuditLogsComponent } from './pages/admin/audit-logs/audit-logs.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // JobSeeker
  { path: 'dashboard', canActivate: [JobSeekerGuard], component: DashboardComponent },
  { path: 'jobs', canActivate: [JobSeekerGuard], component: JobSearchComponent },
  { path: 'jobs/:id', canActivate: [JobSeekerGuard], component: JobDetailComponent },
  { path: 'my-applications', canActivate: [JobSeekerGuard], component: MyApplicationsComponent },
  { path: 'applications/:id', canActivate: [JobSeekerGuard], component: ApplicationDetailComponent },
  { path: 'resumes', canActivate: [JobSeekerGuard], component: ResumeBuilderComponent },
  { path: 'resumes/:id', canActivate: [JobSeekerGuard], component: ResumeEditorComponent },
  { path: 'profile', canActivate: [JobSeekerGuard], component: ProfileComponent },

  // Recruiter
  { path: 'recruiter/dashboard', canActivate: [RecruiterGuard], component: RecruiterDashboardComponent },
  { path: 'recruiter/profile', canActivate: [RecruiterGuard], component: CompanyProfileComponent },
  { path: 'recruiter/post-job', canActivate: [RecruiterGuard], component: PostJobComponent },
  { path: 'recruiter/listings', canActivate: [RecruiterGuard], component: MyListingsComponent },
  { path: 'recruiter/pipeline/:jobId', canActivate: [RecruiterGuard], component: ApplicantsPipelineComponent },
  { path: 'recruiter/wallet', canActivate: [RecruiterGuard], component: WalletComponent },

  // Admin
  { path: 'admin/dashboard', canActivate: [AdminGuard], component: AdminDashboardComponent },
  { path: 'admin/users', canActivate: [AdminGuard], component: UserManagementComponent },
  { path: 'admin/flagged-jobs', canActivate: [AdminGuard], component: FlaggedJobsComponent },
  { path: 'admin/audit-logs', canActivate: [AdminGuard], component: AuditLogsComponent },

  { path: '**', redirectTo: '/login' },
];
