import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// ── Eigen 3D-model? ──────────────────────────────────────────────
// Zet je eigen pak als .glb (aanbevolen) of .gltf in de map /public en vul de
// bestandsnaam hieronder in. Wordt automatisch geladen, gecentreerd en op maat
// geschaald. Bestaat het bestand niet, dan blijft het ingebouwde pak staan.
const MODEL_URL = '/elan-pak.glb'
const MODEL_HEIGHT = 2.6 // gewenste hoogte in de scène (schaalt je model passend)
// ─────────────────────────────────────────────────────────────────

// Merkkleuren
const IVORY = '#FFFAEE'
const GREEN = '#51B83E'
const GREEN_DARK = '#2f8f23'
const INK = '#171411'
const GREY = '#53565A'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

// Merkfonts (Fontshare). Vallen terug op systeemfonts tot ze geladen zijn.
const SERIF = "'Zodiak', Georgia, serif"
const SANS = "'Cabinet Grotesk', Helvetica, Arial, sans-serif"
const LABEL_W = 560, LABEL_H = 1180

// Tekent een labelpaneel op een bestaand 2D-canvas.
function drawLabel(c, kind) {
  const W = LABEL_W, H = LABEL_H
  const x = c.getContext('2d')
  x.clearRect(0, 0, W, H)
  x.fillStyle = IVORY
  x.fillRect(0, 0, W, H)

  if (kind === 'front') {
    x.fillStyle = INK
    x.textAlign = 'center'
    x.font = `800 96px ${SERIF}`
    x.fillText('ÉLAN', W / 2, 152)

    x.fillStyle = GREEN
    const pillW = 300, pillH = 56, px = W / 2 - pillW / 2, py = 200
    roundRect(x, px, py, pillW, pillH, 28); x.fill()
    x.fillStyle = '#fff'
    x.font = `700 30px ${SANS}`
    x.fillText('100% PURE', W / 2, py + 38)

    x.fillStyle = INK
    x.font = `800 86px ${SANS}`
    x.fillText('COCONUT', W / 2, 360)
    x.fillStyle = GREEN_DARK
    x.fillText('WATER', W / 2, 452)

    drawCoconut(x, W / 2, 720, 150)

    x.fillStyle = GREEN
    roundRect(x, W / 2 - 130, 980, 260, 70, 35); x.fill()
    x.fillStyle = '#fff'
    x.font = `800 40px ${SANS}`
    x.fillText('500 ml', W / 2, 1028)

    x.fillStyle = GREY
    x.font = `600 24px ${SANS}`
    x.fillText('NO ADDED SUGAR · VEGAN', W / 2, 1110)
  } else if (kind === 'back') {
    x.fillStyle = INK
    x.textAlign = 'center'
    x.font = `800 64px ${SERIF}`
    x.fillText('ÉLAN', W / 2, 120)
    x.fillStyle = GREY
    x.font = `400 26px ${SANS}`
    wrapText(x, 'Puur kokoswater, niet uit concentraat. Verfrissend, licht zoet en van nature vol elektrolyten.', W / 2, 190, 460, 38)
    x.strokeStyle = '#d8d3c4'; x.lineWidth = 2
    roundRect(x, 70, 360, W - 140, 380, 18); x.stroke()
    x.fillStyle = INK; x.textAlign = 'left'
    x.font = `700 28px ${SANS}`
    x.fillText('Voedingswaarde (per 100 ml)', 100, 410)
    x.font = `400 24px ${SANS}`; x.fillStyle = GREY
    const rows = [['Energie', '19 kcal'], ['Koolhydraten', '4.5 g'], ['waarvan suikers', '4.5 g'], ['Eiwitten', '0 g'], ['Zout', '0.04 g'], ['Kalium', '250 mg']]
    rows.forEach((r, i) => { const y = 455 + i * 44; x.fillText(r[0], 100, y); x.textAlign = 'right'; x.fillText(r[1], W - 100, y); x.textAlign = 'left' })
    x.textAlign = 'center'; x.fillStyle = GREY
    x.font = `600 22px ${SANS}`
    x.fillText('ELAN WORLD BV · drinkelan.com', W / 2, 1100)
  } else {
    x.fillStyle = GREEN
    x.fillRect(0, 0, 14, H); x.fillRect(W - 14, 0, 14, H)
    x.save(); x.translate(W / 2, H / 2); x.rotate(-Math.PI / 2)
    x.fillStyle = INK; x.textAlign = 'center'
    x.font = `800 54px ${SERIF}`
    x.fillText('ÉLAN · 100% PURE COCONUT WATER', 0, 0)
    x.restore()
  }
}

