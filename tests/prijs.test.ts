import { describe, expect, it } from "vitest"
import { leesSTL, volumeVanDriehoeken } from "@/lib/stl/lezen"
import { berekenPrint3D, BOUWVOLUME } from "@/lib/prijs/print3d"
import { berekenDrukwerk, FORMATEN } from "@/lib/prijs/drukwerk"
import { FILAMENTEN } from "@/lib/catalogus"

/** Een kubus van 20 mm, als binaire STL. Volume hoort 8 cm3 te zijn. */
function kubusSTL(mm = 20): ArrayBuffer {
  const h = mm / 2
  const v = (x: number, y: number, z: number) => [x * h, y * h, z * h]
  // 12 driehoeken, tegen de klok in gezien van buiten
  const vlakken: number[][][] = []
  const hoek = [
    v(-1, -1, -1), v(1, -1, -1), v(1, 1, -1), v(-1, 1, -1),
    v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1),
  ]
  const zijden: [number, number, number, number][] = [
    [0, 3, 2, 1], // onder
    [4, 5, 6, 7], // boven
    [0, 1, 5, 4],
    [1, 2, 6, 5],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
  ]
  for (const [a, b, c, d] of zijden) {
    vlakken.push([hoek[a], hoek[b], hoek[c]])
    vlakken.push([hoek[a], hoek[c], hoek[d]])
  }
  const buf = new ArrayBuffer(84 + vlakken.length * 50)
  const dv = new DataView(buf)
  dv.setUint32(80, vlakken.length, true)
  let o = 84
  for (const t of vlakken) {
    o += 12 // normaal laten we op nul; een lezer hoort die niet te geloven
    for (const p of t) {
      dv.setFloat32(o, p[0], true)
      dv.setFloat32(o + 4, p[1], true)
      dv.setFloat32(o + 8, p[2], true)
      o += 12
    }
    o += 2
  }
  return buf
}

describe("een STL-bestand lezen", () => {
  it("leest alle driehoeken van een binaire STL", () => {
    const m = leesSTL(kubusSTL())
    expect(m.driehoeken).toBe(12)
  })

  it("rekent het volume van een kubus van 20 mm goed uit", () => {
    // 2 x 2 x 2 cm = 8 cm3. Dit is de som waar de hele prijs op rust.
    const m = leesSTL(kubusSTL(20))
    expect(m.volumeCm3).toBeCloseTo(8, 3)
  })

  it("schaalt met de derde macht, zoals volume hoort te doen", () => {
    const klein = leesSTL(kubusSTL(10)).volumeCm3
    const groot = leesSTL(kubusSTL(20)).volumeCm3
    expect(groot / klein).toBeCloseTo(8, 2)
  })

  it("geeft nooit een negatief volume, ook niet bij omgekeerde driehoeken", () => {
    // Een model met de normalen naar binnen levert een negatief tekenvolume op.
    // Dat mag nooit als een negatieve prijs eindigen.
    const gedraaid = [[[0, 0, 0], [1, 0, 0], [0, 1, 0]]] as number[][][]
    expect(volumeVanDriehoeken(gedraaid.map((t) => t.flat()))).toBeGreaterThanOrEqual(0)
  })

  it("meet de buitenmaten in millimeters", () => {
    const m = leesSTL(kubusSTL(20))
    expect(m.maat.x).toBeCloseTo(20, 3)
    expect(m.maat.y).toBeCloseTo(20, 3)
    expect(m.maat.z).toBeCloseTo(20, 3)
  })

  it("leest ook een ASCII-STL", () => {
    const tekst = `solid t
facet normal 0 0 0
  outer loop
    vertex 0 0 0
    vertex 10 0 0
    vertex 0 10 0
  endloop
endfacet
endsolid t`
    const m = leesSTL(new TextEncoder().encode(tekst).buffer as ArrayBuffer)
    expect(m.driehoeken).toBe(1)
  })

  it("weigert een bestand dat geen STL is", () => {
    expect(() => leesSTL(new TextEncoder().encode("dit is een pdf").buffer as ArrayBuffer))
      .toThrow()
  })

  it("weigert een binaire STL waarvan de lengte niet klopt", () => {
    // Een half doorgestuurd bestand mag geen halve prijs opleveren.
    const heel = kubusSTL()
    expect(() => leesSTL(heel.slice(0, heel.byteLength - 30))).toThrow()
  })

  it("gelooft de opgegeven normaal niet", () => {
    // Veel exporteurs schrijven onzin in het normaalveld. Het volume moet uit
    // de punten komen, niet uit die kop.
    const m = leesSTL(kubusSTL(20))
    expect(m.volumeCm3).toBeCloseTo(8, 3)
  })
})

