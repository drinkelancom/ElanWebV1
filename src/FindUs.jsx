import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { locations, typeColors, typeLabels } from './locations.js'

// Camera-standen voor de globe.
const NL_POV = { lat: 52.15, lng: 5.3, altitude: 0.55 } // ingezoomd op Nederland
const WORLD_POV = { lat: 30, lng: 8, altitude: 2.5 }     // hele wereld

// Afstand (haversine) in km.
const distKm = (a, b) => {
  const R = 6371
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}
const fmtDist = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`)

// Houdt de Leaflet-kaartinstantie bij zodat we ernaartoe kunnen vliegen.
function MapController({ onReady }) {
  const map = useMap()
  useEffect(() => { onReady(map) }, [map, onReady])
  return null
}

export default function FindUs() {
  const globeEl = useRef()
  const wrapRef = useRef()
  const mapRef = useRef(null)
  const timers = useRef([])
  const pendingWorld = useRef(false)
  const [countries, setCountries] = useState({ features: [] })
  const [size, setSize] = useState({ w: 800, h: 600 })
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('map')   // 'map' (Nederland) | 'globe' (wereld)
  const [globeOn, setGlobeOn] = useState(false) // globe pas laden bij eerste gebruik
  const [types, setTypes] = useState(() => new Set(Object.keys(typeLabels)))
  const [userPos, setUserPos] = useState(null)
  const [geoState, setGeoState] = useState('idle') // idle | loading | ok | error

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)) }

  // Landen-GeoJSON laden zodra de globe nodig is.
  useEffect(() => {
    if (!globeOn) return
    fetch('/countries.geojson').then((r) => r.json()).then(setCountries).catch(() => {})
  }, [globeOn])

  // Stage opmeten (beide lagen vullen dezelfde container)
  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return
      const r = wrapRef.current.getBoundingClientRect()
      setSize({ w: Math.max(320, r.width), h: Math.max(320, r.height) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => { ro.disconnect(); clearTimers() }
  }, [])

  const globeMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({ color: '#13211a', transparent: true, opacity: 0.96, shininess: 5 }),
    []
  )

  // Merkmarkers: druppelvormige pins per type (+ actieve variant) en de gebruiker.
  const icons = useMemo(() => {
    const m = {}
    for (const t of Object.keys(typeColors)) {
      m[t] = L.divIcon({ className: '', html: `<span class="elan-pin" style="--c:${typeColors[t]}"></span>`, iconSize: [26, 34], iconAnchor: [13, 32] })
      m[`${t}-a`] = L.divIcon({ className: '', html: `<span class="elan-pin active" style="--c:${typeColors[t]}"></span>`, iconSize: [34, 44], iconAnchor: [17, 42] })
    }
    m.me = L.divIcon({ className: '', html: '<span class="elan-me"></span>', iconSize: [18, 18], iconAnchor: [9, 9] })
    return m
  }, [])

  // Globe klaar: controls instellen; geparkeerd op NL, evt. meteen doorzoomen naar de wereld.
  const onGlobeReady = useCallback(() => {
    const g = globeEl.current
    if (!g) return
    const c = g.controls()
    c.enableZoom = true
    c.minDistance = 180
    c.maxDistance = 600
    g.pointOfView(NL_POV, 0)
    if (pendingWorld.current) {
      pendingWorld.current = false
      later(() => {
        const gg = globeEl.current
        if (!gg) return
        gg.pointOfView(WORLD_POV, 1800)
        later(() => { gg.controls().autoRotate = true; gg.controls().autoRotateSpeed = 0.5 }, 1850)
      }, 350)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wereld → Nederland: globe zoomt in, daarna crossfade naar de kaart.
  const goToMap = (target) => {
    if (view === 'map') {
      if (target) mapRef.current?.flyTo([target.lat, target.lng], 15, { duration: 1.2 })
      return
    }
    clearTimers()
    if (target) setSelected(target)
    const dest = target || { lat: 52.1, lng: 4.9 }
    const zoom = target ? 15 : 8
    const g = globeEl.current
    if (g) {
      g.resumeAnimation?.()
      g.controls().autoRotate = false
      g.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: target ? 0.3 : NL_POV.altitude }, 1600)
    }
    const m = mapRef.current
    if (m) { m.invalidateSize(); m.setView([dest.lat, dest.lng], zoom, { animate: false }) }
    later(() => {
      setView('map')
      later(() => globeEl.current?.pauseAnimation?.(), 1100)
    }, 850)
  }

  // Nederland → Wereld. Eerste keer: globe pas nu mounten (bespaart WebGL op de kaart).
  const goToGlobe = () => {
    if (view === 'globe') return
    clearTimers()
    if (!globeOn) {
      pendingWorld.current = true
      setGlobeOn(true)
      setView('globe')
      return
    }
    const g = globeEl.current
    if (g) {
      g.resumeAnimation?.()
      g.controls().autoRotate = false
      g.pointOfView(NL_POV, 0)
    }
    setView('globe')
    later(() => {
      const gg = globeEl.current
      if (!gg) return
      gg.pointOfView(WORLD_POV, 1800)
      later(() => { gg.controls().autoRotate = true }, 1850)
    }, 280)
  }

  // Vloeiend naar een locatie navigeren.
  const flyTo = (loc) => {
    setSelected(loc)
    if (view === 'globe') {
      goToMap(loc)
    } else {
      mapRef.current?.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 })
    }
  }

  // "Gebruik mijn locatie": lijst sorteert op afstand, kaart vliegt naar de gebruiker.
  const locate = () => {
    if (!navigator.geolocation) { setGeoState('error'); return }
    setGeoState('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(p)
        setGeoState('ok')
        goToMap()
        later(() => mapRef.current?.flyTo([p.lat, p.lng], 12, { duration: 1.4 }), view === 'globe' ? 950 : 0)
      },
      () => setGeoState('error'),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const toggleType = (t) => {
    setTypes((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return locations.filter((l) =>
      types.has(l.type) &&
      (!q || [l.name, l.city, l.country, l.address].join(' ').toLowerCase().includes(q))
    )
  }, [query, types])

  // Met locatie: één lijst op afstand. Zonder: gegroepeerd per stad.
  const groups = useMemo(() => {
    if (userPos) {
      const sorted = [...filtered].sort((a, b) => distKm(userPos, a) - distKm(userPos, b))
      return [['Dichtstbij jou', sorted]]
    }
    const m = {}
    filtered.forEach((l) => { (m[l.city] = m[l.city] || []).push(l) })
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered, userPos])

  const presentTypes = useMemo(
    () => Object.keys(typeLabels).filter((t) => locations.some((l) => l.type === t)),
    []
  )

  return (
    <div className="findus">
      <aside className="findus-panel">
        <div className="findus-top">
          <a href="#top" className="findus-logo" aria-label="ÉLAN — home">
            <img src="/elan-logo-black.svg" alt="ÉLAN" />
          </a>
          <a href="#top" className="findus-back">← Home</a>
        </div>
        <span className="script findus-script">find your refreshment</span>
        <h1 className="findus-title">Vind ÉLAN bij jou</h1>

        <div className="findus-toggle" role="tablist" aria-label="Weergave">
          <button
            role="tab"
            aria-selected={view === 'map'}
            className={view === 'map' ? 'active' : ''}
            onClick={() => goToMap()}
          >Nederland</button>
          <button
            role="tab"
            aria-selected={view === 'globe'}
            className={view === 'globe' ? 'active' : ''}
            onClick={goToGlobe}
          >Wereld</button>
        </div>

        <div className="findus-actions">
          <input
            className="findus-search"
            placeholder="Zoek op stad, winkel of adres…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className={`findus-locate ${geoState}`}
            onClick={locate}
            title="Gebruik mijn locatie"
            aria-label="Gebruik mijn locatie"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {geoState === 'error' && <p className="findus-geo-error">Locatie niet beschikbaar — check je browserinstellingen.</p>}

        <div className="findus-chips" role="group" aria-label="Filter op type">
          {presentTypes.map((t) => (
            <button
              key={t}
              className={`findus-chip ${types.has(t) ? 'on' : ''}`}
              onClick={() => toggleType(t)}
              aria-pressed={types.has(t)}
            >
              <i style={{ background: typeColors[t] }} />
              {typeLabels[t]}
              <b>{locations.filter((l) => l.type === t).length}</b>
            </button>
          ))}
        </div>

        <div className="findus-count">
          {filtered.length} locaties{userPos ? ' · dichtstbijzijnde eerst' : ''}
        </div>

        <div className="findus-list">
          {groups.length === 0 && <p className="findus-empty">Geen locaties gevonden.</p>}
          {groups.map(([label, locs]) => (
            <div className="findus-group" key={label}>
              <h3>{label} <span>({locs.length})</span></h3>
              {locs.map((l) => (
                <button
                  key={l.id}
                  className={`findus-item ${selected?.id === l.id ? 'active' : ''}`}
                  onClick={() => flyTo(l)}
                >
                  <span className="findus-dot" style={{ background: typeColors[l.type] }} />
                  <span className="findus-item-text">
                    <strong>{l.name}</strong>
                    <small>{l.city}{l.address ? ` · ${l.address}` : ''}</small>
                  </span>
                  {userPos && <span className="findus-dist">{fmtDist(distKm(userPos, l))}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <div className="findus-globe" ref={wrapRef}>
        {/* Wereld-laag (globe) — mount pas bij eerste gebruik */}
        <div className={`findus-layer ${view === 'globe' ? 'show' : ''}`}>
          {globeOn && (
            <Globe
              ref={globeEl}
              width={size.w}
              height={size.h}
              onGlobeReady={onGlobeReady}
              backgroundColor="rgba(0,0,0,0)"
              globeMaterial={globeMaterial}
              showAtmosphere
              atmosphereColor="#7fce6c"
              atmosphereAltitude={0.2}
              hexPolygonsData={countries.features}
              hexPolygonResolution={3}
              hexPolygonMargin={0.34}
              hexPolygonUseDots
              hexPolygonColor={() => 'rgba(127,206,108,0.55)'}
              pointsData={filtered}
              pointLat="lat"
              pointLng="lng"
              pointColor={(d) => typeColors[d.type]}
              pointAltitude={(d) => (selected?.id === d.id ? 0.13 : 0.045)}
              pointRadius={0.55}
              pointLabel={(d) =>
                `<div style="font-family:'Cabinet Grotesk',sans-serif;color:#171411;background:#fffaee;padding:6px 10px;border-radius:8px;font-size:13px;box-shadow:0 6px 16px rgba(0,0,0,.25)"><b>${d.name}</b><br/>${d.city}, ${d.country}</div>`
              }
              onPointClick={flyTo}
              ringsData={selected ? [selected] : []}
              ringLat="lat"
              ringLng="lng"
              ringColor={() => (t) => `rgba(81,184,62,${1 - t})`}
              ringMaxRadius={4}
              ringPropagationSpeed={3}
              ringRepeatPeriod={900}
            />
          )}
        </div>

        {/* Nederland-laag (kaart) */}
        <div className={`findus-layer ${view === 'map' ? 'show' : ''}`}>
          <MapContainer
            center={[52.1, 4.9]}
            zoom={8.5}
            scrollWheelZoom
            zoomControl={false}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController onReady={(m) => { mapRef.current = m }} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &middot; CARTO'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            />
            {filtered.map((l) => (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={selected?.id === l.id ? icons[`${l.type}-a`] : icons[l.type]}
                eventHandlers={{ click: () => setSelected(l) }}
              />
            ))}
            {userPos && <Marker position={[userPos.lat, userPos.lng]} icon={icons.me} interactive={false} />}
          </MapContainer>
        </div>

        {/* Geselecteerde locatie: zwevende kaart met route */}
        {selected && (
          <div className="findus-card">
            <button className="findus-card-close" onClick={() => setSelected(null)} aria-label="Sluiten">×</button>
            <span className="findus-tag" style={{ background: typeColors[selected.type] }}>
              {typeLabels[selected.type]}
            </span>
            <strong>{selected.name}</strong>
            <span className="findus-card-sub">
              {selected.address ? `${selected.address}, ` : ''}{selected.city}
              {userPos ? ` · ${fmtDist(distKm(userPos, selected))}` : ''}
            </span>
            <div className="findus-card-actions">
              <a
                className="btn btn-primary btn-sm"
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >Route →</a>
              {view === 'globe' && (
                <button className="btn btn-outline btn-sm" onClick={() => goToMap(selected)}>Op de kaart</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
