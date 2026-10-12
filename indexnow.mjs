// Meldt de URL's uit de live sitemap bij IndexNow (Bing, Yandex, Seznam).
// Bing voedt ook ChatGPT-zoeken en Copilot. Draaien ná een deploy:
// 200/202 is goed, 403 betekent dat het sleutelbestand nog niet live staat.
const host = 'www.drinkelan.com'
const key = '0d8d2508f77988b6b05b6a110c2cb5b1'
const xml = await (await fetch(`https://${host}/sitemap.xml`)).text()
const urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList }),
})
console.log(`IndexNow: ${urlList.length} URL's → ${res.status}`)
