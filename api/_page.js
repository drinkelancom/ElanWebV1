/* Gedeelde opmaak voor de schermen die de server zelf tekent: het
 * moderatie-overzicht en de losse meldingen daaromheen.
 *
 * Geen externe lettertypen of scripts — deze pagina's moeten het ook doen
 * als er verder niets laadt.
 */

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

export function stars(rating) {
  const n = Math.max(0, Math.min(5, Number(rating) || 0))
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

export const STYLE = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#fffaee;color:#14130f;
       line-height:1.6;display:grid;place-items:center;min-height:100vh;padding:24px}
  .card{background:#fff;border:1px solid rgba(20,19,15,.12);border-radius:24px;
        padding:36px;max-width:520px;width:100%;
        box-shadow:0 30px 60px -34px rgba(18,40,25,.35)}
  h1{font-family:Georgia,serif;font-size:28px;line-height:1.15;margin-bottom:10px}
  p{color:#6b6a66}
  .meta{font-size:14px;color:#6b6a66;margin-top:10px}
  .stars{color:#f0a53c;font-size:19px;letter-spacing:2px}
  .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
  button{font:inherit;font-weight:700;font-size:15px;padding:14px 28px;border:none;
         border-radius:999px;cursor:pointer;background:#51b83e;color:#fff}
  a{color:#3f9430}
`

export function shell(title, body, extraStyle = '') {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)} — ÉLAN</title>
<style>${STYLE}${extraStyle}</style></head><body>${body}</body></html>`
}

export function page(title, body) {
  return shell(title, `<div class="card"><h1>${esc(title)}</h1><p>${body}</p></div>`)
}