// Maakt een textuur (canvas onthouden via tex.image voor herteken na font-load).
function makeLabel(kind) {
  const c = document.createElement('canvas')
  c.width = LABEL_W; c.height = LABEL_H
  drawLabel(c, kind)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.userData.kind = kind
  return tex
}

function roundRect(x, X, Y, w, h, r) {
  x.beginPath()
  x.moveTo(X + r, Y)
  x.arcTo(X + w, Y, X + w, Y + h, r)
  x.arcTo(X + w, Y + h, X, Y + h, r)
  x.arcTo(X, Y + h, X, Y, r)
  x.arcTo(X, Y, X + w, Y, r)
  x.closePath()
}
function wrapText(x, text, cx, cy, maxW, lh) {
  const words = text.split(' '); let line = '', y = cy
  for (const w of words) {
    const test = line + w + ' '
    if (x.measureText(test).width > maxW && line) { x.fillText(line.trim(), cx, y); line = w + ' '; y += lh }
    else line = test
  }
  x.fillText(line.trim(), cx, y)
}
function drawCoconut(x, cx, cy, r) {
  // halve kokosnoot met groene blik
  x.save()
  x.fillStyle = '#6b4a2b'
  x.beginPath(); x.arc(cx, cy, r, Math.PI, 0); x.closePath(); x.fill()
  x.fillStyle = '#fff'
  x.beginPath(); x.ellipse(cx, cy, r * 0.82, r * 0.42, 0, Math.PI, 0); x.closePath(); x.fill()
  x.fillStyle = '#f0ece0'
  x.beginPath(); x.ellipse(cx, cy, r * 0.55, r * 0.26, 0, Math.PI, 0); x.closePath(); x.fill()
  // groen blad
  x.fillStyle = GREEN
  x.beginPath(); x.ellipse(cx + r * 0.4, cy - r * 0.5, r * 0.5, r * 0.16, -0.6, 0, Math.PI * 2); x.fill()
  x.fillStyle = GREEN_DARK
  x.beginPath(); x.ellipse(cx - r * 0.3, cy - r * 0.4, r * 0.42, r * 0.13, 0.5, 0, Math.PI * 2); x.fill()
  x.restore()
}

