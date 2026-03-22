import { auth } from '@/lib/auth/auth'
import { CommandCenter } from '@/components/dashboard/CommandCenter'

export const metadata = { title: 'Command Center | HAL' }

export default async function DashboardPage() {
  const session = await auth()
  const userRole = (session?.user as { role?: string })?.role ?? 'VIEWER'

  return <CommandCenter userRole={userRole} />
}
