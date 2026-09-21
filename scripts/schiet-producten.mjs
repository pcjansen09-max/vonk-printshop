/**
 * Schiet de productplaatjes uit onze eigen 3D-modellen.
 *
 * Geen stockfoto's: de site verkoopt deze producten, dus hoort er te staan wat
 * de printer ook echt maakt. Eén keer draaien levert public/producten/*.png op;
 * de site laadt daarna plaatjes in plaats van acht keer WebGL.
 *
 *   npm run dev
 *   node scripts/schiet-producten.mjs
 */
import { chromium } from "playwright"
import fs from "node:fs"
import path from "node:path"

const BASIS = process.env.BASIS || "http://localhost:3000"
const MAP = path.join(process.cwd(), "public", "producten")
fs.mkdirSync(MAP, { recursive: true })

const PRODUCTEN = [
  "menukaarthouder", "tapknop", "tafelnummer", "proeverijbordje",
  "displaystandaard", "sleutelhanger", "folderhouder", "vervangonderdeel",
]

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
})
const p = await (await browser.newContext({
  viewport: { width: 900, height: 900 },
  deviceScaleFactor: 2,
})).newPage()
// de ontwikkelknop van Next hoort niet op een productplaatje
await p.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {})

for (const id of PRODUCTEN) {
  for (const variant of ["", "-amber"]) {
    const naam = id + variant
    await p.goto(`${BASIS}/render/${naam}`, { waitUntil: "networkidle", timeout: 60000 })
    // wachten tot het doek er echt staat en een beeld heeft getekend
    await p.waitForSelector("canvas", { timeout: 30000 })
    await p.waitForTimeout(2200)
    // alleen het doek, niet de pagina: anders staat de navigatiebalk op elk
    // productplaatje
    const doel = path.join(MAP, `${naam}.png`)
    await p.locator("canvas").screenshot({ path: doel, omitBackground: true })
    const kb = Math.round(fs.statSync(doel).size / 1024)
    console.log(`${naam.padEnd(26)} ${kb} kB`)
  }
}
await browser.close()
console.log(`\nklaar: ${fs.readdirSync(MAP).length} plaatjes in public/producten`)
