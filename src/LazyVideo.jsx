import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

/* Achtergrondvideo die zijn bron pas ophaalt als hij in de buurt van het scherm
 * komt.
 *
 * Waarom dit nodig is: deze video's hebben `autoPlay`, en dan negeert de
 * browser `preload="none"`. Zonder deze component haalt de homepage de ocean-,
 * coconut- en movement-video (samen ruim 13 MB) binnen voordat de bezoeker ze
 * ook maar in beeld heeft gehad. De poster staat er meteen, dus visueel
 * verandert er niets aan het moment van laden — alleen aan wat er over de lijn
 * gaat.
 *
 * De ref wordt doorgegeven, want BottleScroll stuurt zijn video zelf aan.
 */
const LazyVideo = forwardRef(function LazyVideo({ src, poster, ...rest }, buitenRef) {
  const eigenRef = useRef(null)
  const [inBeeld, setInBeeld] = useState(false)
  useImperativeHandle(buitenRef, () => eigenRef.current, [inBeeld])

  useEffect(() => {
    const el = eigenRef.current
    if (!el) return
    // Zonder IntersectionObserver (oude browsers) gewoon meteen laden.
    if (typeof IntersectionObserver !== 'function') { setInBeeld(true); return }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setInBeeld(true); io.disconnect() }
      },
      { rootMargin: '400px' }, // ruim op tijd, zodat hij al draait bij aankomst
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // autoPlay pakt niet altijd wanneer de src ná de eerste render verschijnt.
  useEffect(() => {
    if (!inBeeld) return
    const el = eigenRef.current
    if (el && rest.autoPlay) el.play?.().catch(() => {})
  }, [inBeeld, rest.autoPlay])

  return (
    <video
      ref={eigenRef}
      poster={poster}
      src={inBeeld ? src : undefined}
      preload={inBeeld ? 'metadata' : 'none'}
      {...rest}
    />
  )
})

export default LazyVideo
