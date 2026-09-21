/**
 * Loopt de hele site door met een echte browser.
 *
 * Toetst drie dingen die een unit-test niet ziet: dat elke pagina laadt zonder
 * fouten in de console, dat er op een telefoon nergens horizontaal gescrold
 * moet worden, en dat de weg van model uploaden tot bestelnummer echt werkt.
 *
 *   npm run dev
 *   node scripts/doorloop.mjs
 */
import { chromium } from "playwright"

const BASIS = process.env.BASIS || "http://localhost:3000"
const uit = []
let stuk = 0
function meld(stap, ok, extra = "") {
  uit.push(`${ok ? "OK  " : "FOUT"}  ${stap}${extra ? " — " + extra : ""}`)
  if (!ok) stuk++
}

const PAGINAS = [
  ["/", "Je model erin"],
  ["/3d-printen", "Upload je model"],
  ["/ontwerpen", "Jouw kleur"],
  ["/drukwerk", "Op papier"],
  ["/banners", "Zo groot als je hek is"],
  ["/volgen", "Kijk mee met de printer"],
  ["/winkelwagen", "Wat je hebt uitgekozen"],
  ["/bestellen", "gegevens"],
  ["/over-ons", "printshop van Vonk"],
]

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
})

// ---------------------------------------------------------- elke pagina laadt
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const consolefouten = []
p.on("console", (m) => {
  if (m.type() !== "error") return
  const t = m.text()
  // De waarschuwing van three over een verouderde Clock komt uit de bibliotheek
  // zelf en zegt niets over deze site.
  if (/deprecated|DevTools/i.test(t)) return
  consolefouten.push(t.slice(0, 160))
})
p.on("pageerror", (e) => consolefouten.push("pageerror: " + String(e).slice(0, 160)))

for (const [pad, verwacht] of PAGINAS) {
  const r = await p.goto(BASIS + pad, { waitUntil: "networkidle", timeout: 45000 })
  const tekst = await p.locator("body").innerText()
  meld(
    `pagina ${pad}`,
    r?.status() === 200 && tekst.includes(verwacht),
    r?.status() !== 200 ? `status ${r?.status()}` : tekst.includes(verwacht) ? "" : `"${verwacht}" ontbreekt`
  )
}

// ---------------------------------------------------- niets steekt uit op mobiel
const mob = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage()
for (const [pad] of PAGINAS) {
  await mob.goto(BASIS + pad, { waitUntil: "networkidle", timeout: 45000 })
  await mob.waitForTimeout(600)
  const m = await mob.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: document.documentElement.clientWidth,
  }))
  meld(`geen zijwaarts scrollen op ${pad}`, m.doc <= m.win + 1, m.doc > m.win + 1 ? `${m.doc} > ${m.win}` : "")
}

// --------------------------------------------- de hele weg: model tot bestelling
await p.goto(BASIS + "/3d-printen", { waitUntil: "networkidle" })
await p.setInputFiles('input[type="file"]', "/tmp/proefbalkje.stl")
await p.waitForTimeout(2500)

const inhoud = await p.locator("body").innerText()
meld("STL wordt uitgelezen", /21[,.]6 cm/.test(inhoud), inhoud.match(/[\d,.]+ cm³/)?.[0] ?? "geen inhoud gevonden")
meld("afmeting klopt", /60 × 30 × 12 mm/.test(inhoud))
meld("prijs verschijnt", /totaal inclusief btw/i.test(inhoud))

// de prijs moet meebewegen met de instellingen
const prijsNu = async () =>
  parseFloat(
    (await p.locator("tfoot td").last().innerText()).replace(/[^\d,]/g, "").replace(",", ".")
  )
const voor = await prijsNu()
await p.getByRole("button", { name: "Eén meer" }).click()
await p.waitForTimeout(400)
const na = await prijsNu()
meld("prijs beweegt mee met het aantal", na > voor, `${voor} → ${na}`)

await p.getByRole("button", { name: /In winkelwagen/i }).click()
await p.waitForTimeout(600)

// drukwerk erbij
await p.goto(BASIS + "/drukwerk", { waitUntil: "networkidle" })
await p.getByRole("button", { name: /In winkelwagen/i }).click()
await p.waitForTimeout(600)

await p.goto(BASIS + "/winkelwagen", { waitUntil: "networkidle" })
const wagen = await p.locator("body").innerText()
meld("beide regels staan in de winkelwagen", /proefbalkje/i.test(wagen) && /A3/.test(wagen))

await p.goto(BASIS + "/bestellen", { waitUntil: "networkidle" })
await p.getByRole("button", { name: /Bestelling plaatsen/i }).click()
await p.waitForTimeout(500)
meld(
  "bestellen zonder gegevens wordt tegengehouden",
  /naam nodig/i.test(await p.locator("body").innerText())
)

await p.fill("#naam", "Bert de Wit")
await p.fill("#email", "bert@heremetijdje.nl")
await p.getByRole("button", { name: /Bestelling plaatsen/i }).click()
await p.waitForTimeout(900)
const bevestiging = await p.locator("body").innerText()
const nummer = bevestiging.match(/VP-20\d{2}-\d{4}/)?.[0]
meld("bestelling krijgt een nummer", !!nummer, nummer ?? "geen nummer gevonden")

if (nummer) {
  await p.goto(`${BASIS}/volgen?bestelling=${nummer}`, { waitUntil: "networkidle" })
  await p.waitForTimeout(2500)
  const volg = await p.locator("body").innerText()
  meld("de print is te volgen", volg.includes(nummer) && /%/.test(volg))
  meld("er staat eerlijk bij dat het nog een voorbeeld is", /Voorbeeld/.test(volg))
}

await p.goto(BASIS + "/winkelwagen", { waitUntil: "networkidle" })
meld("de winkelwagen is na het bestellen leeg", /winkelwagen is nog leeg/i.test(await p.locator("body").innerText()))

console.log(uit.join("\n"))
console.log(consolefouten.length ? "\nconsole-fouten:\n" + [...new Set(consolefouten)].join("\n") : "\ngeen console-fouten")
console.log(stuk === 0 ? "\nAlles goed." : `\n${stuk} controle(s) mislukt.`)
await browser.close()
process.exit(stuk === 0 && consolefouten.length === 0 ? 0 : 1)
