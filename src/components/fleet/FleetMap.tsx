'use client'

import { useEffect, useRef } from 'react'
import { FleetVehicle } from '@/types'
import 'leaflet/dist/leaflet.css'

interface FleetMapProps {
  vehicles: FleetVehicle[]
  onVehicleClick: (vehicle: FleetVehicle) => void
}

const statusColors = {
  EN_ROUTE: '#00ff88',
  IDLE: '#64748b',
  LOADING: '#00d4ff',
  MAINTENANCE: '#ffaa00',
  OFFLINE: '#ff3366',
}

export default function FleetMap({ vehicles, onVehicleClick }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const L = require('leaflet')

    // Fix default marker icon
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(mapRef.current, {
      center: [1.3521, 103.8198],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const L = require('leaflet')
    const map = mapInstanceRef.current
    if (!map || vehicles.length === 0) return

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    vehicles.forEach(vehicle => {
      const color = statusColors[vehicle.status]

      const icon = L.divIcon({
        html: `
          <div style="
            width: 36px; height: 36px;
            background: #0f1629;
            border: 2px solid ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 0 12px ${color}66;
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="transform: rotate(45deg); color: ${color}; font-size: 14px;">🚛</div>
          </div>
        `,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })

      const marker = L.marker([vehicle.lat, vehicle.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="background: #0f1629; border: 1px solid #1e2d4a; border-radius: 8px; padding: 10px; min-width: 160px; color: #e2e8f0;">
            <p style="font-weight: bold; font-family: monospace; color: #00d4ff;">${vehicle.plateNumber}</p>
            <p style="font-size: 12px; color: #94a3b8;">${vehicle.model}</p>
            <p style="font-size: 11px; margin-top: 4px;">Driver: ${vehicle.driverName}</p>
            <p style="font-size: 11px; color: ${color};">● ${vehicle.status.replace('_', ' ')}</p>
            <p style="font-size: 11px;">Speed: ${vehicle.speed} km/h</p>
            <p style="font-size: 11px;">Load: ${vehicle.loadPercent}%</p>
          </div>
        `, {
          className: 'hal-popup',
          maxWidth: 200,
        })
        .on('click', () => onVehicleClick(vehicle))

      markersRef.current[vehicle.id] = marker
    })
  }, [vehicles, onVehicleClick])

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ minHeight: '400px', background: '#0a0e1a' }}
    />
  )
}
