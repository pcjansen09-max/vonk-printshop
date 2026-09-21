"use client"

import Link from "next/link"
import { Paperclip, Trash2 } from "lucide-react"
import { KnopLink } from "@/components/ui/Knop"
import { Teller } from "@/components/shop/Regelaar"
import { BTW, centen, euro } from "@/lib/prijs/geld"
import { LEVERTIJD } from "@/lib/merk"
import { useWagenKlaar, useWinkelwagen } from "@/lib/winkelwagen"

const SOORT_LABEL = {
  print3d: "3D-print van eigen model",
  ontwerp: "Zelf ontworpen",
  drukwerk: "Drukwerk",
  banner: "Banner op maat",
} as const

export function WinkelwagenLijst() {
  const regels = useWinkelwagen((s) => s.regels)
  const verwijder = useWinkelwagen((s) => s.verwijder)
  const wijzigAantal = useWinkelwagen((s) => s.wijzigAantal)
  const totaal = useWinkelwagen((s) => s.totaal())
  const klaar = useWagenKlaar()

  // Zolang de opslag van de browser nog niet gelezen is, weten we niet of de
  // wagen leeg is. Dan hier niets beweren.
  if (!klaar) {
    return <div className="h-64 border border-rand bg-papier-zacht" aria-hidden />
  }

  if (regels.length === 0) {
    return (
      <div className="border border-rand bg-papier-zacht px-6 py-16 text-center">
        <p className="text-lg">Je winkelwagen is nog leeg.</p>
        <p className="mx-auto mt-3 max-w-md text-inkt-zacht">
          Upload een model, ontwerp zelf iets of reken je drukwerk uit. Je ziet
          overal meteen wat het kost.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <KnopLink href="/3d-printen">Model uploaden</KnopLink>
          <KnopLink href="/ontwerpen" soort="lijn">
            Zelf ontwerpen
          </KnopLink>
          <KnopLink href="/drukwerk" soort="lijn">
            Drukwerk
          </KnopLink>
          <KnopLink href="/banners" soort="lijn">
            Banners
          </KnopLink>
        </div>
      </div>
    )
  }

  const btw = centen(totaal * BTW)

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <ul className="border border-rand">
        {regels.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-start gap-4 border-b border-rand p-5 last:border-0"
          >
            <span
              className="mt-1 h-10 w-10 shrink-0 border border-black/10"
              style={{
                background: r.kleurHex ?? "var(--papier-diep)",
              }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="label text-inkt-zacht">{SOORT_LABEL[r.soort]}</p>
              <p className="mt-1.5 font-semibold tracking-tight">{r.naam}</p>
              <p className="mt-0.5 text-sm text-inkt-zacht">{r.omschrijving}</p>
              {r.bestandsnaam && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-inkt-zacht">
                  <Paperclip className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} />
                  <span className="truncate" title={r.bestandsnaam}>
                    {r.bestandsnaam}
                  </span>
                </p>
              )}
              <div className="mt-4 flex items-center gap-4">
                <Teller
                  waarde={r.aantal}
                  onWijzig={(n) => wijzigAantal(r.id, n)}
                  max={5000}
                />
                <button
                  onClick={() => verwijder(r.id)}
                  className="flex items-center gap-1.5 text-sm text-inkt-zacht transition-colors hover:text-magenta"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                  Weghalen
                </button>
              </div>
            </div>
            <p className="cijfers ml-auto whitespace-nowrap text-lg font-semibold">
              {euro(r.bedrag)}
            </p>
          </li>
        ))}
      </ul>

      <div className="border border-rand bg-papier-zacht p-6">
        <p className="label">Overzicht</p>
        <dl className="mt-5 space-y-2.5">
          <div className="flex justify-between">
            <dt className="text-inkt-zacht">Subtotaal</dt>
            <dd className="cijfers">{euro(totaal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-inkt-zacht">Btw 21 procent</dt>
            <dd className="cijfers">{euro(btw)}</dd>
          </div>
          <div className="flex justify-between border-t border-rand pt-3 text-lg font-semibold">
            <dt>Totaal</dt>
            <dd className="cijfers">{euro(centen(totaal + btw))}</dd>
          </div>
        </dl>
        <KnopLink href="/bestellen" soort="vonk" className="mt-6 w-full">
          Bestellen
        </KnopLink>
        <p className="mt-4 text-sm text-inkt-zacht">
          Klaar in {LEVERTIJD.min} tot {LEVERTIJD.max} werkdagen. Ophalen in
          Schagen kan gratis.
        </p>
        <Link
          href="/3d-printen"
          className="label mt-5 block text-inkt-zacht underline underline-offset-4 hover:text-inkt"
        >
          Verder winkelen
        </Link>
      </div>
    </div>
  )
}
