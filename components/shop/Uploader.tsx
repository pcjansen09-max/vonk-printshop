"use client"

import dynamic from "next/dynamic"
import { useCallback, useMemo, useRef, useState } from "react"
import { AlertTriangle, Check, RotateCw, Upload } from "lucide-react"
import { Knop } from "@/components/ui/Knop"
import { Keuze, Schuif, Teller, Veld } from "@/components/shop/Regelaar"
import { PrijsOpbouw } from "@/components/shop/PrijsOpbouw"
import { FILAMENTEN } from "@/lib/catalogus"
import { FoutInBestand, leesSTL, type Model } from "@/lib/stl/lezen"
import { BOUWVOLUME, berekenPrint3D } from "@/lib/prijs/print3d"
import { getal } from "@/lib/prijs/geld"
import { LEVERTIJD } from "@/lib/merk"
import { useWinkelwagen } from "@/lib/winkelwagen"

const Kijker = dynamic(() => import("@/components/three/ModelKijker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-inkt-zacht">
      Model wordt geladen…
    </div>
  ),
})

/** Groter dan dit lezen we niet in één keer in: dan bevriest de pagina. */
const MAX_MB = 40

export function Uploader() {
  const [model, zetModel] = useState<(Model & { naam: string }) | null>(null)
  const [fout, zetFout] = useState<string | null>(null)
  const [bezig, zetBezig] = useState(false)
  const [sleept, zetSleept] = useState(false)
  const [draait, zetDraait] = useState(true)
  const [toegevoegd, zetToegevoegd] = useState(false)

  const [filamentId, zetFilament] = useState(FILAMENTEN[0].id)
  const [vulling, zetVulling] = useState(20)
  const [laagHoogte, zetLaagHoogte] = useState(0.2)
  const [aantal, zetAantal] = useState(1)

  const invoer = useRef<HTMLInputElement>(null)
  const voegToe = useWinkelwagen((s) => s.voegToe)

  const filament = FILAMENTEN.find((f) => f.id === filamentId)!

  const prijs = useMemo(
    () =>
      model
        ? berekenPrint3D({ model, filament, vulling, laagHoogte, aantal })
        : null,
    [model, filament, vulling, laagHoogte, aantal]
  )

  const verwerk = useCallback(async (bestand: File) => {
    zetFout(null)
    zetToegevoegd(false)
    if (!/\.stl$/i.test(bestand.name)) {
      zetFout("We kunnen alleen STL-bestanden lezen. Exporteer je model als STL.")
      return
    }
    if (bestand.size > MAX_MB * 1024 * 1024) {
      zetFout(
        `Dit bestand is ${Math.round(bestand.size / 1024 / 1024)} MB en dat is te groot om hier uit te rekenen. Mail het ons, dan doen wij het.`
      )
      return
    }
    zetBezig(true)
    try {
      const buffer = await bestand.arrayBuffer()
      const gelezen = leesSTL(buffer)
      if (gelezen.volumeCm3 <= 0) {
        zetFout("Dit model heeft geen inhoud. Is het misschien een plat vlak?")
        zetModel(null)
      } else {
        zetModel({ ...gelezen, naam: bestand.name })
      }
    } catch (e) {
      zetFout(
        e instanceof FoutInBestand
          ? e.message
          : "Dit bestand konden we niet lezen. Sla het opnieuw op als STL."
      )
      zetModel(null)
    } finally {
      zetBezig(false)
    }
  }, [])

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      {/* ------------------------------------------------------- links: model */}
      <div>
        {!model ? (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              zetSleept(true)
            }}
            onDragLeave={() => zetSleept(false)}
            onDrop={(e) => {
              e.preventDefault()
              zetSleept(false)
              const b = e.dataTransfer.files?.[0]
              if (b) verwerk(b)
            }}
            className={`flex aspect-[4/3] flex-col items-center justify-center border-2 border-dashed p-8 text-center transition-colors ${
              sleept ? "border-magenta bg-magenta/5" : "border-rand-sterk bg-papier-zacht"
            }`}
          >
            <Upload className="h-8 w-8 text-inkt-zacht" strokeWidth={1.4} />
            <p className="mt-5 text-lg font-medium">
              {bezig ? "Bezig met uitlezen…" : "Sleep je STL hierheen"}
            </p>
            <p className="mt-2 max-w-sm text-sm text-inkt-zacht">
              Of kies een bestand van je computer. Tot {MAX_MB} MB.
            </p>
            <Knop
              soort="lijn"
              className="mt-6"
              onClick={() => invoer.current?.click()}
              disabled={bezig}
            >
              Bestand kiezen
            </Knop>
            <input
              ref={invoer}
              type="file"
              accept=".stl,model/stl"
              className="enkel-voorlezen"
              onChange={(e) => {
                const b = e.target.files?.[0]
                if (b) verwerk(b)
              }}
            />
          </div>
        ) : (
          <div>
            <div className="relative aspect-[4/3] border border-rand bg-papier-zacht">
              <Kijker
                punten={model.punten}
                maat={model.maat}
                kleur={filament.hex}
                plaat={BOUWVOLUME}
                draait={draait}
              />
              <button
                onClick={() => zetDraait((d) => !d)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-rand bg-papier/90 text-inkt-zacht backdrop-blur transition-colors hover:text-inkt"
                aria-label={draait ? "Draaien stoppen" : "Laten draaien"}
              >
                <RotateCw className="h-4 w-4" strokeWidth={1.7} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-px border border-rand bg-rand sm:grid-cols-4">
              {[
                { k: "Bestand", w: model.naam },
                {
                  k: "Afmeting",
                  w: `${getal(model.maat.x, 0)} × ${getal(model.maat.y, 0)} × ${getal(model.maat.z, 0)} mm`,
                },
                { k: "Inhoud", w: `${getal(model.volumeCm3)} cm³` },
                { k: "Driehoeken", w: model.driehoeken.toLocaleString("nl-NL") },
              ].map((r) => (
                <div key={r.k} className="bg-papier px-4 py-3">
                  <p className="label text-inkt-zacht">{r.k}</p>
                  <p className="cijfers mt-1.5 truncate text-sm font-medium" title={r.w}>
                    {r.w}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                zetModel(null)
                zetToegevoegd(false)
              }}
              className="label mt-4 text-inkt-zacht underline underline-offset-4 hover:text-inkt"
            >
              Ander model kiezen
            </button>
          </div>
        )}

        {fout && (
          <div className="mt-4 flex items-start gap-3 border border-magenta/40 bg-magenta/5 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-magenta" />
            <p className="text-sm text-inkt">{fout}</p>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------- rechts: keuzes */}
      <div className="space-y-8">
        <Keuze
          label="Kleur filament"
          waarde={filamentId}
          onWijzig={zetFilament}
          opties={FILAMENTEN.map((f) => ({
            waarde: f.id,
            label: f.naam,
            hulp: f.soort,
            kleur: f.hex,
          }))}
        />

        <Schuif
          label="Vulling"
          waarde={vulling}
          eenheid=" %"
          min={0}
          max={100}
          stap={5}
          onWijzig={zetVulling}
          hulp="Twintig procent is stevig genoeg voor de meeste dingen. Meer vulling is sterker, maar kost meer materiaal en tijd."
        />

        <Schuif
          label="Laaghoogte"
          waarde={laagHoogte}
          eenheid=" mm"
          min={0.1}
          max={0.3}
          stap={0.05}
          onWijzig={zetLaagHoogte}
          hulp="Een dunnere laag ziet er gladder uit maar duurt langer. 0,2 is de gewone keuze."
        />

        <Veld label="Aantal">
          <Teller waarde={aantal} onWijzig={zetAantal} />
        </Veld>

        {prijs ? (
          <div>
            {!prijs.past && (
              <div className="mb-4 flex items-start gap-3 border border-magenta/40 bg-magenta/5 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-magenta" />
                <p className="text-sm">{prijs.waarschuwing}</p>
              </div>
            )}

            <PrijsOpbouw
              regels={prijs.regels}
              totaal={prijs.totaal}
              btw={prijs.btw}
              totaalInclusief={prijs.totaalInclusief}
              perStuk={prijs.perStuk}
              aantal={aantal}
            />

            <p className="mt-4 text-sm text-inkt-zacht">
              Printtijd ongeveer {Math.floor(prijs.printMinuten / 60)} uur{" "}
              {prijs.printMinuten % 60} minuten, {getal(prijs.materiaalGram)} gram
              filament. Klaar in {LEVERTIJD.min} tot {LEVERTIJD.max} werkdagen.
            </p>

            <Knop
              soort="vonk"
              className="mt-6 w-full"
              disabled={!prijs.past}
              onClick={() => {
                voegToe({
                  soort: "print3d",
                  naam: model!.naam.replace(/\.stl$/i, ""),
                  omschrijving: `${filament.naam}, ${vulling} procent vulling, laag ${getal(laagHoogte, 2)} mm`,
                  aantal,
                  bedrag: prijs.totaal,
                  kleurHex: filament.hex,
                  keuzes: {
                    filament: filament.id,
                    vulling,
                    laagHoogte,
                    volumeCm3: Math.round(model!.volumeCm3 * 100) / 100,
                  },
                })
                zetToegevoegd(true)
              }}
            >
              {toegevoegd ? (
                <>
                  <Check className="h-4 w-4" /> In de winkelwagen
                </>
              ) : (
                "In winkelwagen"
              )}
            </Knop>
          </div>
        ) : (
          <div className="border border-rand bg-papier-zacht px-5 py-8 text-center">
            <p className="text-inkt-zacht">
              Zodra je een model kiest zie je hier de prijs, uitgesplitst naar
              materiaal, printtijd en voorbereiding.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
