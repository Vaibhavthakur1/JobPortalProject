# JobMart - Angular Frontend

A comprehensive job portal and resume builder web application built with Angular 17, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Register, login, email verification, forgot password
- **Job Search**: Browse and filter jobs by keyword, location, salary, etc.
- **Job Applications**: Apply for jobs, track application status
- **Resume Builder**: Create and manage multiple resumes with templates
- **Recruiter Dashboard**: Post jobs, manage listings, review applicants with pipeline
- **Wallet System**: Buy points, track transactions
- **Admin Panel**: User management, flagged jobs review, audit logs
- **State Management**: Angular Signals for reactive state
- **Responsive Design**: Mobile and desktop optimized with Tailwind CSS

## Tech Stack

- **Framework**: Angular 17 (Standalone Components)
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.4
- **State**: Angular Signals
- **HTTP Client**: Axios
- **Forms**: Angular Reactive Forms
- **Routing**: Angular Router v6

## Project Structure

```
src/
├── app/
│   ├── pages/               # Feature pages
│   │   ├── auth/            # Login, Register, OTP
│   │   ├── jobseeker/       # Job search, applications, resumes
│   │   ├── recruiter/       # Recruiter dashboard, job posting
│   │   └── admin/           # Admin management pages
│   ├── services/            # API services (Auth, Jobs, etc.)
│   ├── store/               # Angular Signal stores
│   ├── guards/              # Route guards
│   ├── shared/              # Shared components (Navbar, Toast)
│   ├── models/              # TypeScript interfaces
│   ├── app.component.ts     # Root component
│   └── app.routes.ts        # Route configuration
├── environments/            # Environment configs
├── styles.css              # Global styles
└── main.ts                 # Application bootstrap
```

## Installation

1. Navigate to the project directory:
```bash
cd jobmart-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoints in `src/environments/environment.ts`:
```typescript
apiBaseUrls: {
  auth: 'http://localhost:5001',
  jobs: 'http://localhost:5002',
  // ... other services
}
```

## Development Server

Run the development server:
```bash
npm start
```

The application will open at `http://localhost:4200/`

## Build

Build for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## API Integration

All services use Axios for HTTP requests. API services are located in `src/app/services/`:

- `auth.service.ts` - Authentication endpoints
- `job.service.ts` - Job listing and details
- `application.service.ts` - Job applications
- `resume.service.ts` - Resume CRUD
- `recruiter.service.ts` - Recruiter operations
- `payment.service.ts` - Payment and wallet
- `notification.service.ts` - Notifications
- `admin.service.ts` - Admin operations

All services automatically include the Bearer token from localStorage.

## State Management (Angular Signals)

Store files in `src/app/store/`:

- `auth.signal.ts` - Authentication state
- `ui.signal.ts` - UI state (modals, toasts, etc.)

Example usage in components:
```typescript
constructor(
  readonly authStore: AuthSignalStore,
  readonly uiStore: UISignalStore
) {}

// Access signals
user = this.authStore.user();
isLoading = this.authStore.isLoading();

// Update signals
this.uiStore.showToast('Success!', 'success');
this.authStore.setLoading(true);
```

## Routing & Guards

Role-based route protection:
- `AuthGuard` - General authentication
- `JobSeekerGuard` - JobSeeker only routes
- `RecruiterGuard` - Recruiter only routes
- `AdminGuard` - Admin only routes

## Components

### Shared Components
- **Navbar**: Navigation with user menu and notifications
- **Toast**: Global notification system
- **Auth Pages**: Login, Register, OTP verification, Forgot Password

### JobSeeker Pages
- Dashboard
- Job Search & Filters
- Job Detail
- My Applications
- Application Status Timeline
- Resume Builder (Multi-step wizard)
- Resume Templates

### Recruiter Pages
- Dashboard with stats
- Company Profile Setup
- Post Job Form
- My Job Listings
- Applicants Pipeline
- Resume View (with point deduction)
- Wallet & Points

### Admin Pages
- Dashboard (stats & recent activity)
- User Management
- Flagged Jobs Review
- Audit Logs

## Key Features Implementation

### Token Refresh
Token refresh happens automatically on 401 responses. Tokens stored in localStorage:
- `accessToken` - JWT for API requests
- `refreshToken` - Used to refresh access token
- `user` - User data (role, email, etc.)

### Error Handling
- API errors show toast notifications
- Validation errors display inline in forms
- 401 errors trigger automatic logout

### Loading States
- Disable buttons during requests
- Show loading spinners
- Toast notifications for long operations

## Environment Configuration

Create `.env` file or update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrls: {
    auth: 'http://localhost:5001',
    jobs: 'http://localhost:5002',
    applications: 'http://localhost:5003',
    resumes: 'http://localhost:5004',
    recruiter: 'http://localhost:5005',
    payment: 'http://localhost:5006',
    notifications: 'http://localhost:5007',
    admin: 'http://localhost:5008',
  },
};
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues and questions, please contact the development team.
