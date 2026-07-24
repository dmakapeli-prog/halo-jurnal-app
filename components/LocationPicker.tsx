'use client'

import { useState, useEffect, useRef } from 'react'

interface LocationPickerProps {
  value: {
    address: string
    lat: number | null
    lng: number | null
  }
  onChange: (location: { address: string; lat: number | null; lng: number | null }) => void
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Default Sukabumi coordinates if none selected
  const defaultLat = value.lat || -6.9214
  const defaultLng = value.lng || 106.9278

  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return
      
      // Dynamic Leaflet import for SSR compatibility in Next.js App Router
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!isMounted) return

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Create custom SVG pin marker
      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div style="
            background-color: #6b0218;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            <span class="material-symbols-outlined" style="
              transform: rotate(45deg);
              color: white;
              font-size: 20px;
            ">location_on</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })

      const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customIcon
      }).addTo(map)

      mapInstanceRef.current = map
      markerInstanceRef.current = marker

      // Handle marker drag end
      marker.on('dragend', async () => {
        const latLng = marker.getLatLng()
        await handlePositionChange(latLng.lat, latLng.lng)
      })

      // Handle map click
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        await handlePositionChange(lat, lng)
      })
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Reverse Geocoding via OpenStreetMap Nominatim API
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      setIsGeocoding(true)
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: {
          'Accept-Language': 'id,en'
        }
      })
      if (!res.ok) throw new Error('Gagal mengambil alamat')
      const data = await res.json()
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      return value.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } finally {
      setIsGeocoding(false)
    }
  }

  const handlePositionChange = async (lat: number, lng: number) => {
    const fetchedAddress = await reverseGeocode(lat, lng)
    onChange({
      address: fetchedAddress,
      lat,
      lng
    })
  }

  // Get current user location using navigator.geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation tidak didukung oleh browser Anda.')
      return
    }

    setGeoError(null)
    setIsGeocoding(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16)
          markerInstanceRef.current.setLatLng([lat, lng])
        }

        await handlePositionChange(lat, lng)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsGeocoding(false)
        setGeoError('Gagal mengambil lokasi saat ini. Pastikan izin lokasi diaktifkan di browser.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#1c1c19]">
          Lokasi Kejadian / Target <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGeocoding}
          className="text-xs font-bold text-[#6b0218] bg-[#ffdad9]/40 hover:bg-[#ffdad9] px-3 py-1.5 rounded-lg border border-[#debfbf] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">my_location</span>
          {isGeocoding ? 'Mengambil lokasi...' : 'Gunakan Lokasi Saya Saat Ini'}
        </button>
      </div>

      {geoError && (
        <p className="text-xs text-red-600 font-semibold">{geoError}</p>
      )}

      {/* Map Canvas */}
      <div className="relative w-full h-[260px] md:h-[300px] rounded-xl overflow-hidden border-[1.5px] border-[#8b7171] shadow-inner bg-[#e5e2dd]">
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>
        
        {/* Overlay Helper */}
        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow border border-[#debfbf] text-[11px] md:text-xs text-[#574141] flex items-center justify-between pointer-events-none z-[1000]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[#6b0218]">touch_app</span>
            Klik atau geser pin pada peta untuk menentukan lokasi presisi
          </span>
          {value.lat && value.lng && (
            <span className="font-mono text-[10px] text-[#8b7171] hidden sm:inline">
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </span>
          )}
        </div>
      </div>

      {/* Manual Address Input / Auto-filled */}
      <div className="relative">
        <input
          type="text"
          className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 pl-10 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all text-sm"
          placeholder="Alamat lengkap (otomatis terisi dari peta, dapat disesuaikan)"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
        <span className="material-symbols-outlined absolute left-3 top-3 text-[#574141]">location_on</span>
        {isGeocoding && (
          <span className="material-symbols-outlined absolute right-3 top-3 text-[#6b0218] animate-spin text-sm">
            sync
          </span>
        )}
      </div>
    </div>
  )
}
