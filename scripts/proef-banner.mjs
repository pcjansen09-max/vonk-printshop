import { chromium } from "playwright"
import fs from "node:fs"

const BASIS = process.argv[2] || "http://localhost:4712"
const UIT = "/tmp/vonk-banner-shots"
fs.mkdirSync(UIT, { recursive: true })

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
})
const fouten = []
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on("console", (m) => { if (m.type() === "error") fouten.push(`console: ${m.text()}`) })
page.on("pageerror", (e) => fouten.push(`pageerror: ${e.message}`))

async function schiet(naam) {
  await page.waitForTimeout(450)
  await page.screenshot({ path: `${UIT}/${naam}.png`, fullPage: false })
}

// 1. Bannerpagina
await page.goto(`${BASIS}/banners`, { waitUntil: "networkidle" })
await schiet("01-banner-start")
const beginPrijs = await page.locator("text=/Totaal/i").first().isVisible()
console.log("prijsblok zichtbaar:", beginPrijs)

// 2. Eigen maat: 300 bij 100 moet gewoon kunnen (dwars op de rol)
const breedte = page.getByLabel("Breedte in centimeter")
const hoogte = page.getByLabel("Hoogte in centimeter")
await breedte.fill("300"); await hoogte.fill("100")
await page.waitForTimeout(300)
const na300 = await page.locator("body").innerText()
console.log("300x100 geweigerd? (hoort false te zijn)", /bel ons dan even/.test(na300))
await schiet("02-banner-300x100")

// 3. Beide maten te breed: dat hoort wel geweigerd te worden
await breedte.fill("200"); await hoogte.fill("200")
await page.waitForTimeout(300)
const na200 = await page.locator("body").innerText()
console.log("200x200 geweigerd? (hoort true te zijn)", /bel ons dan even/.test(na200))
await schiet("03-banner-te-breed")

// terug naar iets normaals
await breedte.fill("300"); await hoogte.fill("150")
await page.waitForTimeout(300)

// 4. Groot bestand uploaden: hoort goedgekeurd te worden voor een banner
await page.setInputFiles('input[type="file"]', "/tmp/vonk-test/ontwerp-groot.png")
await page.waitForTimeout(900)
const naUpload = await page.locator("body").innerText()
console.log("oordeel banner groot bestand:", (naUpload.match(/Scherp genoeg[^\n]*/) || ["GEEN"])[0])
console.log("ontwerp in het voorbeeld:", await page.locator('img[alt=""]').first().isVisible())
await schiet("04-banner-bestand-goed")

// 5. Prijs en winkelwagen
const totaalTekst = await page.locator("text=/Te betalen|Totaal/i").first().textContent()
console.log("prijsregel:", totaalTekst?.trim())
await page.getByRole("button", { name: /In winkelwagen/i }).click()
await page.waitForTimeout(400)
await page.goto(`${BASIS}/winkelwagen`, { waitUntil: "networkidle" })
const wagen = await page.locator("body").innerText()
console.log("banner in wagen:", /banner op maat/i.test(wagen))
console.log("bestandsnaam in wagen:", /ontwerp-groot\.png/.test(wagen))
await schiet("05-winkelwagen")

// 6. Poster met een schermplaatje: hoort afgekeurd te worden
await page.goto(`${BASIS}/drukwerk`, { waitUntil: "networkidle" })
await page.getByRole("button", { name: /^A2\b/ }).click()
await page.setInputFiles('input[type="file"]', "/tmp/vonk-test/schermplaatje.png")
await page.waitForTimeout(900)
const poster = await page.locator("body").innerText()
console.log("oordeel poster schermplaatje:", (poster.match(/Dit bestand is \d+ punten[^\n]*/) || poster.match(/Dit kan net[^\n]*/) || ["GEEN"])[0].slice(0, 120))
await schiet("06-poster-afgekeurd")

// 7. Zelfde bestand op A4: moet daar ruimer over doen
await page.getByRole("button", { name: /^A4\b/ }).click()
await page.waitForTimeout(600)
const a4 = await page.locator("body").innerText()
console.log("oordeel poster A4:", (a4.match(/(Scherp genoeg|Dit kan net|Dit bestand is)[^\n]*/) || ["GEEN"])[0].slice(0, 120))
await schiet("07-poster-a4")

// 8. Mobiel: geen zijwaartse schuif
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
mob.on("pageerror", (e) => fouten.push(`mobiel pageerror: ${e.message}`))
for (const pad of ["/banners", "/drukwerk"]) {
  await mob.goto(`${BASIS}${pad}`, { waitUntil: "networkidle" })
  await mob.waitForTimeout(500)
  const over = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log(`mobiel ${pad} zijwaarts over:`, over, "px")
  await mob.screenshot({ path: `${UIT}/mob${pad.replace(/\//g, "-")}.png` })
}

console.log("\nfouten:", fouten.length ? fouten : "geen")
await browser.close()
