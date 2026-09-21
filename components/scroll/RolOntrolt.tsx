"use client"

import { KnopLink } from "@/components/ui/Knop"
import { Label } from "@/components/ui/Sectie"
import { meng, stuk, useVoortgang, zacht } from "@/lib/scrollen"
import { MAX_BREEDTE_CM } from "@/lib/prijs/banner"

/**
 * Waar het papier ophoudt en de rol begint.
 *
 * Na de A-formaten is de eerlijke volgende zin: A1 is 84 centimeter en daarmee
 * is het klaar. Een banner van drie meter naast een A1 zetten zegt dat in één
 * beeld, mits ze op dezelfde schaal staan. Dat is de hele voorwaarde: twee
 * rechthoeken naast elkaar op verschillende schalen is een leugen.
 *
 * Het doek rolt uit terwijl je scrollt, want dat is letterlijk wat de machine
 * doet. De vorige sectie liet vellen omhoog groeien; deze gaat opzij, zodat de
 * pagina niet twee keer dezelfde truc uithaalt.
 */

/** Het vak stelt dit voor, in millimeter. */
const VAK_MM = { breedte: 4200, hoogte: 1250 }
const A1_MM = { breedte: 594, hoogte: 841 }
const BANNER_MM = { breedte: 3000, hoogte: 1000 }

const pct = (mm: number, van: number) => `${(mm / van) * 100}%`

export function RolOntrolt() {
  const { ref, voortgang, rustig } = useVoortgang<HTMLElement>()
  // Het doek begint als een opgerolde rol en komt er dan uit.
  const t = rustig ? 1 : zacht(stuk(voortgang, 0.16, 0.74))
  const uit = meng(0.04, 1, t)

  return (
    <section ref={ref} className="relative mt-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <Label>Banners</Label>
            <h2 className="kop kop-l mt-4">
              En daarna houdt
              <br />
              papier <span className="vonk-tekst">gewoon op.</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-inkt-zacht">
              A1 is 84 centimeter hoog en dat is het einde van de stapel. Voor
              boven de kraam of langs het hek gaat het doek op de rol van{" "}
              {MAX_BREEDTE_CM} centimeter breed, en in de lengte zo ver als je
              wilt. Met ogen erin en een zoom eromheen.
            </p>
          </div>
          <div className="lg:pb-2">
            <KnopLink href="/banners" soort="lijn">
              Banner berekenen
            </KnopLink>
          </div>
        </div>

        <div
          className="relative mt-10 flex items-end gap-[3%] overflow-hidden border border-rand bg-papier-zacht px-[3%] pb-[4%] pt-[6%]"
          style={{ aspectRatio: `${VAK_MM.breedte} / ${VAK_MM.hoogte}` }}
        >
          {/* A1, voor de maat. */}
          <div
            className="relative shrink-0 border border-rand-sterk bg-papier"
            style={{
              width: pct(A1_MM.breedte, VAK_MM.breedte),
              height: pct(A1_MM.hoogte, VAK_MM.hoogte),
            }}
          >
            <span className="label absolute inset-x-0 bottom-2 text-center text-inkt-zacht">
              A1
            </span>
          </div>

          {/* De rol zelf: die blijft staan, het doek komt eruit. */}
          <div
            className="relative shrink-0 rounded-full"
            style={{
              width: pct(90, VAK_MM.breedte),
              height: pct(BANNER_MM.hoogte + 90, VAK_MM.hoogte),
              background:
                "linear-gradient(90deg,#2a2430 0%,#4a4150 42%,#211c27 100%)",
              boxShadow: "0 14px 30px -18px rgba(23,19,26,0.6)",
            }}
            aria-hidden
          />

          {/* Het doek dat eruit komt. */}
          <div
            className="relative shrink-0 origin-left overflow-hidden"
            style={{
              width: pct(BANNER_MM.breedte, VAK_MM.breedte),
              height: pct(BANNER_MM.hoogte, VAK_MM.hoogte),
              clipPath: `inset(0 ${(1 - uit) * 100}% 0 0)`,
              background:
                "linear-gradient(104deg,#f8ab21 0%,#ee564a 46%,#e50075 100%)",
              boxShadow: "0 20px 46px -28px rgba(229,0,117,0.75)",
              transition: rustig ? "none" : "clip-path 120ms linear",
            }}
          >
            {/* Ogen langs de bovenrand, zoals ze er echt in komen. */}
            <div className="absolute inset-x-0 top-0 flex justify-between px-[1%] pt-[1.4%]">
              {Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className="block aspect-square w-[1.1%] rounded-full bg-papier/85 ring-1 ring-inkt/25"
                />
              ))}
            </div>
            <span className="kop absolute bottom-[8%] left-[4%] text-[clamp(1rem,3.4vw,2.6rem)] leading-none text-white">
              300 × 100 cm
            </span>
          </div>

          <p className="cijfers absolute bottom-3 right-5 text-xs text-inkt-zacht">
            op schaal, {VAK_MM.breedte / 10} cm breed in beeld
          </p>
        </div>
      </div>
    </section>
  )
}
