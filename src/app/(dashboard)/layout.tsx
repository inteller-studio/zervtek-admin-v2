import { cookies } from 'next/headers'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get('sidebar_state')?.value
  const defaultOpen = sidebarState !== 'false'

  return (
    <ProtectedRoute>
      <DashboardShell defaultOpen={defaultOpen}>{children}</DashboardShell>
    </ProtectedRoute>
  )
}
