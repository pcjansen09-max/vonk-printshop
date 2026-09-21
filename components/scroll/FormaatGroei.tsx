"use client"

import { FORMATEN } from "@/lib/prijs/drukwerk"
import { Label } from "@/components/ui/Sectie"
import { KnopLink } from "@/components/ui/Knop"
import { meng, stuk, useVoortgang, zacht } from "@/lib/scrollen"

/**
 * De vier formaten groeien terwijl je scrollt.
 *
 * "A1 is acht keer A4" is een zin die niemand voelt. Een vel dat voor je ogen
 * acht keer zo groot wordt wel. De maten en de verhoudingen komen uit dezelfde
 * lijst waar de prijsberekening mee rekent, dus wat je hier ziet is wat je
 * straks bestelt.
 */
export function FormaatGroei() {
  const { ref, voortgang, rustig } = useVoortgang<HTMLElement>()
  const t = rustig ? 1 : zacht(stuk(voortgang, 0.18, 0.72))
  const grootste = FORMATEN[FORMATEN.length - 1]

  return (
    <section ref={ref} className="relative mt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Label>Papier</Label>
          <h2 className="kop kop-l mt-4">
            Van A4 tot
            <br />
            <span className="vonk-tekst">acht keer zo groot.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-inkt-zacht">
            Posters voor je evenement, flyers voor de bar, programmakaarten voor
            een proeverij. Op normaal papier, dik karton of glanzend fotopapier,
            op maat gesneden.
          </p>
          <div className="mt-8">
            <KnopLink href="/drukwerk" soort="lijn">
              Drukwerk berekenen
            </KnopLink>
          </div>
        </div>

        <div className="relative flex aspect-[4/3] items-end justify-center gap-3 border border-rand bg-papier-zacht p-8 sm:gap-6">
          {FORMATEN.map((f, i) => {
            // Elk formaat komt iets later op gang, zodat ze na elkaar groeien.
            const eigen = zacht(stuk(t, i * 0.13, 0.55 + i * 0.13))
            const hoogte = meng(8, (f.mm.hoogte / grootste.mm.hoogte) * 100, eigen)
            const laatste = i === FORMATEN.length - 1
            return (
              <div key={f.id} className="flex h-full flex-col justify-end">
                <div
                  className="relative"
                  style={{
                    height: `${hoogte}%`,
                    width: `${(f.mm.breedte / grootste.mm.hoogte) * 100 * 0.62}%`,
                    minWidth: "1.6rem",
                    background: laatste
                      ? "linear-gradient(158deg,#f8ab21,#ee564a 52%,#e50075)"
                      : "var(--papier)",
                    border: laatste ? "none" : "1px solid var(--rand-sterk)",
                    boxShadow: laatste
                      ? "0 18px 44px -26px rgba(229,0,117,0.7)"
                      : "none",
                    transition: rustig ? "none" : "height 120ms linear",
                  }}
                >
                  <span
                    className={`label absolute inset-x-0 bottom-2 text-center ${
                      laatste ? "text-white/90" : "text-inkt-zacht"
                    }`}
                    style={{ opacity: eigen }}
                  >
                    {f.naam}
                  </span>
                </div>
              </div>
            )
          })}
          <p className="cijfers absolute bottom-4 left-5 text-xs text-inkt-zacht">
            {grootste.mm.breedte} × {grootste.mm.hoogte} mm
          </p>
        </div>
      </div>
    </section>
  )
}
