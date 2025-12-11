import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </ProtectedRoute>
  )
}
