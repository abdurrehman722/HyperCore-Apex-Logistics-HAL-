'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Truck, Package, Users, Database,
  ScrollText, ChevronLeft, ChevronRight, Zap,
  MapPin, AlertTriangle
} from 'lucide-react'
import { hasPermission } from '@/lib/auth/rbac'
import type { Role } from '@/types'
import { Tooltip } from '@nextui-org/react'

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Command Center',
    permission: 'VIEW_BAYS' as const,
    exact: true,
  },
  {
    href: '/dashboard/fleet',
    icon: Truck,
    label: 'Fleet Dispatcher',
    permission: 'VIEW_FLEET' as const,
  },
  {
    href: '/dashboard/loading-bays',
    icon: MapPin,
    label: 'Loading Bays',
    permission: 'VIEW_BAYS' as const,
  },
  {
    href: '/dashboard/inventory',
    icon: Package,
    label: 'Inventory',
    permission: 'VIEW_INVENTORY' as const,
  },
  {
    href: '/dashboard/team',
    icon: Users,
    label: 'Team',
    permission: 'VIEW_TEAM' as const,
  },
  {
    href: '/dashboard/schema-forge',
    icon: Database,
    label: 'Schema Forge',
    permission: 'VIEW_SCHEMA_FORGE' as const,
  },
  {
    href: '/dashboard/audit',
    icon: ScrollText,
    label: 'Audit Ledger',
    permission: 'VIEW_AUDIT' as const,
  },
]

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const filteredNav = navItems.filter(item =>
    hasPermission(userRole as Role, item.permission)
  )

  return (
    <aside
      className={`
        flex flex-col bg-[#060910] border-r border-[#1e2d4a] transition-all duration-300 z-20
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-[#1e2d4a] ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-[#00d4ff]" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-xs font-bold text-white leading-tight">HyperCore</p>
            <p className="text-[10px] text-[#00d4ff] font-mono">APEX LOGISTICS</p>
          </div>
        )}
      </div>

      {/* Live indicator */}
      {!collapsed && (
        <div className="mx-4 mt-3 mb-1 flex items-center gap-2 px-3 py-2 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg">
          <div className="relative flex-shrink-0">
            <div className="w-2 h-2 bg-[#00ff88] rounded-full" />
            <div className="absolute inset-0 w-2 h-2 bg-[#00ff88] rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-[10px] font-mono text-[#00ff88] uppercase tracking-wider">Live Operations</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff]'
                  : 'text-slate-400 hover:bg-[#0f1629] hover:text-slate-200'
                }
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#00d4ff]' : ''}`} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-[#00d4ff] rounded-full" />
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href} content={item.label} placement="right">
                {linkContent}
              </Tooltip>
            )
          }
          return linkContent
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[#1e2d4a]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-[#0f1629] hover:text-slate-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
