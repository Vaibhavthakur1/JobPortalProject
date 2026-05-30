import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  features = [
    {
      icon: 'search',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      title: 'Smart Job Search',
      description: 'Filter by location, salary, industry, skills, and experience level to find exactly what you\'re looking for.',
    },
    {
      icon: 'description',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Resume Builder',
      description: 'Create a polished, professional resume with our guided builder. Add experience, education, projects, and skills.',
    },
    {
      icon: 'assignment_turned_in',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'One-Click Apply',
      description: 'Apply to jobs instantly using your saved resume. Track every application and its status in real time.',
    },
    {
      icon: 'timeline',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      title: 'Application Tracking',
      description: 'See the full history of every application — from submitted to offer — with detailed status updates.',
    },
    {
      icon: 'notifications',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'Real-Time Notifications',
      description: 'Get notified the moment a recruiter reviews your application or moves you to the next stage.',
    },
    {
      icon: 'verified_user',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      title: 'Verified Listings',
      description: 'Every job posting is reviewed and moderated to ensure quality and legitimacy for all applicants.',
    },
  ];

  steps = [
    {
      title: 'Create your profile',
      description: 'Sign up, verify your email, and build your resume using our step-by-step builder.',
    },
    {
      title: 'Discover opportunities',
      description: 'Browse thousands of verified job listings and filter by what matters most to you.',
    },
    {
      title: 'Apply & get hired',
      description: 'Submit applications in seconds and track your progress all the way to the offer.',
    },
  ];

  recruiterPerks = [
    'Post unlimited job listings with rich descriptions',
    'Visual applicant pipeline — move candidates through stages',
    'Unlock candidate resumes and contact info with points',
    'Company profile to showcase your brand to top talent',
    'Wallet system — buy points and manage spend easily',
  ];

  recruiterStats = [
    { icon: 'work', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', value: '10k+', label: 'Jobs posted' },
    { icon: 'people', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', value: '50k+', label: 'Active candidates' },
    { icon: 'trending_up', iconBg: 'bg-green-100', iconColor: 'text-green-600', value: '85%', label: 'Fill rate' },
    { icon: 'schedule', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600', value: '3 days', label: 'Avg. time to hire' },
  ];
}