describe("de prijs van een 3D-print", () => {
  const pla = FILAMENTEN.find((f) => f.id === "pla-magenta")!
  const model = { volumeCm3: 8, maat: { x: 20, y: 20, z: 20 }, driehoeken: 12 }

  it("noemt elk onderdeel apart, zodat de klant ziet waar het geld heen gaat", () => {
    const p = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 1 })
    expect(p.regels.map((r) => r.wat)).toEqual(
      expect.arrayContaining(["Materiaal", "Printtijd", "Voorbereiding"])
    )
    const som = p.regels.reduce((s, r) => s + r.bedrag, 0)
    expect(p.subtotaal).toBeCloseTo(som, 2)
  })

  it("telt ook bij een serie op tot het totaal", () => {
    const p = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 100 })
    const alles = p.regels.reduce((s, r) => s + r.bedrag, 0)
    expect(alles).toBeCloseTo(p.totaal, 2)
    expect(p.regels.some((r) => r.wat === "Staffelkorting")).toBe(true)
  })

  it("rekent meer materiaal bij meer vulling", () => {
    const laag = berekenPrint3D({ model, filament: pla, vulling: 10, laagHoogte: 0.2, aantal: 1 })
    const hoog = berekenPrint3D({ model, filament: pla, vulling: 60, laagHoogte: 0.2, aantal: 1 })
    expect(hoog.materiaalGram).toBeGreaterThan(laag.materiaalGram)
  })

  it("rekent langer bij een fijnere laag", () => {
    const grof = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.3, aantal: 1 })
    const fijn = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.1, aantal: 1 })
    expect(fijn.printMinuten).toBeGreaterThan(grof.printMinuten)
  })

  it("houdt een bodemprijs aan, want een minuscuul model kost ook tijd", () => {
    const stipje = { volumeCm3: 0.01, maat: { x: 2, y: 2, z: 2 }, driehoeken: 12 }
    const p = berekenPrint3D({ model: stipje, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 1 })
    expect(p.totaal).toBeGreaterThanOrEqual(p.bodemprijs)
  })

  it("wordt per stuk goedkoper bij een grotere serie", () => {
    const een = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 1 })
    const vijftig = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 50 })
    expect(vijftig.perStuk).toBeLessThan(een.perStuk)
  })

  it("rekent de voorbereiding één keer, niet per stuk", () => {
    // Anders betaalt een café voor tien tapknoppen tien keer het instellen.
    const een = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 1 })
    const tien = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 10 })
    const voorbereiding = (p: typeof een) => p.regels.find((r) => r.wat === "Voorbereiding")!.bedrag
    expect(voorbereiding(tien)).toBeCloseTo(voorbereiding(een), 2)
  })

  it("zegt het als een model niet op de plaat past", () => {
    const reus = {
      volumeCm3: 900,
      maat: { x: BOUWVOLUME.x + 10, y: 50, z: 50 },
      driehoeken: 12,
    }
    const p = berekenPrint3D({ model: reus, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 1 })
    expect(p.past).toBe(false)
    expect(p.waarschuwing).toMatch(/past niet/i)
  })

  it("laat een model dat precies past gewoon door", () => {
    const krap = { volumeCm3: 100, maat: BOUWVOLUME, driehoeken: 12 }
    expect(berekenPrint3D({ model: krap, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 1 }).past).toBe(true)
  })

  it("rekent btw over het bedrag exclusief, nooit over een bedrag dat het al bevat", () => {
    const p = berekenPrint3D({ model, filament: pla, vulling: 20, laagHoogte: 0.2, aantal: 3 })
    expect(p.btw).toBeCloseTo(p.totaal * 0.21, 2)
    expect(p.totaalInclusief).toBeCloseTo(p.totaal + p.btw, 2)
  })

  it("geeft bedragen in hele centen terug", () => {
    const p = berekenPrint3D({ model, filament: pla, vulling: 23, laagHoogte: 0.15, aantal: 7 })
    for (const bedrag of [p.totaal, p.btw, p.totaalInclusief, p.perStuk]) {
      expect(Math.round(bedrag * 100)).toBeCloseTo(bedrag * 100, 6)
    }
  })
})

