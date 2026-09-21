/**
 * Het plaatje dat verschijnt als iemand de site deelt in WhatsApp of op
 * LinkedIn.
 *
 * Zonder dit staat er een kale tekstregel, en dat is zonde voor een bedrijf dat
 * juist iets zichtbaars verkoopt. We maken het uit onze eigen productrenders en
 * Vonks eigen verloop, zodat het klopt met de site zelf.
 *
 *   npm run start
 *   node scripts/maak-deelplaatje.mjs
 */
import { chromium } from "playwright"
import fs from "node:fs"
import path from "node:path"

const MAP = process.cwd()
const UIT = path.join(MAP, "app", "opengraph-image.png")

const plaatjes = ["tapknop", "menukaarthouder-amber", "sleutelhanger"].map((n) =>
  "data:image/png;base64," +
  fs.readFileSync(path.join(MAP, "public", "producten", `${n}.png`)).toString("base64")
)

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Bewust; src: local("Helvetica Neue"), local("Arial"); }
  * { margin: 0; box-sizing: border-box }
  body {
    width: 1200px; height: 630px; display: flex; overflow: hidden;
    font-family: "Helvetica Neue", Arial, sans-serif; background: #faf8f6;
  }
  .links { flex: 1 1 56%; padding: 66px 0 66px 72px; display: flex; flex-direction: column; justify-content: center }
  .label { font-size: 19px; letter-spacing: .18em; text-transform: uppercase; color: #8a8085; font-weight: 600 }
  h1 { font-size: 74px; line-height: 1.02; letter-spacing: -.03em; color: #17131a; margin-top: 26px; font-weight: 700 }
  .vonk { background: linear-gradient(96deg,#f8ab21,#ee564a 52%,#e50075); -webkit-background-clip: text; color: transparent }
  p { font-size: 25px; line-height: 1.45; color: #6b6369; margin-top: 26px; max-width: 15.5em }
  .voet { margin-top: 40px; font-size: 20px; letter-spacing: .1em; text-transform: uppercase; color: #17131a; font-weight: 600 }
  .rechts { flex: 1 1 44%; position: relative; background:
     radial-gradient(120% 90% at 74% 22%, rgba(248,171,33,.24), transparent 62%),
     radial-gradient(110% 95% at 30% 92%, rgba(229,0,117,.22), transparent 60%), #f3eff1 }
  .rechts img { position: absolute; filter: drop-shadow(0 26px 44px rgba(23,19,26,.24)) }
  .a { width: 300px; left: 34px; top: 78px }
  .b { width: 340px; right: -6px; top: 236px }
  .c { width: 190px; left: 120px; bottom: 10px }
</style>
<div class="links">
  <div class="label">Vonk Schagen · Leerbedrijf</div>
  <h1>3D printen,<br>posters en <span class="vonk">banners.</span></h1>
  <p>Upload je bestand, zie meteen wat het kost en volg je print live.</p>
  <div class="voet">vonkprintshop · Schagen</div>
</div>
<div class="rechts">
  <img class="a" src="${plaatjes[0]}">
  <img class="b" src="${plaatjes[1]}">
  <img class="c" src="${plaatjes[2]}">
</div>`

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await p.setContent(html, { waitUntil: "load" })
await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode())))
await p.screenshot({ path: UIT })
await b.close()

const kb = Math.round(fs.statSync(UIT).size / 1024)
console.log(`klaar: app/opengraph-image.png, 1200x630, ${kb} kB`)
