"use client"

import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Check, ImagePlus, Info, X } from "lucide-react"
import { beoordeelBestand, type Oordeel, type Soort } from "@/lib/bestand/resolutie"

/**
 * Je ontwerp aanleveren, met meteen het oordeel erbij.
 *
 * De vraag "is dit scherp genoeg" wordt op een printshop bijna altijd te laat
 * gesteld: iemand levert een plaatje van zijn scherm aan, wij drukken het af op
 * A2, en dan hangt er iets blokkerigs aan de muur. Dat is hier in de browser uit
 * te rekenen, dus hoort het antwoord te komen op het moment dat je het bestand
 * kiest.
 *
 * PDF's beoordelen we niet automatisch: daar zit vectorwerk in dat op elk
 * formaat scherp blijft, en de bladmaat uitlezen vraagt een hele pdf-lezer in de
 * pagina. Die zeggen we dus eerlijk met de hand na te kijken.
 */

const MAX_MB = 40
const BEELD = /^image\/(png|jpeg|webp|avif)$/

export type GekozenBestand = {
  naam: string
  grootteBytes: number
  pixelsBreed: number
  pixelsHoog: number
  isPdf: boolean
}

export function BestandUpload({
  soort,
  breedteCm,
  hoogteCm,
  bestand,
  onKies,
}: {
  soort: Soort
  breedteCm: number
  hoogteCm: number
  bestand: GekozenBestand | null
  onKies: (b: GekozenBestand | null, url: string | null) => void
}) {
  const [voorbeeld, zetVoorbeeld] = useState<string | null>(null)
  const [fout, zetFout] = useState<string | null>(null)
  const [sleept, zetSleept] = useState(false)
  const invoer = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (voorbeeld) URL.revokeObjectURL(voorbeeld)
    }
  }, [voorbeeld])

  async function verwerk(f: File) {
    zetFout(null)
    const isPdf = f.type === "application/pdf"
    if (!isPdf && !BEELD.test(f.type)) {
      zetFout("Stuur een PNG, JPG of PDF. Andere bestanden kunnen we niet drukken.")
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      zetFout(
        `Dit bestand is ${Math.round(f.size / 1024 / 1024)} MB en dat is te groot om hier te bekijken. Mail het ons, dan kijken wij ernaar.`
      )
      return
    }

    const url = URL.createObjectURL(f)
    if (isPdf) {
      if (voorbeeld) URL.revokeObjectURL(voorbeeld)
      zetVoorbeeld(null)
      URL.revokeObjectURL(url)
      onKies(
        { naam: f.name, grootteBytes: f.size, pixelsBreed: 0, pixelsHoog: 0, isPdf: true },
        null
      )
      return
    }

    const beeld = new window.Image()
    beeld.onload = () => {
      if (voorbeeld) URL.revokeObjectURL(voorbeeld)
      zetVoorbeeld(url)
      onKies(
        {
          naam: f.name,
          grootteBytes: f.size,
          pixelsBreed: beeld.naturalWidth,
          pixelsHoog: beeld.naturalHeight,
          isPdf: false,
        },
        url
      )
    }
    beeld.onerror = () => {
      URL.revokeObjectURL(url)
      zetFout("Dit plaatje konden we niet openen. Sla het opnieuw op als PNG of JPG.")
    }
    beeld.src = url
  }

  const oordeel: Oordeel | null =
    bestand && !bestand.isPdf
      ? beoordeelBestand({
          pixelsBreed: bestand.pixelsBreed,
          pixelsHoog: bestand.pixelsHoog,
          breedteCm,
          hoogteCm,
          soort,
        })
      : null

  if (!bestand) {
    return (
      <div>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            zetSleept(true)
          }}
          onDragLeave={() => zetSleept(false)}
          onDrop={(e) => {
            e.preventDefault()
            zetSleept(false)
            const f = e.dataTransfer.files?.[0]
            if (f) verwerk(f)
          }}
          className={`flex flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition-colors ${
            sleept ? "border-magenta bg-magenta/5" : "border-rand-sterk bg-papier-zacht"
          }`}
        >
          <ImagePlus className="h-7 w-7 text-inkt-zacht" strokeWidth={1.4} />
          <p className="mt-4 font-medium">Sleep je ontwerp hierheen</p>
          <p className="mt-1.5 max-w-sm text-sm text-inkt-zacht">
            PNG, JPG of PDF, tot {MAX_MB} MB. We zeggen meteen of het scherp
            genoeg is voor het formaat dat je koos.
          </p>
          <button
            type="button"
            onClick={() => invoer.current?.click()}
            className="label mt-5 border border-rand-sterk bg-papier px-4 py-2 transition-colors hover:border-inkt"
          >
            Bestand kiezen
          </button>
          <input
            ref={invoer}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,application/pdf"
            className="enkel-voorlezen"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) verwerk(f)
            }}
          />
        </div>
        {fout && (
          <p className="mt-3 flex items-start gap-2 text-sm text-magenta">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {fout}
          </p>
        )}
      </div>
    )
  }

  const kleur = bestand.isPdf
    ? "rand"
    : oordeel?.onbruikbaar
      ? "magenta"
      : oordeel?.goed && oordeel.verhoudingKlopt
        ? "rand"
        : "amber"

  return (
    <div className="border border-rand bg-papier">
      <div className="flex items-start gap-4 p-4">
        {voorbeeld ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={voorbeeld}
            alt=""
            className="h-20 w-20 shrink-0 border border-rand object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-rand bg-papier-zacht">
            <span className="label text-inkt-zacht">PDF</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium" title={bestand.naam}>
            {bestand.naam}
          </p>
          <p className="cijfers mt-0.5 text-sm text-inkt-zacht">
            {bestand.isPdf
              ? `${Math.max(1, Math.round(bestand.grootteBytes / 1024))} kB`
              : `${bestand.pixelsBreed} × ${bestand.pixelsHoog} pixels`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (voorbeeld) URL.revokeObjectURL(voorbeeld)
            zetVoorbeeld(null)
            onKies(null, null)
          }}
          className="text-inkt-zacht transition-colors hover:text-magenta"
          aria-label="Bestand weghalen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex items-start gap-3 border-t border-rand px-4 py-3"
        style={{
          background:
            kleur === "magenta"
              ? "rgba(229,0,117,0.06)"
              : kleur === "amber"
                ? "rgba(248,171,33,0.1)"
                : "var(--papier-zacht)",
        }}
      >
        {bestand.isPdf ? (
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-inkt-zacht" strokeWidth={1.7} />
        ) : oordeel?.onbruikbaar ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-magenta" />
        ) : oordeel?.goed && oordeel.verhoudingKlopt ? (
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-magenta" strokeWidth={2.2} />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
        )}
        <p className="text-sm leading-relaxed">
          {bestand.isPdf
            ? "Een PDF kijken we met de hand na. Zit er vectorwerk in, dan blijft het op elk formaat scherp; staat er een foto in, dan laten we het weten als die te klein is."
            : oordeel?.advies}
        </p>
      </div>
    </div>
  )
}
