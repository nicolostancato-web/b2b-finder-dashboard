'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
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
  onSelectMatch: (match: Match) => void
}

export default function MapView({
  matches,
  centerLat,
  centerLng,
  activeFilter,
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
      maxBounds: [[-5, 35], [20, 48]],
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    map.on('load', () => {
      setMapLoaded(true)

      // Layer cluster source
      map.addSource('matches', {
        type: 'geojson',
        data: buildGeoJSON(matches, null),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 40,
      })

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'matches',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3B82F6',
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 28],
          'circle-opacity': 0.85,
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

      // Single points
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'matches',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'score'],
            60, 6, 80, 9, 100, 13
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.3)',
          'circle-opacity': 0.9,
        },
      })

      // Click cluster → zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = (features[0].properties as { cluster_id: number }).cluster_id
        const src = map.getSource('matches') as mapboxgl.GeoJSONSource
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !features[0].geometry || features[0].geometry.type !== 'Point') return
          map.easeTo({ center: features[0].geometry.coordinates as [number, number], zoom: zoom ?? 10 })
        })
      })

      // Click single point → popup
      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0]
        if (!feature?.properties) return
        const match = matches.find((m) => m.gara_ocid === feature.properties!.ocid)
        if (match) onSelectMatch(match)
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

  // Aggiorna dati quando cambia filter
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const src = mapRef.current.getSource('matches') as mapboxgl.GeoJSONSource | undefined
    src?.setData(buildGeoJSON(matches, activeFilter))
  }, [matches, activeFilter, mapLoaded])

  return <div ref={containerRef} className="w-full h-full" />
}

function buildGeoJSON(
  matches: Match[],
  filter: string | null
): GeoJSON.FeatureCollection {
  const filtered = filter ? matches.filter((m) => m.match_label === filter) : matches
  return {
    type: 'FeatureCollection',
    features: filtered
      .filter((m) => m.gara_lat != null && m.gara_lng != null)
      .map((m) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [m.gara_lng!, m.gara_lat!] },
        properties: {
          ocid: m.gara_ocid,
          color: COLORS[m.match_label] ?? '#6B6B7B',
          score: m.match_score,
          label: m.match_label,
        },
      })),
  }
}
