"use client"

import { useEffect, type ReactNode } from "react"
import { HeroCanvas } from "./HeroCanvas"
import { heroScroll } from "@/lib/heroscroll"
import { meng, useVoortgang } from "@/lib/scrollen"

/**
 * De hero in vier vlakken die los van elkaar bewegen.
 *
 * ver weg   een zacht veld dat nauwelijks meebeweegt
 * midden    de kop en de tekst
 * subject   het 3D-tafereel: de spuitmond en het lint filament
 * voorgrond een onscherpe streng die snel wegschuift
 *
 * Diepte komt van het verschil in snelheid en van wat waar overheen valt, niet
 * van een schaduwtje. Het lint loopt bewust vóór de kop langs: dat is het moment
 * waarop je ziet dat er ruimte in zit. De kop zelf blijft heel, want een kop die
 * je niet kunt lezen is geen kop.
 */
export function HeroDiepte({ children }: { children: ReactNode }) {
  const { ref, voortgang, rustig } = useVoortgang<HTMLElement>()

  useEffect(() => {
    heroScroll.waarde = rustig ? 0 : voortgang
  }, [voortgang, rustig])

  const t = rustig ? 0 : voortgang

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* ver weg: een veld dat je eerder voelt dan ziet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          transform: `translate3d(0, ${meng(0, -40, t)}px, 0)`,
          background:
            "radial-gradient(60rem 40rem at 78% 28%, rgba(248,171,33,0.10), transparent 62%)," +
            "radial-gradient(48rem 34rem at 92% 62%, rgba(229,0,117,0.09), transparent 60%)",
        }}
      />

      {/* ver weg, tweede laag: een raster dat de schaal van een printplaat geeft */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          transform: `translate3d(0, ${meng(0, -72, t)}px, 0)`,
          backgroundImage:
            "linear-gradient(var(--rand) 1px, transparent 1px)," +
            "linear-gradient(90deg, var(--rand) 1px, transparent 1px)",
          backgroundSize: "5.5rem 5.5rem",
          maskImage:
            "radial-gradient(48rem 32rem at 72% 45%, #000 20%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(48rem 32rem at 72% 45%, #000 20%, transparent 72%)",
        }}
      />

      {/* midden: de tekst */}
      <div
        className="relative z-10 mx-auto max-w-6xl px-6 pb-80 pt-20 sm:px-8 sm:pt-28 md:pb-16 lg:pb-28 lg:pt-36"
        style={{
          transform: `translate3d(0, ${meng(0, -110, t)}px, 0)`,
          opacity: meng(1, 0.15, Math.max(0, (t - 0.45) / 0.5)),
        }}
      >
        {children}
      </div>

      {/* subject: het tafereel, bewust vóór de kop langs */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-72 md:inset-0 md:-top-16 md:h-auto">
        <HeroCanvas />
      </div>

      {/* voorgrond: een onscherpe streng die het snelst wegschuift */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden h-64 md:block"
        style={{
          transform: `translate3d(0, ${meng(60, -180, t)}px, 0)`,
          opacity: meng(0.5, 0, Math.max(0, (t - 0.3) / 0.5)),
          background:
            "radial-gradient(120rem 9rem at 30% 120%, rgba(248,171,33,0.5), transparent 70%)",
          filter: "blur(26px)",
        }}
      />
    </section>
  )
}
