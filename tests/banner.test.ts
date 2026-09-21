import { describe, expect, it } from "vitest"
import { BANNERMATERIAAL, berekenBanner, MAX_BREEDTE_CM } from "@/lib/prijs/banner"
import { beoordeelBestand, DREMPEL } from "@/lib/bestand/resolutie"

describe("de prijs van een banner", () => {
  it("rekent per vierkante meter", () => {
    const klein = berekenBanner({ breedteCm: 100, hoogteCm: 100, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    const groot = berekenBanner({ breedteCm: 200, hoogteCm: 100, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    const materiaalRegel = (p: typeof klein) => p.regels.find((r) => r.wat.startsWith("Banner"))!.bedrag
    expect(materiaalRegel(groot)).toBeCloseTo(materiaalRegel(klein) * 2, 2)
  })

  it("noemt het oppervlak dat je afrekent", () => {
    const p = berekenBanner({ breedteCm: 300, hoogteCm: 150, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    expect(p.m2).toBeCloseTo(4.5, 3)
  })

  it("rekent een halve meter af als je minder bestelt", () => {
    // Onder een halve vierkante meter houdt het op: het snijden en afwerken
    // kost hetzelfde, hoe klein het vel ook is.
    const p = berekenBanner({ breedteCm: 30, hoogteCm: 40, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    expect(p.m2Gerekend).toBe(0.5)
  })

  it("rekent mesh en textiel duurder dan pvc", () => {
    const maak = (m: "pvc" | "mesh" | "textiel") =>
      berekenBanner({ breedteCm: 200, hoogteCm: 100, materiaal: m, ogen: false, zoom: false, aantal: 1 }).totaal
    expect(maak("mesh")).toBeGreaterThan(maak("pvc"))
    expect(maak("textiel")).toBeGreaterThan(maak("mesh"))
  })

  it("rekent precies het tarief dat op de site staat", () => {
    // Het bedrag dat de klant ziet staan bij het doek moet hetzelfde tarief
    // gebruiken als de prijs die eruit rolt. Anders staat er straks een ander
    // getal in de keuzelijst dan op de rekening.
    for (const [sleutel, doek] of Object.entries(BANNERMATERIAAL)) {
      const p = berekenBanner({
        breedteCm: 200, hoogteCm: 100,
        materiaal: sleutel as keyof typeof BANNERMATERIAAL,
        ogen: false, zoom: false, aantal: 1,
      })
      const doekRegel = p.regels.find((r) => r.wat.startsWith("Banner"))!
      expect(doekRegel.bedrag).toBeCloseTo(2 * doek.euroPerM2, 2)
      expect(doekRegel.wat.toLowerCase()).toContain(doek.naam.toLowerCase())
    }
  })

  it("zet ogen om de vijftig centimeter langs de rand", () => {
    // Een banner van 200 bij 100 heeft een omtrek van 600 cm, dus twaalf ogen.
    const p = berekenBanner({ breedteCm: 200, hoogteCm: 100, materiaal: "pvc", ogen: true, zoom: false, aantal: 1 })
    expect(p.aantalOgen).toBe(12)
    expect(p.regels.some((r) => r.wat.toLowerCase().includes("ogen"))).toBe(true)
  })

  it("rekent die ogen ook echt", () => {
    // Een regel van nul euro is geen regel. Zonder deze toets kon het bedrag op
    // nul staan zonder dat er iets rood werd.
    const zonder = berekenBanner({ breedteCm: 200, hoogteCm: 100, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    const met = berekenBanner({ breedteCm: 200, hoogteCm: 100, materiaal: "pvc", ogen: true, zoom: false, aantal: 1 })
    const oogRegel = met.regels.find((r) => r.wat.toLowerCase().includes("ogen"))!
    expect(oogRegel.bedrag).toBeGreaterThan(0)
    expect(met.totaal).toBeGreaterThan(zonder.totaal)
  })

  it("rekent de zoom ook echt", () => {
    const zonder = berekenBanner({ breedteCm: 200, hoogteCm: 100, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    const met = berekenBanner({ breedteCm: 200, hoogteCm: 100, materiaal: "pvc", ogen: false, zoom: true, aantal: 1 })
    expect(met.totaal).toBeGreaterThan(zonder.totaal)
  })

  it("rekent geen ogen als je ze niet wilt", () => {
    const p = berekenBanner({ breedteCm: 200, hoogteCm: 100, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    expect(p.aantalOgen).toBe(0)
    expect(p.regels.some((r) => r.wat.toLowerCase().includes("ogen"))).toBe(false)
  })

  it("telt op: de getoonde regels vormen samen het totaal", () => {
    for (const aantal of [1, 5, 40]) {
      const p = berekenBanner({ breedteCm: 250, hoogteCm: 120, materiaal: "mesh", ogen: true, zoom: true, aantal })
      const som = p.regels.reduce((s, r) => s + r.bedrag, 0)
      expect(som).toBeCloseTo(p.totaal, 2)
    }
  })

  it("rekent btw over het bedrag exclusief", () => {
    const p = berekenBanner({ breedteCm: 300, hoogteCm: 100, materiaal: "pvc", ogen: true, zoom: false, aantal: 2 })
    expect(p.btw).toBeCloseTo(p.totaal * 0.21, 2)
    expect(p.totaalInclusief).toBeCloseTo(p.totaal + p.btw, 2)
  })

  it("draait een banner die één kant te breed is gewoon op de rol", () => {
    // 151 bij 100 past prima: dan gaat hij dwars. Pas als ALLEBEI de maten
    // breder zijn dan de rol kan het niet meer.
    expect(() =>
      berekenBanner({ breedteCm: MAX_BREEDTE_CM + 1, hoogteCm: 100, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    ).not.toThrow()
  })

  it("weigert pas als beide maten breder zijn dan de rol", () => {
    expect(() =>
      berekenBanner({ breedteCm: MAX_BREEDTE_CM + 1, hoogteCm: MAX_BREEDTE_CM + 1, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    ).toThrow(/breed/i)
  })

  it("weigert een maat van nul", () => {
    expect(() =>
      berekenBanner({ breedteCm: 0, hoogteCm: 100, materiaal: "pvc", ogen: false, zoom: false, aantal: 1 })
    ).toThrow()
  })
})

describe("is het bestand scherp genoeg", () => {
  it("rekent uit hoeveel punten per inch er overblijven", () => {
    // 3508 pixels over 29,7 cm is een A4 op 300 dpi.
    const r = beoordeelBestand({ pixelsBreed: 3508, pixelsHoog: 2480, breedteCm: 29.7, hoogteCm: 21, soort: "poster" })
    expect(r.dpi).toBeGreaterThan(295)
    expect(r.dpi).toBeLessThan(305)
    expect(r.goed).toBe(true)
  })

  it("schrijft de maat met een komma, niet met een punt", () => {
    const o = beoordeelBestand({ pixelsBreed: 800, pixelsHoog: 600, breedteCm: 42, hoogteCm: 59.4, soort: "poster" })
    expect(o.advies).toMatch(/16,9 centimeter/)
    expect(o.advies).not.toMatch(/\d\.\d/)
  })

  it("keurt een schermplaatje op een poster af", () => {
    // Een plaatje van 800 bij 600 op een A2 is ongeveer 48 dpi: dat wordt blokkerig.
    const r = beoordeelBestand({ pixelsBreed: 800, pixelsHoog: 600, breedteCm: 42, hoogteCm: 59.4, soort: "poster" })
    expect(r.goed).toBe(false)
    expect(r.advies).toMatch(/scherp|groter|blokkerig/i)
  })

  it("is soepeler voor een banner dan voor een poster", () => {
    // Een spandoek hangt op afstand; daar hoeft veel minder in. Deze maat komt
    // uit op ongeveer 42 punten per inch: genoeg voor een banner (drempel 40),
    // te weinig voor een poster (drempel 120).
    const zelfde = { pixelsBreed: 5000, pixelsHoog: 2500, breedteCm: 300, hoogteCm: 150 }
    const poster = beoordeelBestand({ ...zelfde, soort: "poster" })
    const banner = beoordeelBestand({ ...zelfde, soort: "banner" })
    expect(DREMPEL.banner).toBeLessThan(DREMPEL.poster)
    expect(banner.goed).toBe(true)
    expect(poster.goed).toBe(false)
  })

  it("waarschuwt als de verhouding niet klopt", () => {
    // Een vierkant bestand op een liggende banner wordt uitgerekt of afgesneden.
    const r = beoordeelBestand({ pixelsBreed: 1000, pixelsHoog: 1000, breedteCm: 300, hoogteCm: 100, soort: "banner" })
    expect(r.verhoudingKlopt).toBe(false)
    expect(r.advies).toMatch(/verhouding|bijsnijden|uitgerekt/i)
  })

  it("zegt niets over de verhouding als die wel klopt", () => {
    const r = beoordeelBestand({ pixelsBreed: 3000, pixelsHoog: 1000, breedteCm: 300, hoogteCm: 100, soort: "banner" })
    expect(r.verhoudingKlopt).toBe(true)
  })

  it("valt niet om op een maat van nul", () => {
    const r = beoordeelBestand({ pixelsBreed: 1000, pixelsHoog: 1000, breedteCm: 0, hoogteCm: 0, soort: "poster" })
    expect(Number.isFinite(r.dpi)).toBe(true)
    expect(r.goed).toBe(false)
  })
})