describe("de prijs van drukwerk", () => {
  const a3 = FORMATEN.find((f) => f.id === "a3")!
  const a4 = FORMATEN.find((f) => f.id === "a4")!

  it("rekent een groter formaat duurder", () => {
    const klein = berekenDrukwerk({ formaat: a4, papier: "fotopapier", aantal: 10, dubbelzijdig: false })
    const groot = berekenDrukwerk({ formaat: a3, papier: "fotopapier", aantal: 10, dubbelzijdig: false })
    expect(groot.totaal).toBeGreaterThan(klein.totaal)
  })

  it("wordt per stuk goedkoper naarmate je er meer bestelt", () => {
    const tien = berekenDrukwerk({ formaat: a3, papier: "dik", aantal: 10, dubbelzijdig: false })
    const vijfhonderd = berekenDrukwerk({ formaat: a3, papier: "dik", aantal: 500, dubbelzijdig: false })
    expect(vijfhonderd.perStuk).toBeLessThan(tien.perStuk)
  })

  it("biedt geen lamineren aan, want die machine staat er niet", () => {
    // Peter Jansen, 14 september: de Printshop heeft geen lamineermachine.
    // Deze toets staat er zodat het niet terugsluipt als iemand de rekensom
    // later uitbreidt.
    const p = berekenDrukwerk({ formaat: a3, papier: "dik", aantal: 20, dubbelzijdig: false })
    expect(p.regels.some((r) => /lamineer/i.test(r.wat))).toBe(false)
  })

  it("telt op: wie de getoonde regels optelt komt op het totaal uit", () => {
    // Dit is wat een klant doet die het niet vertrouwt. De kortingsregel staat
    // er als negatief bedrag bij, dus alle regels samen horen het totaal te
    // zijn. Het subtotaal is bewust het bedrag vóór korting.
    for (const aantal of [1, 25, 500]) {
      const p = berekenDrukwerk({ formaat: a3, papier: "fotopapier", aantal, dubbelzijdig: true })
      const alles = p.regels.reduce((s, r) => s + r.bedrag, 0)
      const zonderKorting = p.regels
        .filter((r) => r.wat !== "Staffelkorting")
        .reduce((s, r) => s + r.bedrag, 0)
      expect(alles).toBeCloseTo(p.totaal, 2)
      expect(zonderKorting).toBeCloseTo(p.subtotaal, 2)
    }
  })

  it("weigert een aantal van nul of minder", () => {
    expect(() => berekenDrukwerk({ formaat: a4, papier: "normaal", aantal: 0, dubbelzijdig: false })).toThrow()
  })

  it("kent precies de vier formaten die de Printshop aankan", () => {
    expect(FORMATEN.map((f) => f.id)).toEqual(["a4", "a3", "a2", "a1"])
  })
})

