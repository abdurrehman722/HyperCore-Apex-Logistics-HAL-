'use client'

import { AreaChart, BarChart } from '@tremor/react'

const throughputData = [
  { time: '00:00', deliveries: 12, pickups: 8, loads: 15 },
  { time: '02:00', deliveries: 8, pickups: 5, loads: 10 },
  { time: '04:00', deliveries: 5, pickups: 3, loads: 6 },
  { time: '06:00', deliveries: 18, pickups: 12, loads: 20 },
  { time: '08:00', deliveries: 42, pickups: 28, loads: 38 },
  { time: '10:00', deliveries: 58, pickups: 35, loads: 52 },
  { time: '12:00', deliveries: 65, pickups: 40, loads: 58 },
  { time: '14:00', deliveries: 71, pickups: 45, loads: 63 },
  { time: '16:00', deliveries: 68, pickups: 42, loads: 60 },
  { time: '18:00', deliveries: 55, pickups: 38, loads: 48 },
  { time: '20:00', deliveries: 35, pickups: 22, loads: 30 },
  { time: '22:00', deliveries: 20, pickups: 14, loads: 18 },
]

const zoneData = [
  { zone: 'Zone A', occupancy: 87 },
  { zone: 'Zone B', occupancy: 62 },
  { zone: 'Zone C', occupancy: 43 },
  { zone: 'Zone D', occupancy: 95 },
]

export function OperationsChart() {
  return (
    <div className="hal-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Operations Throughput</h3>
          <p className="text-xs text-slate-500">24-hour activity overview</p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'Deliveries', color: '#00d4ff' },
            { label: 'Pickups', color: '#7c3aed' },
            { label: 'Loads', color: '#00ff88' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <AreaChart
        data={throughputData}
        index="time"
        categories={['deliveries', 'pickups', 'loads']}
        colors={['cyan', 'violet', 'emerald']}
        showLegend={false}
        showGridLines={false}
        showXAxis={true}
        showYAxis={false}
        curveType="monotone"
        className="h-40"
      />
    </div>
  )
}
