"use client"

import { useMemo, useState } from "react"
import { Check, Info } from "lucide-react"
import { Knop } from "@/components/ui/Knop"
import { Keuze, Teller, Veld } from "@/components/shop/Regelaar"
import { PrijsOpbouw } from "@/components/shop/PrijsOpbouw"
import { BestandUpload, type GekozenBestand } from "@/components/shop/BestandUpload"
import { PAPIER, type PapierSoort } from "@/lib/catalogus"
import { FORMATEN, berekenDrukwerk } from "@/lib/prijs/drukwerk"
import { LEVERTIJD } from "@/lib/merk"
import { useWinkelwagen } from "@/lib/winkelwagen"

/** De vier formaten op schaal, zodat je ziet wat je kiest. */
function FormaatBeeld({ id, voorbeeld }: { id: string; voorbeeld: string | null }) {
  const formaat = FORMATEN.find((f) => f.id === id)!
  const grootste = FORMATEN[FORMATEN.length - 1].mm
  const schaal = 0.78
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center border border-rand bg-papier-zacht p-8">
      {/* A1 als grijze omtrek, zodat het gekozen formaat een maat heeft om
          zich mee te vergelijken. Los is een rechthoek betekenisloos. */}
      <div
        className="absolute border border-dashed border-rand-sterk"
        style={{
          width: `${(grootste.breedte / grootste.hoogte) * 100 * schaal}%`,
          aspectRatio: `${grootste.breedte} / ${grootste.hoogte}`,
          maxHeight: `${100 * schaal}%`,
        }}
        aria-hidden
      />
      <div
        className="relative flex items-end justify-center shadow-[0_18px_40px_-24px_rgba(23,19,26,0.5)] transition-all duration-300"
        style={{
          width: `${(formaat.mm.breedte / grootste.hoogte) * 100 * schaal}%`,
          aspectRatio: `${formaat.mm.breedte} / ${formaat.mm.hoogte}`,
          maxHeight: `${100 * schaal}%`,
          background: voorbeeld
            ? undefined
            : "linear-gradient(158deg,#f8ab21 0%,#ee564a 52%,#e50075 100%)",
        }}
      >
        {voorbeeld && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={voorbeeld} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <span
          className={`label relative pb-3 ${voorbeeld ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" : "text-white/90"}`}
        >
          {formaat.naam}
        </span>
      </div>
      <p className="cijfers absolute bottom-4 left-5 text-xs text-inkt-zacht">
        {formaat.mm.breedte} × {formaat.mm.hoogte} mm
      </p>
    </div>
  )
}

export function DrukwerkRekenaar() {
  const [formaatId, zetFormaat] = useState<(typeof FORMATEN)[number]["id"]>("a3")
  const [papier, zetPapier] = useState<PapierSoort>("dik")
  const [aantal, zetAantal] = useState(25)
  const [dubbelzijdig, zetDubbel] = useState(false)
  const [bestand, zetBestand] = useState<GekozenBestand | null>(null)
  const [voorbeeld, zetVoorbeeld] = useState<string | null>(null)
  const [toegevoegd, zetToegevoegd] = useState(false)

  const voegToe = useWinkelwagen((s) => s.voegToe)
  const formaat = FORMATEN.find((f) => f.id === formaatId)!

  const prijs = useMemo(
    () => berekenDrukwerk({ formaat, papier, aantal, dubbelzijdig }),
    [formaat, papier, aantal, dubbelzijdig]
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <FormaatBeeld id={formaatId} voorbeeld={voorbeeld} />

        <div className="mt-5">
          <p className="label mb-3 text-inkt">Je ontwerp</p>
          <BestandUpload
            soort="poster"
            breedteCm={formaat.mm.breedte / 10}
            hoogteCm={formaat.mm.hoogte / 10}
            bestand={bestand}
            onKies={(b, url) => {
              zetBestand(b)
              zetVoorbeeld(url)
              zetToegevoegd(false)
            }}
          />
        </div>

        <div className="mt-4 flex items-start gap-3 border border-rand bg-papier px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-inkt-zacht" strokeWidth={1.7} />
          <p className="text-sm text-inkt-zacht">
            Wij printen en snijden op maat. Lamineren, echt drukwerk in grote
            oplagen en textiel bedrukken kunnen we niet; daar zijn we eerlijk
            over in plaats van dat je achteraf nee hoort.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <Keuze
          label="Formaat"
          waarde={formaatId}
          onWijzig={zetFormaat}
          kolommen={4}
          opties={FORMATEN.map((f) => ({
            waarde: f.id,
            label: f.naam,
            hulp: `${f.mm.breedte}×${f.mm.hoogte}`,
          }))}
        />

        <Keuze
          label="Papier"
          waarde={papier}
          onWijzig={zetPapier}
          kolommen={1}
          opties={(Object.keys(PAPIER) as PapierSoort[]).map((k) => ({
            waarde: k,
            label: PAPIER[k].naam,
            hulp: PAPIER[k].toelichting,
          }))}
        />

        <Veld label="Aantal">
          <div className="flex flex-wrap items-center gap-3">
            <Teller waarde={aantal} onWijzig={zetAantal} max={5000} />
            <div className="flex gap-1.5">
              {[10, 25, 100, 500].map((n) => (
                <button
                  key={n}
                  onClick={() => zetAantal(n)}
                  className={`cijfers border px-3 py-2 text-sm transition-colors ${
                    aantal === n
                      ? "border-inkt bg-inkt text-white"
                      : "border-rand hover:border-inkt"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </Veld>

        <Veld label="Afwerking">
          <label
            className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors ${
              dubbelzijdig ? "border-inkt bg-papier-zacht" : "border-rand hover:border-inkt"
            }`}
          >
            <input
              type="checkbox"
              checked={dubbelzijdig}
              onChange={(e) => zetDubbel(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-magenta"
            />
            <span>
              <span className="block font-medium">Dubbelzijdig</span>
              <span className="block text-sm text-inkt-zacht">
                Voor programmakaarten en flyers met een achterkant.
              </span>
            </span>
          </label>
        </Veld>

        <div>
          <PrijsOpbouw
            regels={prijs.regels}
            totaal={prijs.totaal}
            btw={prijs.btw}
            totaalInclusief={prijs.totaalInclusief}
            perStuk={prijs.perStuk}
            aantal={aantal}
          />
          <p className="mt-4 text-sm text-inkt-zacht">
            Klaar in {LEVERTIJD.min} tot {LEVERTIJD.max} werkdagen. Je bestand
            mag je na het bestellen aanleveren, of je mailt het ons.
          </p>
          <Knop
            soort="vonk"
            className="mt-6 w-full"
            onClick={() => {
              voegToe({
                soort: "drukwerk",
                naam: `${formaat.naam} op ${PAPIER[papier].naam.toLowerCase()}`,
                omschrijving: dubbelzijdig ? "dubbelzijdig" : "enkelzijdig",
                aantal,
                bedrag: prijs.totaal,
                bestandsnaam: bestand?.naam,
                keuzes: { formaat: formaat.id, papier, dubbelzijdig },
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
      </div>
    </div>
  )
}
