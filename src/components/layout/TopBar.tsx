'use client'

import { signOut } from 'next-auth/react'
import { Bell, LogOut, Settings } from 'lucide-react'
import { Chip, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { getRoleBadgeColor } from '@/lib/auth/rbac'
import type { Role } from '@/types'

interface TopBarProps {
  user: {
    name?: string
    email?: string
    role?: string
  }
}

export function TopBar({ user }: TopBarProps) {
  const role = (user.role ?? 'VIEWER') as Role
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#060910] border-b border-[#1e2d4a] flex-shrink-0">
      {/* Left: page context */}
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">HAL Command Center</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full" />
              <div className="absolute inset-0 w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-xs text-[#00ff88] font-mono">All systems nominal</span>
          </div>
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-3">
        {/* Alerts */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#0f1629] transition-colors">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff3366] rounded-full" />
        </button>

        {/* Role badge */}
        <Chip
          size="sm"
          color={getRoleBadgeColor(role) as 'danger' | 'warning' | 'primary' | 'default'}
          variant="flat"
          className="font-mono text-[10px] uppercase"
        >
          {role.replace('_', ' ')}
        </Chip>

        {/* User menu */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#0f1629] transition-colors">
              <Avatar
                size="sm"
                name={initials}
                classNames={{
                  base: 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/20',
                  name: 'text-xs font-bold',
                }}
              />
              <div className="text-left hidden md:block">
                <p className="text-xs font-medium text-white leading-tight">{user.name ?? 'User'}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{user.email}</p>
              </div>
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="User actions"
            className="bg-[#0f1629] border border-[#1e2d4a]"
          >
            <DropdownItem
              key="settings"
              startContent={<Settings className="w-4 h-4" />}
              className="text-slate-300"
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="logout"
              startContent={<LogOut className="w-4 h-4" />}
              className="text-[#ff3366]"
              color="danger"
              onPress={() => signOut({ callbackUrl: '/login' })}
            >
              Sign Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}
