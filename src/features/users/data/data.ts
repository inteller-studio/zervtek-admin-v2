import { MdSecurity, MdVerifiedUser, MdPeople, MdCreditCard } from 'react-icons/md'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const roles = [
  {
    label: 'Superadmin',
    value: 'superadmin',
    icon: MdSecurity,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: MdVerifiedUser,
  },
  {
    label: 'Manager',
    value: 'manager',
    icon: MdPeople,
  },
  {
    label: 'Cashier',
    value: 'cashier',
    icon: MdCreditCard,
  },
] as const
