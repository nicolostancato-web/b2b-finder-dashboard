'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Match } from '@/types'

const COLORS: Record<string, string> = {
  alta:  '#10B981',
  media: '#F59E0B',
  bassa: '#F97316',
}

interface MapViewProps {
  matches: Match[]
  centerLat: number
  centerLng: number
  clientName?: string
  activeFilter: string | null
  selectedOcid: string | null
  onSelectMatch: (match: Match) => void
}

export default function MapView({
  matches,
  centerLat,
  centerLng,
  clientName,
  activeFilter,
  selectedOcid,
  onSelectMatch,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const clientMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [centerLng, centerLat],
      zoom: 8,
      maxBounds: [[-5, 36], [20, 48]],
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      setMapLoaded(true)

      // FIX 4: Cluster source
      map.addSource('matches', {
        type: 'geojson',
        data: buildGeoJSON(matches, null, null),
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      })

      // Cluster glow
      map.addLayer({
        id: 'cluster-glow',
        type: 'circle',
        source: 'matches',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3B82F6',
          'circle-radius': ['step', ['get', 'point_count'], 28, 10, 36, 50, 44],
          'circle-opacity': 0.15,
          'circle-blur': 1,
        },
      })

      // Cluster circle
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'matches',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3B82F6',
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 30],
          'circle-opacity': 0.92,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.3)',
        },
      })

      // Cluster count label
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'matches',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // FIX 3: Single point glow (color per label)
      map.addLayer({
        id: 'point-glow',
        type: 'circle',
        source: 'matches',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'match', ['get', 'label'],
            'alta', 20, 'media', 16, 'bassa', 12, 12
          ],
          'circle-opacity': 0.18,
          'circle-blur': 1,
        },
      })

      // FIX 3: Single point (color + size by label)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'matches',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'match', ['get', 'label'],
            'alta', 9, 'media', 7, 'bassa', 5, 5
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
          'circle-opacity': 0.95,
        },
      })

      // FIX 4: Click cluster → zoom in to expand
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        if (!features[0]) return
        const clusterId = (features[0].properties as { cluster_id: number }).cluster_id
        const src = map.getSource('matches') as mapboxgl.GeoJSONSource
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || features[0].geometry.type !== 'Point') return
          map.easeTo({ center: features[0].geometry.coordinates as [number, number], zoom: zoom ?? 12 })
        })
      })

      // Click single point → open slide-over
      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0]
        if (!feature?.properties) return
        const m = matches.find(x => x.gara_ocid === feature.properties!.ocid)
        if (m) onSelectMatch(m)
      })

      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })
    })

    map.on('load', () => {
      requestAnimationFrame(() => map.resize())
    })

    mapRef.current = map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).__mapboxMap = map

    // FIX 5: Client location pin
    const pinEl = document.createElement('div')
    pinEl.style.cssText = `
      width: 36px; height: 36px;
      background: white;
      border: 3px solid #3B82F6;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      cursor: default;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.25), 0 4px 12px rgba(0,0,0,0.5);
      z-index: 10;
    `
    pinEl.textContent = '🏢'
    pinEl.title = clientName ? `Sede: ${clientName}` : 'La tua sede'

    clientMarkerRef.current = new mapboxgl.Marker(pinEl)
      .setLngLat([centerLng, centerLat])
      .setPopup(new mapboxgl.Popup({ offset: 20 }).setText(clientName ? `La tua sede: ${clientName}` : 'La tua sede'))
      .addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__mapboxMap
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update GeoJSON when filter or selection changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const src = mapRef.current.getSource('matches') as mapboxgl.GeoJSONSource | undefined
    src?.setData(buildGeoJSON(matches, activeFilter, selectedOcid))
  }, [matches, activeFilter, selectedOcid, mapLoaded])

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
}

function buildGeoJSON(
  matches: Match[],
  filter: string | null,
  selectedOcid: string | null
): GeoJSON.FeatureCollection {
  const filtered = filter ? matches.filter(m => m.match_label === filter) : matches
  return {
    type: 'FeatureCollection',
    features: filtered
      .filter(m => m.gara_lat != null && m.gara_lng != null)
      .map(m => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [Number(m.gara_lng), Number(m.gara_lat)] },
        properties: {
          ocid: m.gara_ocid,
          color: COLORS[m.match_label] ?? '#6B6B7B',
          score: m.match_score,
          label: m.match_label,
          selected: m.gara_ocid === selectedOcid ? 1 : 0,
        },
      })),
  }
}
