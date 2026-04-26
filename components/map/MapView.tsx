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
  activeFilter: string | null
  selectedOcid: string | null
  onSelectMatch: (match: Match) => void
}

export default function MapView({
  matches,
  centerLat,
  centerLng,
  activeFilter,
  selectedOcid,
  onSelectMatch,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
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

      map.addSource('matches', {
        type: 'geojson',
        data: buildGeoJSON(matches, null, null),
        cluster: true,
        clusterMaxZoom: 11,
        clusterRadius: 45,
      })

      // Cluster glow
      map.addLayer({
        id: 'cluster-glow',
        type: 'circle',
        source: 'matches',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3B82F6',
          'circle-radius': ['step', ['get', 'point_count'], 26, 10, 32, 50, 40],
          'circle-opacity': 0.15,
          'circle-blur': 1,
        },
      })

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'matches',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3B82F6',
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 28],
          'circle-opacity': 0.9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.3)',
        },
      })

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'matches',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // Glow layer for single points
      map.addLayer({
        id: 'point-glow',
        type: 'circle',
        source: 'matches',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'score'],
            60, 14, 85, 20, 100, 26
          ],
          'circle-opacity': 0.12,
          'circle-blur': 1,
        },
      })

      // Main point layer
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'matches',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'score'],
            60, 5, 85, 8, 100, 11
          ],
          'circle-stroke-width': [
            'case', ['==', ['get', 'ocid'], ''], 0, 2
          ],
          'circle-stroke-color': 'rgba(255,255,255,0.4)',
          'circle-opacity': 0.92,
        },
      })

      // Click handlers
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = (features[0].properties as { cluster_id: number }).cluster_id
        const src = map.getSource('matches') as mapboxgl.GeoJSONSource
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || features[0].geometry.type !== 'Point') return
          map.easeTo({ center: features[0].geometry.coordinates as [number, number], zoom: zoom ?? 12 })
        })
      })

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

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const src = mapRef.current.getSource('matches') as mapboxgl.GeoJSONSource | undefined
    src?.setData(buildGeoJSON(matches, activeFilter, selectedOcid))
  }, [matches, activeFilter, selectedOcid, mapLoaded])

  return <div ref={containerRef} className="absolute inset-0" />
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
        geometry: { type: 'Point' as const, coordinates: [m.gara_lng!, m.gara_lat!] },
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
