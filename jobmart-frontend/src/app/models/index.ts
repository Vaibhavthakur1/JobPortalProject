// ─── Auth Models ────────────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  role: 'JobSeeker' | 'Recruiter' | 'Admin';
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'JobSeeker' | 'Recruiter';
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
  purpose: string;
}

// ─── User Model ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'JobSeeker' | 'Recruiter' | 'Admin';
  verified: boolean;
  createdAt: string;
}

// ─── Job Seeker Profile Model ───────────────────────────────────────────────
export interface JobSeekerProfile {
  preferredLocation: string;
  preferredRole: string;
  jobType: string;           // 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship'
  isCurrentlyWorking: boolean;
  noticePeriod: string;      // 'Immediate' | '15 days' | '30 days' | '60 days' | '90 days'
  email: string;
  contactNumber: string;
  experienceYears: number;
  bio: string;
  skills: string[];
}

// ─── Job Models ─────────────────────────────────────────────────────────────
export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  industry: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceYears: number;
  requiredSkills: string[];
  status: string;
  createdAt: string;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  jobType?: string;
  industry?: string;
  minSalary?: number;
  maxSalary?: number;
  minExperience?: number;
  skills?: string[];
  page?: number;
  pageSize?: number;
}

// ─── Application Models ──────────────────────────────────────────────────────
export interface StatusHistory {
  fromStatus: string;
  toStatus: string;
  note?: string;
  changedAt: string;
}

export interface Application {
  id: string;
  jobSeekerId: string;
  jobId: string;
  resumeId: string;
  status: string;
  coverLetter?: string;
  isWithdrawn: boolean;
  createdAt: string;
  history: StatusHistory[];
}

// ─── Resume Models ───────────────────────────────────────────────────────────
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  summary?: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
}

export interface Experience {
  id?: string;
  company: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  template: string;
  resumeType: string;        // 'Built' | 'Uploaded'
  uploadedFileName?: string; // original file name for uploaded resumes
  isDefault: boolean;
  personal: PersonalInfo;
  educations: Education[];
  experiences: Experience[];
  skills: string[];
  projects: Project[];
  createdAt: string;
}

// ─── Recruiter Models ────────────────────────────────────────────────────────
export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  companyDescription?: string;
  industry: string;
  website: string;
  location: string;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  recruiterId: string;
  jobId: string;
  candidateId: string;
  applicationId: string;
  stage: string;
  notes?: string;
  resumeViewed: boolean;
  resumeViewedAt?: string;
  resumeAccessExpiresAt?: string;
  isResumeAccessActive: boolean;
  isWithdrawn: boolean;
  withdrawnAt?: string;
  createdAt: string;
}

export interface ExperiencePreview {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface EducationPreview {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startDate: string;
  endDate?: string;
}

export interface CandidateResumeView {
  candidateId: string;
  accessExpiresAt?: string;
  fullName: string;
  summary?: string;
  skills: string[];
  experiences: ExperiencePreview[];
  educations: EducationPreview[];
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  resumeType?: string;
  resumeId?: string;
  uploadedFileName?: string;
}

// ─── Payment Models ──────────────────────────────────────────────────────────
export interface Wallet {
  recruiterId: string;
  pointsBalance: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: string;
  points: number;
  amount?: number;
  reason: string;
  status: string;
  createdAt: string;
}

// ─── Notification Models ─────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Admin Models ────────────────────────────────────────────────────────────
export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface FlaggedJob {
  id: string;
  jobId: string;
  flaggedBy: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
}

// ─── API Response Models ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
