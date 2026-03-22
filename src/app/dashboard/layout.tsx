import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e1a]">
      <Sidebar userRole={(session.user as { role: string }).role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={session.user as { name?: string; email?: string; role?: string }} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
