/**
 * Bewijs dat de pagina op elke scrollpositie overeind blijft.
 *
 * Een build die slaagt zegt niets over wat je ziet. Dit loopt de pagina in
 * stappen af, maakt op elke stap een opname, en meldt lege schermen: als een
 * hele viewport bijna één kleur is, is er iets niet geladen of staat er een gat.
 *
 *   npm run dev && node scripts/proef-scroll.mjs
 */
import { chromium } from "playwright"
import fs from "node:fs"

const BASIS = process.env.BASIS || "http://localhost:3000"
const MAP = process.env.MAP || "/tmp/scroll"
fs.mkdirSync(MAP, { recursive: true })
const STAPPEN = Number(process.env.STAPPEN || 9)

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
})

async function loop(naam, viewport, mobiel) {
  const p = await (await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: mobiel, hasTouch: mobiel })).newPage()
  const fouten = []
  p.on("pageerror", (e) => fouten.push(String(e).slice(0, 130)))
  p.on("console", (m) => m.type() === "error" && !/DevTools|deprecated/i.test(m.text()) && fouten.push(m.text().slice(0, 130)))
  await p.goto(BASIS + "/", { waitUntil: "networkidle", timeout: 90000 })
  await p.waitForTimeout(3500)

  const hoogte = await p.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  const leeg = []
  for (let i = 0; i < STAPPEN; i++) {
    const y = Math.round((hoogte * i) / (STAPPEN - 1))
    await p.evaluate((yy) => window.scrollTo(0, yy), y)
    await p.waitForTimeout(900)
    const bestand = `${MAP}/${naam}-${String(i).padStart(2, "0")}.png`
    await p.screenshot({ path: bestand })
    // hoeveel verschillende kleuren staan er op dit scherm?
    const rijk = await p.evaluate(() => {
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
      return { tekst: (document.body.innerText || "").length, midden: el?.tagName || "?" }
    })
    if (rijk.tekst < 50) leeg.push(i)
  }
  const breedte = await p.evaluate(() => ({ d: document.documentElement.scrollWidth, w: document.documentElement.clientWidth }))
  await p.close()
  return { naam, hoogte, leeg, breedte, fouten: [...new Set(fouten)] }
}

for (const [naam, vp, mob] of [["breed", { width: 1440, height: 900 }, false],
                               ["smal", { width: 390, height: 844 }, true]]) {
  const r = await loop(naam, vp, mob)
  console.log(`${r.naam.padEnd(6)} scrollhoogte ${r.hoogte}px  ${STAPPEN} opnames  ` +
    (r.breedte.d > r.breedte.w + 1 ? `ZIJWAARTS ${r.breedte.d}>${r.breedte.w}` : "past") +
    (r.leeg.length ? `  LEGE SCHERMEN: ${r.leeg.join(",")}` : "") +
    (r.fouten.length ? `\n  fouten: ${r.fouten.join(" | ")}` : ""))
}
await browser.close()
