"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

/**
 * Scrollen als tijdlijn.
 *
 * Eén gedeelde waarde per sectie, bijgewerkt in een requestAnimationFrame en
 * niet op elke scrollgebeurtenis: anders tekent de browser de hele pagina
 * opnieuw bij elk tikje van het wiel. Alles wat ermee beweegt gebruikt transform
 * en opacity, want dat zijn de twee dingen die de browser zonder herberekening
 * kan doen.
 *
 * Wie "minder beweging" heeft aanstaan krijgt overal 1 terug: de eindstand,
 * meteen. Geen halve animatie, geen lege ruimte waar iets had moeten gebeuren.
 */

/**
 * Staat "minder beweging" aan?
 *
 * Via useSyncExternalStore en niet via state-in-een-effect: de browser is hier
 * de bron, niet React. Zo staat de waarde meteen goed bij de eerste tekening in
 * plaats van een tel later, en blijft de server hetzelfde tekenen als de browser.
 */
const RUSTIG_VRAAG = "(prefers-reduced-motion: reduce)"

function luisterRustig(opnieuw: () => void) {
  const vraag = window.matchMedia(RUSTIG_VRAAG)
  vraag.addEventListener("change", opnieuw)
  return () => vraag.removeEventListener("change", opnieuw)
}

export function useRustig(): boolean {
  return useSyncExternalStore(
    luisterRustig,
    () => window.matchMedia(RUSTIG_VRAAG).matches,
    () => false
  )
}

/**
 * Hoe ver deze sectie door het venster is, van 0 (komt net onderin binnen) tot
 * 1 (is er bovenlangs uit). Geeft ook een ref terug die je op het element zet.
 */
export function useVoortgang<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [voortgang, zetVoortgang] = useState(0)
  const rustig = useRustig()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (rustig) {
      // Niet meteen zetten maar in de volgende tekening: setState midden in een
      // effect laat React de boom nog een keer doorlopen voordat er iets op het
      // scherm staat.
      const id = requestAnimationFrame(() => zetVoortgang(1))
      return () => cancelAnimationFrame(id)
    }

    let bezig = false
    let inBeeld = true

    const meet = () => {
      bezig = false
      const r = el.getBoundingClientRect()
      const h = window.innerHeight
      // 0 zodra de bovenkant onderin het venster komt, 1 als de onderkant er
      // bovenlangs uit is.
      const totaal = r.height + h
      const gedaan = h - r.top
      zetVoortgang(Math.min(1, Math.max(0, gedaan / totaal)))
    }

    const vraagAan = () => {
      if (bezig || !inBeeld) return
      bezig = true
      requestAnimationFrame(meet)
    }

    // Buiten beeld rekenen we niets uit; dat scheelt de telefoon werk.
    const kijker = new IntersectionObserver(
      ([item]) => {
        inBeeld = item.isIntersecting
        if (inBeeld) vraagAan()
      },
      { rootMargin: "100px" }
    )
    kijker.observe(el)

    requestAnimationFrame(meet)
    window.addEventListener("scroll", vraagAan, { passive: true })
    window.addEventListener("resize", vraagAan)
    return () => {
      kijker.disconnect()
      window.removeEventListener("scroll", vraagAan)
      window.removeEventListener("resize", vraagAan)
    }
  }, [rustig])

  return { ref, voortgang, rustig }
}

/** Van a naar b, met een waarde tussen 0 en 1. */
export function meng(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t))
}

/** Een deel uit het midden van een verloop uitvergroten naar 0..1. */
export function stuk(t: number, van: number, tot: number): number {
  if (tot <= van) return 0
  return Math.min(1, Math.max(0, (t - van) / (tot - van)))
}

/** Zacht in en uit, zodat niets met een schok begint of eindigt. */
export function zacht(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
