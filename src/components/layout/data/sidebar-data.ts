import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Gavel,
  Hand,
  ShoppingCart,
  Car,
  MessageSquare,
  Tv,
  Globe,
  Database,
  Tag,
  Shield,
  Settings,
  HelpCircle,
  Command,
} from 'lucide-react'
import { type NavGroup, type User, type Team } from '../types'
import { ROLES } from '@/lib/rbac/types'

// Role group shortcuts
const SALES_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF] as const
const FINANCE_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT] as const
const CONTENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.CONTENT_MANAGER] as const
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
    logo: Command,
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
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Sales',
    roles: [...SALES_ROLES],
    items: [
      { title: 'Auctions', url: '/auctions', icon: Gavel },
      { title: 'Purchases', url: '/purchases', icon: ShoppingCart },
      { title: 'Bids', url: '/bids', icon: Hand },
      { title: 'Stock Vehicles', url: '/stock-vehicles', icon: Car },
    ],
  },
  {
    title: 'Services',
    roles: [...FINANCE_ROLES],
    items: [
      { title: 'Invoice Generator', url: '/invoices', icon: FileText },
      { title: 'Requests', url: '/requests', icon: MessageSquare },
      { title: 'TV Display', url: '/tv-display', icon: Tv },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
  },
  {
    title: 'Content',
    roles: [...CONTENT_ROLES],
    items: [
      { title: 'Blogs', url: '/blogs', icon: FileText },
      {
        title: 'SEO Management',
        icon: Globe,
        items: [
          { title: 'Makes SEO', url: '/admin/makes', icon: Database },
          { title: 'Models SEO', url: '/admin/models', icon: Tag },
        ],
      },
    ],
  },
  {
    title: 'Users',
    roles: [...MANAGEMENT_ROLES],
    items: [
      { title: 'Customers', url: '/customers', icon: Users },
      {
        title: 'User Management',
        url: '/users',
        icon: Shield,
        roles: [...ADMIN_ONLY],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        icon: Settings,
        items: [
          { title: 'Profile', url: '/settings' },
          { title: 'Account', url: '/settings/account' },
          { title: 'Appearance', url: '/settings/appearance' },
          { title: 'Notifications', url: '/settings/notifications' },
        ],
      },
      { title: 'Security', url: '/security', icon: Shield },
      { title: 'Help Center', url: '/help-center', icon: HelpCircle },
    ],
  },
]

// Legacy export for backward compatibility
export const sidebarData = {
  user: sidebarUser,
  teams: sidebarTeams,
  navGroups: sidebarNavGroups,
}
