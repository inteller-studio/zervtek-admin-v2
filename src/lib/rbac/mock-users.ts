import { type Role, ROLES } from './types'

export interface MockUser {
  id: string
  accountNo: string
  email: string
  firstName: string
  lastName: string
  role: Role[]
  exp: number
}

// Generate expiry 24 hours from now
const getExpiry = () => Date.now() + 24 * 60 * 60 * 1000

export const MOCK_USERS: Record<string, MockUser> = {
  admin: {
    id: '1',
    accountNo: 'ACC001',
    email: 'admin@zervtek.com',
    firstName: 'Admin',
    lastName: 'User',
    role: [ROLES.ADMIN],
    exp: getExpiry(),
  },
  manager: {
    id: '2',
    accountNo: 'ACC002',
    email: 'manager@zervtek.com',
    firstName: 'Manager',
    lastName: 'User',
    role: [ROLES.MANAGER],
    exp: getExpiry(),
  },
  sales: {
    id: '3',
    accountNo: 'ACC003',
    email: 'sales@zervtek.com',
    firstName: 'Sales',
    lastName: 'Staff',
    role: [ROLES.SALES_STAFF],
    exp: getExpiry(),
  },
  accountant: {
    id: '4',
    accountNo: 'ACC004',
    email: 'accountant@zervtek.com',
    firstName: 'Finance',
    lastName: 'User',
    role: [ROLES.ACCOUNTANT],
    exp: getExpiry(),
  },
  content: {
    id: '5',
    accountNo: 'ACC005',
    email: 'content@zervtek.com',
    firstName: 'Content',
    lastName: 'Manager',
    role: [ROLES.CONTENT_MANAGER],
    exp: getExpiry(),
  },
  // Multi-role user example
  multiRole: {
    id: '6',
    accountNo: 'ACC006',
    email: 'multi@zervtek.com',
    firstName: 'Multi',
    lastName: 'Role',
    role: [ROLES.SALES_STAFF, ROLES.CONTENT_MANAGER],
    exp: getExpiry(),
  },
}

export function getMockUser(userType: keyof typeof MOCK_USERS): MockUser {
  // Refresh expiry on access
  const user = { ...MOCK_USERS[userType] }
  user.exp = getExpiry()
  return user
}

export function getMockUserCredentials() {
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'demo'
  return Object.entries(MOCK_USERS).map(([key, user]) => ({
    key,
    email: user.email,
    password: demoPassword,
    role: user.role.join(', '),
    name: `${user.firstName} ${user.lastName}`,
  }))
}
