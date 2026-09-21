"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PRODUCTEN } from "@/lib/catalogus"
import { euro } from "@/lib/prijs/geld"
import { Label } from "@/components/ui/Sectie"
import { meng, stuk, useVoortgang, zacht } from "@/lib/scrollen"

/**
 * De producten lopen zijwaarts langs terwijl je naar beneden scrolt.
 *
 * Een gewoon raster van kaarten laat je in één blik met rust; hier moet je erlangs,
 * en dat is precies de bedoeling: acht producten die je stuk voor stuk voorbij ziet
 * komen onthoud je beter dan acht vakjes naast elkaar. De plaatjes zijn geen
 * stockfoto's maar echte opnames uit onze eigen 3D-modellen, dus je ziet wat de
 * printer ook werkelijk maakt.
 *
 * Op een telefoon wordt het een gewone veegrij: daar is verticaal scrollen om
 * horizontaal te bewegen alleen maar verwarrend.
 */
export function ProductPan() {
  const { ref, voortgang, rustig } = useVoortgang<HTMLElement>()
  const t = zacht(stuk(voortgang, 0.1, 0.9))
  // Hoe ver de rij opschuift: acht kaarten van 23rem plus tussenruimte.
  const schuif = rustig ? 0 : meng(2, -76, t)

  return (
    <section ref={ref} className="relative mt-32 lg:h-[320vh]">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          <Label>Wat we maken</Label>
          <h2 className="kop kop-l mt-4 max-w-xl">
            Acht dingen die hier de deur uit gaan
          </h2>
        </div>

        {/* computer: de rij schuift met het wiel mee */}
        <div className="mt-12 hidden overflow-hidden lg:block">
          <div
            className="flex gap-6 pl-[max(1.5rem,calc((100vw-72rem)/2+2rem))]"
            style={{
              transform: `translate3d(${schuif}rem, 0, 0)`,
              willChange: "transform",
            }}
          >
            {PRODUCTEN.map((p, i) => (
              <Kaart key={p.id} product={p} amber={i % 3 === 1} />
            ))}
          </div>
        </div>

        {/* telefoon: gewoon vegen */}
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRODUCTEN.map((p, i) => (
            <div key={p.id} className="snap-start">
              <Kaart product={p} amber={i % 3 === 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Kaart({
  product,
  amber,
}: {
  product: (typeof PRODUCTEN)[number]
  amber: boolean
}) {
  const bestand = `/producten/${product.id}${amber ? "-amber" : ""}.png`
  return (
    <Link
      href={`/ontwerpen?product=${product.id}`}
      className="group flex w-[17rem] shrink-0 flex-col border border-rand bg-papier transition-colors hover:border-inkt sm:w-[20rem] lg:w-[23rem]"
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{
          background: amber
            ? "radial-gradient(70% 60% at 50% 42%, rgba(248,171,33,0.16), transparent 70%), var(--papier-zacht)"
            : "radial-gradient(70% 60% at 50% 42%, rgba(229,0,117,0.13), transparent 70%), var(--papier-zacht)",
        }}
      >
        <Image
          src={bestand}
          alt={product.naam}
          width={900}
          height={900}
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.06]"
          sizes="(max-width: 1024px) 20rem, 23rem"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="label text-inkt-zacht">{product.voorWie}</p>
        <h3 className="mt-2.5 text-xl font-semibold tracking-tight">
          {product.naam}
        </h3>
        <p className="mt-2 flex-1 leading-relaxed text-inkt-zacht">
          {product.omschrijving}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-rand pt-4">
          <span className="cijfers text-sm text-inkt-zacht">
            vanaf {euro(product.vanafPrijs)}
          </span>
          <ArrowUpRight
            className="h-4 w-4 text-inkt-zacht transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-magenta"
            strokeWidth={1.8}
          />
        </div>
      </div>
    </Link>
  )
}
