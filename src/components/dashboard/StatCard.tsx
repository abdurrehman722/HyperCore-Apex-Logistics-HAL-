'use client'

import { LucideIcon } from 'lucide-react'
import { Skeleton } from '@nextui-org/react'

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  color: 'cyan' | 'green' | 'purple' | 'danger' | 'warning'
  isLoading?: boolean
}

const colorMap = {
  cyan: {
    bg: 'bg-[#00d4ff]/10',
    border: 'border-[#00d4ff]/20',
    icon: 'text-[#00d4ff]',
    glow: 'rgba(0, 212, 255, 0.1)',
  },
  green: {
    bg: 'bg-[#00ff88]/10',
    border: 'border-[#00ff88]/20',
    icon: 'text-[#00ff88]',
    glow: 'rgba(0, 255, 136, 0.08)',
  },
  purple: {
    bg: 'bg-[#7c3aed]/10',
    border: 'border-[#7c3aed]/20',
    icon: 'text-[#7c3aed]',
    glow: 'rgba(124, 58, 237, 0.1)',
  },
  danger: {
    bg: 'bg-[#ff3366]/10',
    border: 'border-[#ff3366]/20',
    icon: 'text-[#ff3366]',
    glow: 'rgba(255, 51, 102, 0.1)',
  },
  warning: {
    bg: 'bg-[#ffaa00]/10',
    border: 'border-[#ffaa00]/20',
    icon: 'text-[#ffaa00]',
    glow: 'rgba(255, 170, 0, 0.1)',
  },
}

export function StatCard({ title, value, subtitle, icon: Icon, color, isLoading }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div
      className={`hal-card p-5 flex items-start gap-4`}
      style={{ boxShadow: `0 0 24px ${c.glow}` }}
    >
      <div className={`${c.bg} ${c.border} border rounded-xl p-2.5 flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-1">{title}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-16 rounded bg-[#1e2d4a]" />
        ) : (
          <p className="text-2xl font-bold text-white font-mono">{value}</p>
        )}
        <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  )
}
