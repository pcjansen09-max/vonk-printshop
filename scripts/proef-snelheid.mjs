import { chromium } from "playwright"

/**
 * Hoe zwaar is de 3D geworden?
 *
 * Niet "voelt snel" maar meten: hoeveel beelden per seconde haalt de pagina, en
 * hoe lang duurt het voordat er iets staat. Draait op software-WebGL
 * (SwiftShader), dus de getallen zijn een ondergrens: een echte grafische kaart
 * doet het makkelijker. Als het hier speelbaar is, is het overal speelbaar.
 */
const BASIS = process.env.BASIS || "http://localhost:4760"
const PAGINAS = ["/", "/ontwerpen"]

const b = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
})

for (const breed of [true, false]) {
  const p = await b.newPage(
    breed
      ? { viewport: { width: 1440, height: 900 } }
      : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  )
  for (const pad of PAGINAS) {
    const begin = Date.now()
    await p.goto(BASIS + pad, { waitUntil: "networkidle" })
    const geladen = Date.now() - begin
    await p.waitForTimeout(2500)
    const beelden = await p.evaluate(
      () =>
        new Promise((klaar) => {
          let n = 0
          const start = performance.now()
          const tel = () => {
            n++
            if (performance.now() - start < 2000) requestAnimationFrame(tel)
            else klaar(Math.round((n / (performance.now() - start)) * 1000))
          }
          requestAnimationFrame(tel)
        })
    )
    console.log(
      `${breed ? "breed " : "smal  "} ${pad.padEnd(12)} geladen in ${geladen} ms, ${beelden} beelden/s`
    )
  }
  await p.close()
}
await b.close()