export default function Carton3D() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const capRefs = useRef([])
  const progRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0, 7.0)

    // Zachte omgevingsreflectie voor realistische materialen (ook voor eigen .glb)
    let envRT
    try {
      const pmrem = new THREE.PMREMGenerator(renderer)
      envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
      scene.environment = envRT.texture
      pmrem.dispose()
    } catch (e) { /* omgeving optioneel */ }

    // Belichting
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe3d6, 0.85))
    const key = new THREE.DirectionalLight(0xffffff, 2.1)
    key.position.set(4, 6, 5); scene.add(key)
    const fill = new THREE.DirectionalLight(0xeaf3e2, 0.7)
    fill.position.set(-5, 1, 3); scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 1.1)
    rim.position.set(-2, 3, -6); scene.add(rim)

    // Pak (Tetra-brick met groene dop)
    const group = new THREE.Group()
    const W = 1.15, H = 2.4, D = 0.72
    const front = makeLabel('front'), back = makeLabel('back'), side = makeLabel('side')
    // Herteken labels zodra de merkfonts geladen zijn.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        ;[front, back, side].forEach((t) => { drawLabel(t.image, t.userData.kind); t.needsUpdate = true })
      })
    }
    const paper = (map) => new THREE.MeshStandardMaterial({ map, color: 0xffffff, roughness: 0.72, metalness: 0.02 })
    const plain = new THREE.MeshStandardMaterial({ color: new THREE.Color(IVORY), roughness: 0.8, metalness: 0.02 })
    // BoxGeometry materiaalvolgorde: +X,-X,+Y,-Y,+Z,-Z
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, D, 1, 1, 1),
      [paper(side), paper(side), plain, plain, paper(front), paper(back)]
    )
    group.add(body)

    // schuine bovenrand (Tetra Prisma-look): dunne wig bovenop
    const topWedge = new THREE.Mesh(
      new THREE.BoxGeometry(W, 0.12, D),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(IVORY), roughness: 0.7 })
    )
    topWedge.position.y = H / 2 + 0.05
    topWedge.rotation.z = 0.04
    group.add(topWedge)

    // dop
    const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(GREEN), roughness: 0.35, metalness: 0.15 })
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.26, 28), capMat)
    cap.position.set(W * 0.22, H / 2 + 0.22, 0)
    group.add(cap)
    const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.05, 28), capMat)
    capTop.position.set(W * 0.22, H / 2 + 0.36, 0)
    group.add(capTop)

    scene.add(group)

    // Eigen 3D-model laden (indien aanwezig) — vervangt het ingebouwde pak.
    let disposed = false
    const proceduralParts = [body, topWedge, cap, capTop]
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return
        // ingebouwd pak weghalen
        proceduralParts.forEach((m) => {
          group.remove(m)
          m.geometry?.dispose()
          ;[].concat(m.material).forEach((mm) => mm?.dispose?.())
        })
        const model = gltf.scene
        // centreren in de oorsprong en op MODEL_HEIGHT schalen
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const s = MODEL_HEIGHT / (size.y || 1)
        model.scale.setScalar(s)
        model.position.set(-center.x * s, -center.y * s, -center.z * s)
        group.add(model)
      },
      undefined,
      () => { /* geen bestand gevonden → ingebouwd pak blijft staan */
        console.info(`[ÉLAN 3D] Geen eigen model op ${MODEL_URL} — ingebouwd pak gebruikt. Plaats een .glb in /public om te vervangen.`)
      }
    )

    // Zachte schaduw-plane onder het pak
    const shadowTex = makeRadialShadow()
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.6),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.33, depthWrite: false })
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -H / 2 - 0.18
    scene.add(shadow)

    // Resize
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const w = Math.max(1, r.width), h = Math.max(1, r.height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Scrollvoortgang door de sectie (0 = net in beeld, 1 = net eruit)
    const updateProgress = () => {
      const rect = section.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      progRef.current = clamp(-rect.top / Math.max(1, total), 0, 1)
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    // Animatielus met soepele lerp
    let raf
    let curRot = 0, curX = 0, curY = 0, curScale = 1, t0 = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now
      const p = progRef.current
      const e = easeInOut(p)
      // doelwaarden afhankelijk van scroll
      const targetRot = p * Math.PI * 2.4 + now * 0.00018      // draait door met scroll + lichte idle
      const targetX = Math.sin(p * Math.PI * 2) * 1.25          // schuift heen en weer
      const targetY = Math.sin(p * Math.PI) * 0.18 + Math.sin(now * 0.001) * 0.04
      const targetScale = lerp(0.82, 1.0, Math.sin(e * Math.PI)) // groeit naar het midden
      const k = 1 - Math.pow(0.0015, dt) // framerate-onafhankelijke demping
      curRot = lerp(curRot, targetRot, k)
      curX = lerp(curX, targetX, k)
      curY = lerp(curY, targetY, k)
      curScale = lerp(curScale, targetScale, k)
      group.rotation.y = curRot
      group.rotation.x = Math.sin(p * Math.PI * 2) * 0.12
      group.position.set(curX, curY, 0)
      group.scale.setScalar(curScale)
      shadow.position.x = curX
      shadow.scale.setScalar(curScale)

      // bijschriften faden op basis van fase
      capRefs.current.forEach((el, i) => {
        if (!el) return
        const center = (i + 0.5) / capRefs.current.length
        const d = Math.abs(p - center)
        const vis = clamp(1 - d * 4.2, 0, 1)
        el.style.opacity = vis.toFixed(3)
        el.style.transform = `translateY(${(1 - vis) * 30}px)`
      })

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      renderer.dispose()
      envRT?.dispose()
      ;[front, back, side, shadowTex].forEach((t) => t.dispose())
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => m.dispose()) })
    }
  }, [])

  const captions = [
    { t: '100% Puur', s: 'Niet uit concentraat, alleen kokoswater.' },
    { t: 'Van nature verfrissend', s: 'Licht zoet en vol elektrolyten.' },
    { t: 'Onderweg', s: '500 ml hersluitbaar pak met dop.' },
  ]

  return (
    <section className="showcase3d" ref={sectionRef} id="product3d">
      <div className="showcase3d-sticky">
        <canvas ref={canvasRef} className="showcase3d-canvas" />
        <div className="showcase3d-captions">
          {captions.map((c, i) => (
            <div key={i} className={`showcase3d-cap cap-${i}`} ref={(el) => (capRefs.current[i] = el)}>
              <span className="eyebrow">ÉLAN</span>
              <h3>{c.t}</h3>
              <p>{c.s}</p>
            </div>
          ))}
        </div>
        <div className="showcase3d-hint">scroll ↓</div>
      </div>
    </section>
  )
}

// Zachte ronde schaduw als textuur
function makeRadialShadow() {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const x = c.getContext('2d')
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 128)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
