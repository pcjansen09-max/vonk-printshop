"use client"

import dynamic from "next/dynamic"
import { useInBeeld } from "@/lib/inbeeld"
import { useEffect } from "react"
import { printScroll } from "@/lib/printscroll"
import { meng, stuk, useVoortgang, zacht } from "@/lib/scrollen"
import { Label } from "@/components/ui/Sectie"

const Opbouw = dynamic(() => import("@/components/three/PrintOpbouw"), {
  ssr: false,
  loading: () => null,
})

/**
 * Het beeld staat stil, de print groeit mee met het wiel.
 *
 * De sectie is drie schermen hoog en het tafereel plakt in het midden. Terwijl
 * je scrollt bouwt de tapknop zich laag voor laag op en wisselen de drie
 * bijschriften. Dit is het enige blok op de pagina waar het scrollen zelf het
 * onderwerp is; overal anders is het alleen vervoer.
 */

/** Zoveel lagen zit er in deze tapknop, bij 0,2 mm per laag. Het getal dat op
 *  het scherm staat loopt met de print mee; een vast "Laag 1" naast 25 procent
 *  leest als een fout, en dat is het ook. */
const LAGEN = 476

const BESCHRIJVING = [
  {
    vanaf: 0.0,
    kop: "Het begint op de plaat",
    tekst: "De eerste laag hecht aan de verwarmde plaat. Gaat die mis, dan gaat de rest ook mis, dus daar kijkt er altijd iemand naar.",
  },
  {
    vanaf: 0.38,
    kop: "En dan wordt het een vorm",
    tekst: "Wanden, vulling, boven- en onderkant. Twintig procent vulling is voor bijna alles genoeg; meer kost vooral tijd.",
  },
  {
    vanaf: 0.75,
    kop: "Klaar om op te halen",
    tekst: "Je krijgt bericht zodra hij van de plaat komt. Geen mailtje achteraf met een prijs die je nog niet kende.",
  },
]

export function PrintSectie() {
  const { ref, voortgang, rustig } = useVoortgang<HTMLElement>()
  const { ref: doek, inBeeld } = useInBeeld<HTMLDivElement>()

  // Het middenstuk van de sectie is de print; begin en eind zijn aanloop.
  //
  // Bewust niet vanaf nul: op nul procent staat er niets getekend en dan begint
  // de sectie met een leeg scherm. Een stukje van de eerste lagen ligt er dus al
  // als je binnenkomt, en de schim van de rest staat er meteen bij, zodat je
  // ziet wat er gaat komen in plaats van naar wit te kijken.
  const t = rustig ? 1 : meng(0.07, 1, zacht(stuk(voortgang, 0.1, 0.86)))

  useEffect(() => {
    printScroll.waarde = t
  }, [t])

  const actief = BESCHRIJVING.reduce(
    (gekozen, b, i) => (t >= b.vanaf ? i : gekozen),
    0
  )
  const procent = Math.round(t * 100)

  return (
    <section
      ref={ref}
      className="relative mt-16 h-[230vh] lg:mt-32 lg:h-[280vh]"
    >
      <div className="sticky top-0 flex h-screen items-start overflow-hidden pt-20 lg:items-center lg:pt-0">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-6 sm:px-8 lg:grid-cols-2">
          {/* links: wat er gebeurt */}
          <div className="order-2 lg:order-1">
            <Label>Meekijken</Label>
            <h2 className="kop kop-l mt-4">
              Je ziet hem
              <br />
              <span className="vonk-tekst">groeien.</span>
            </h2>

            <div className="relative mt-8 h-44">
              {BESCHRIJVING.map((b, i) => (
                <div
                  key={b.kop}
                  aria-hidden={i !== actief}
                  className="absolute inset-0"
                  style={{
                    opacity: i === actief ? 1 : 0,
                    transform:
                      i === actief
                        ? "none"
                        : `translate3d(0,${i < actief ? "-1rem" : "1rem"},0)`,
                    transition: rustig
                      ? "none"
                      : "opacity 420ms ease, transform 420ms cubic-bezier(.2,.7,.3,1)",
                    pointerEvents: i === actief ? "auto" : "none",
                  }}
                >
                  <p className="label cijfers text-magenta">
                    Laag {Math.max(1, Math.round(t * LAGEN))} van {LAGEN}
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {b.kop}
                  </p>
                  <p className="mt-3 max-w-md leading-relaxed text-inkt-zacht">
                    {b.tekst}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-[3px] flex-1 overflow-hidden bg-papier-diep">
                <div
                  className="vonk-vlak h-full"
                  style={{ width: `${Math.max(procent, 1)}%` }}
                />
              </div>
              <span className="cijfers w-14 text-right text-sm font-semibold tabular-nums">
                {procent}%
              </span>
            </div>
          </div>

          {/* rechts: de print zelf. Alleen tekenen als hij in beeld staat: op
              de startpagina staat ook het tafereel van de hero, en twee doeken
              die tegelijk op volle snelheid draaien vechten om dezelfde kaart. */}
          <div ref={doek} className="order-1 h-[40vh] lg:order-2 lg:h-[70vh]">
            {inBeeld && <Opbouw />}
          </div>
        </div>
      </div>
    </section>
  )
}
