import {
  MdDashboard,
  MdPeople,
  MdAccountCircle,
  MdCreditCard,
  MdDescription,
  MdGavel,
  MdPanTool,
  MdShoppingCart,
  MdDirectionsCar,
  MdTv,
  MdPublic,
  MdStorage,
  MdLocalOffer,
  MdSecurity,
  MdTerminal,
  MdFactCheck,
  MdChat,
  MdConfirmationNumber,
  MdHelpOutline,
  MdPersonAdd,
  MdInbox,
} from 'react-icons/md'
import { type NavGroup, type User, type Team } from '../types'
import { ROLES } from '@/lib/rbac/types'
import { bids } from '@/features/bids/data/bids'
import { requests } from '@/features/requests/data/requests'
import { customers } from '@/features/customers/data/customers'
import { getTicketStats } from '@/features/support/data/tickets'
import { getSubmissionStats } from '@/features/leads/data/submissions'

// Count customers assigned to current user (simulated - in production this would use auth context)
const CURRENT_USER_ID = 'staff-001'
const myCustomersCount = customers.filter(c => c.assignedTo === CURRENT_USER_ID).length

// Calculate pending approval count
const pendingBidsCount = bids.filter((b) => b.status === 'pending_approval').length
const pendingTranslationsCount = requests.filter((r) => r.type === 'translation' && r.status === 'pending').length
const pendingInspectionsCount = requests.filter((r) => r.type === 'inspection' && r.status === 'pending').length

// Support ticket stats
const ticketStats = getTicketStats()
const openTicketsCount = ticketStats.open + ticketStats.inProgress

// Submissions/Inquiries stats
const submissionStats = getSubmissionStats()
const newSubmissionsCount = submissionStats.byStatus.new
const newInquiriesCount = submissionStats.byType.inquiry
const unscheduledOnboardingCount = submissionStats.byType.onboarding

// Role group shortcuts
const SALES_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF] as const
const FINANCE_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT] as const
const CONTENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.CONTENT_MANAGER] as const
const TV_DISPLAY_ROLES = [ROLES.ADMIN, ROLES.TV_DISPLAY] as const
const MANAGEMENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER] as const
const ADMIN_ONLY = [ROLES.ADMIN] as const

export const sidebarUser: User = {
  name: 'Admin',
  email: 'admin@zervtek.com',
  avatar: '/avatars/admin.svg',
}

export const sidebarTeams: Team[] = [
  {
    name: 'Zervtek',
    logo: MdTerminal,
    plan: 'Admin Panel',
  },
]

export const sidebarNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: MdDashboard,
      },
    ],
  },
  {
    title: 'Inventory',
    roles: [...SALES_ROLES],
    items: [
      { title: 'Auctions', url: '/auctions', icon: MdGavel },
      { title: 'Stock Vehicles', url: '/stock-vehicles', icon: MdDirectionsCar },
    ],
  },
  {
    title: 'Operations',
    roles: [...SALES_ROLES],
    items: [
      {
        title: 'Bids',
        url: '/bids',
        icon: MdPanTool,
        badge: pendingBidsCount > 0 ? String(pendingBidsCount) : undefined,
      },
      {
        title: 'Tasks',
        url: '/services',
        icon: MdFactCheck,
        badge: (pendingTranslationsCount + pendingInspectionsCount) > 0 ? String(pendingTranslationsCount + pendingInspectionsCount) : undefined,
      },
    ],
  },
  {
    title: 'Finance',
    roles: [...FINANCE_ROLES],
    items: [
      { title: 'Purchases', url: '/purchases', icon: MdShoppingCart },
      { title: 'Invoices', url: '/invoices', icon: MdDescription },
      { title: 'Payments', url: '/payments', icon: MdCreditCard },
    ],
  },
  {
    title: 'CRM',
    roles: [...MANAGEMENT_ROLES],
    items: [
      { title: 'WhatsApp', url: '/whatsapp', icon: MdChat },
      { title: 'Customers', url: '/customers', icon: MdPeople },
      {
        title: 'My Customers',
        url: '/my-customers',
        icon: MdAccountCircle,
        badge: myCustomersCount > 0 ? String(myCustomersCount) : undefined,
        roles: [ROLES.MANAGER, ROLES.SALES_STAFF],
      },
      {
        title: 'Leads',
        icon: MdInbox,
        badge: newSubmissionsCount > 0 ? String(newSubmissionsCount) : undefined,
        items: [
          {
            title: 'Inquiries',
            url: '/leads/inquiries',
            icon: MdDirectionsCar,
            badge: newInquiriesCount > 0 ? String(newInquiriesCount) : undefined,
          },
          {
            title: 'Onboarding',
            url: '/leads/onboarding',
            icon: MdFactCheck,
            badge: unscheduledOnboardingCount > 0 ? String(unscheduledOnboardingCount) : undefined,
          },
          {
            title: 'Assign',
            url: '/leads/assign',
            icon: MdPersonAdd,
            roles: [...ADMIN_ONLY],
          },
        ],
      },
    ],
  },
  {
    title: 'Display',
    roles: [...TV_DISPLAY_ROLES],
    items: [
      { title: 'TV Display', url: '/tv-display', icon: MdTv },
    ],
  },
  {
    title: 'Content',
    roles: [...CONTENT_ROLES],
    items: [
      { title: 'Blogs', url: '/blogs', icon: MdDescription },
      {
        title: 'SEO Management',
        icon: MdPublic,
        items: [
          { title: 'Makes SEO', url: '/admin/makes', icon: MdStorage },
          { title: 'Models SEO', url: '/admin/models', icon: MdLocalOffer },
        ],
      },
    ],
  },
  {
    title: 'Support',
    roles: [...MANAGEMENT_ROLES],
    items: [
      {
        title: 'Support Tickets',
        url: '/support',
        icon: MdConfirmationNumber,
        badge: openTicketsCount > 0 ? String(openTicketsCount) : undefined,
      },
      {
        title: 'FAQ',
        url: '/faq',
        icon: MdHelpOutline,
      },
    ],
  },
  {
    title: 'Admin',
    roles: [...ADMIN_ONLY],
    items: [
      {
        title: 'User Management',
        url: '/users',
        icon: MdSecurity,
      },
    ],
  },
]

// Legacy export for backward compatibility
export const sidebarData = {
  user: sidebarUser,
  teams: sidebarTeams,
  navGroups: sidebarNavGroups,
}
