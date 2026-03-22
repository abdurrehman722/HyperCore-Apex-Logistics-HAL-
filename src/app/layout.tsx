import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'HyperCore Apex Logistics | Command Center',
  description: 'Enterprise-grade Business Resource Management Suite',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0e1a] text-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
