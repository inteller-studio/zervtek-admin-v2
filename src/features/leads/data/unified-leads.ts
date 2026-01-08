import { MdDirectionsCar, MdVerifiedUser, MdFactCheck } from 'react-icons/md'
import {
  type Submission,
  type SubmissionType,
  type InquirySubmission,
  type SignupSubmission,
  type OnboardingSubmission,
  type InquiryStatus,
  type OnboardingStatus,
  submissions,
  inquiries,
  signups,
  onboardingRequests,
} from './submissions'

// Unified status type for display purposes
export type UnifiedStatus =
  // Inquiry statuses
  | 'new'
  | 'in_progress'
  | 'responded'
  | 'closed'
  // Signup statuses
  | 'pending'
  | 'verified'
  | 'rejected'
  // Onboarding statuses
  | 'scheduled'
  | 'completed'
  | 'cancelled'

// Type badge configuration
export const typeBadgeConfig: Record<
  SubmissionType,
  { label: string; icon: typeof MdDirectionsCar; className: string }
> = {
  inquiry: {
    label: 'Inquiry',
    icon: MdDirectionsCar,
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  signup: {
    label: 'Signup',
    icon: MdVerifiedUser,
    className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
  onboarding: {
    label: 'Onboarding',
    icon: MdFactCheck,
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
}

// Status badge configuration - unified colors across all types
export const statusBadgeConfig: Record<
  string,
  { label: string; className: string }
> = {
  // Inquiry statuses
  new: {
    label: 'New',
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  responded: {
    label: 'Responded',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  closed: {
    label: 'Closed',
    className: 'bg-slate-500/15 text-slate-500 dark:text-slate-400',
  },
  // Signup statuses
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  verified: {
    label: 'Verified',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
  // Onboarding statuses
  scheduled: {
    label: 'Scheduled',
    className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-500/15 text-slate-500 dark:text-slate-400',
  },
}

// Get display status for a submission
export function getDisplayStatus(submission: Submission): string {
  if (submission.type === 'signup') {
    const signup = submission as SignupSubmission
    return signup.metadata.verificationStatus
  }

  if (submission.type === 'onboarding') {
    const onboarding = submission as OnboardingSubmission
    if (submission.status === 'closed') return 'completed'
    if (onboarding.metadata.scheduledDate) return 'scheduled'
    return 'new'
  }

  // Inquiry - use status directly
  return submission.status
}

// Get subject/interest display text for a submission
export function getSubjectDisplay(submission: Submission): string {
  if (submission.type === 'inquiry') {
    const inquiry = submission as InquirySubmission
    return inquiry.metadata.vehicleTitle
  }

  if (submission.type === 'signup') {
    const signup = submission as SignupSubmission
    return signup.metadata.country
  }

  if (submission.type === 'onboarding') {
    const onboarding = submission as OnboardingSubmission
    return onboarding.metadata.vehicles
      .map((v) => `${v.make} ${v.model}`)
      .join(', ')
  }

  return submission.subject
}

// Status options for filtering - by type
export const statusOptionsByType: Record<
  'all' | SubmissionType,
  Array<{ value: string; label: string }>
> = {
  all: [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'responded', label: 'Responded' },
    { value: 'verified', label: 'Verified' },
    { value: 'completed', label: 'Completed' },
    { value: 'closed', label: 'Closed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  inquiry: [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'responded', label: 'Responded' },
    { value: 'closed', label: 'Closed' },
  ],
  signup: [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
  ],
  onboarding: [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
}

// Get counts by type
export function getTypeCounts(): Record<'all' | SubmissionType, number> {
  return {
    all: submissions.length,
    inquiry: inquiries.length,
    signup: signups.length,
    onboarding: onboardingRequests.length,
  }
}

// Get counts of leads needing attention (for badge display)
export function getAttentionCounts(): Record<SubmissionType, number> {
  return {
    inquiry: inquiries.filter((i) => i.status === 'new').length,
    signup: signups.filter((s) => s.metadata.verificationStatus === 'pending')
      .length,
    onboarding: onboardingRequests.filter(
      (o) => o.status === 'new' || !o.metadata.scheduledDate
    ).length,
  }
}

// Re-export for convenience
export {
  submissions,
  inquiries,
  signups,
  onboardingRequests,
  type Submission,
  type SubmissionType,
  type InquirySubmission,
  type SignupSubmission,
  type OnboardingSubmission,
  type InquiryStatus,
  type OnboardingStatus,
}