describe("de winkelwagen", () => {
  it("schaalt het bedrag mee als je het aantal wijzigt", async () => {
    // Anders staat er een prijs van vier stuks bij een aantal van twintig, en
    // dat merkt niemand tot de factuur.
    const { useWinkelwagen } = await import("@/lib/winkelwagen")
    const w = useWinkelwagen.getState()
    w.leeg()
    w.voegToe({
      soort: "print3d",
      naam: "Tapknop",
      omschrijving: "PLA magenta",
      aantal: 4,
      bedrag: 40,
      keuzes: {},
    })
    const id = useWinkelwagen.getState().regels[0].id
    useWinkelwagen.getState().wijzigAantal(id, 20)
    expect(useWinkelwagen.getState().regels[0].bedrag).toBeCloseTo(200, 2)
  })

  it("gaat nooit onder één stuk", async () => {
    const { useWinkelwagen } = await import("@/lib/winkelwagen")
    const w = useWinkelwagen.getState()
    w.leeg()
    w.voegToe({ soort: "drukwerk", naam: "Poster", omschrijving: "A3", aantal: 5, bedrag: 25, keuzes: {} })
    const id = useWinkelwagen.getState().regels[0].id
    useWinkelwagen.getState().wijzigAantal(id, 0)
    expect(useWinkelwagen.getState().regels[0].aantal).toBe(1)
  })

  it("telt de regels op tot het totaal", async () => {
    const { useWinkelwagen } = await import("@/lib/winkelwagen")
    const w = useWinkelwagen.getState()
    w.leeg()
    w.voegToe({ soort: "print3d", naam: "A", omschrijving: "", aantal: 1, bedrag: 12.5, keuzes: {} })
    w.voegToe({ soort: "drukwerk", naam: "B", omschrijving: "", aantal: 2, bedrag: 7.25, keuzes: {} })
    expect(useWinkelwagen.getState().totaal()).toBeCloseTo(19.75, 2)
    expect(useWinkelwagen.getState().aantalStuks()).toBe(3)
  })
})

describe("de stand van een print", () => {
  it("geeft dezelfde bestelling op hetzelfde moment altijd dezelfde stand", async () => {
    // Anders springt de print terug zodra iemand ververst, en dan gelooft
    // niemand het meer.
    const { haalStatus } = await import("@/lib/printer/status")
    const nu = new Date("2026-09-07T14:22:11Z")
    expect(haalStatus("VP-2026-0148", nu)).toEqual(haalStatus("VP-2026-0148", nu))
  })

  it("houdt de voortgang tussen nul en één", async () => {
    const { haalStatus } = await import("@/lib/printer/status")
    for (let i = 0; i < 400; i++) {
      const s = haalStatus("VP-2026-0148", new Date(1788000000000 + i * 7000))
      expect(s.voortgang).toBeGreaterThanOrEqual(0)
      expect(s.voortgang).toBeLessThanOrEqual(1)
      expect(s.laag).toBeLessThanOrEqual(s.lagenTotaal)
    }
  })

  it("zegt zelf dat het nog geen echte printergegevens zijn", async () => {
    // Zolang de printer niet gekoppeld is, mag de pagina niet doen alsof.
    const { haalStatus } = await import("@/lib/printer/status")
    expect(haalStatus("VP-2026-0148", new Date()).echteData).toBe(false)
  })

  it("is klaar op honderd procent en heeft dan geen resttijd meer", async () => {
    const { haalStatus } = await import("@/lib/printer/status")
    let gezienKlaar = false
    for (let i = 0; i < 600; i++) {
      const s = haalStatus("VP-2026-0148", new Date(1788000000000 + i * 3000))
      if (s.staat === "klaar") {
        gezienKlaar = true
        expect(s.voortgang).toBe(1)
        expect(s.restMinuten).toBe(0)
      }
    }
    expect(gezienKlaar).toBe(true)
  })

  it("herkent alleen bestelnummers in onze eigen vorm", async () => {
    const { BESTELNUMMER, normaliseerBestelnummer } = await import("@/lib/printer/status")
    expect(BESTELNUMMER.test(normaliseerBestelnummer(" vp-2026-0148 "))).toBe(true)
    expect(BESTELNUMMER.test(normaliseerBestelnummer("0148"))).toBe(false)
    expect(BESTELNUMMER.test(normaliseerBestelnummer("VP-2026-014"))).toBe(false)
  })
})
