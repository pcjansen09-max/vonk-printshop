"use client"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Thermometer, Layers, Clock, AlertCircle } from "lucide-react"
import { Knop } from "@/components/ui/Knop"
import { PRODUCTEN } from "@/lib/catalogus"
import {
  BESTELNUMMER,
  STAAT_TEKST,
  haalStatus,
  normaliseerBestelnummer,
  type PrintStatus,
} from "@/lib/printer/status"

const Voortgang = dynamic(() => import("@/components/three/PrintVoortgang"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-inkt-zacht">
      Beeld wordt geladen…
    </div>
  ),
})

const VOORBEELD = "VP-2026-0148"

export function Volger() {
  const router = useRouter()
  const zoek = useSearchParams()
  const uitUrl = zoek.get("bestelling")

  const [invoer, zetInvoer] = useState(uitUrl ?? "")
  const [fout, zetFout] = useState<string | null>(null)
  const [status, zetStatus] = useState<PrintStatus | null>(null)

  const nummer = uitUrl ? normaliseerBestelnummer(uitUrl) : null

  // Elke twee seconden opnieuw ophalen. Zodra de printer echt gekoppeld is,
  // wordt dit hetzelfde ritme maar dan met een verzoek naar de printer.
  useEffect(() => {
    if (!nummer || !BESTELNUMMER.test(nummer)) {
      const leeg = requestAnimationFrame(() => zetStatus(null))
      return () => cancelAnimationFrame(leeg)
    }
    const bijwerken = () => zetStatus(haalStatus(nummer, new Date()))
    // De eerste keer in de volgende tekening, niet nu meteen: state zetten
    // midden in een effect laat React de boom nog een keer doorlopen.
    const eerste = requestAnimationFrame(bijwerken)
    const tik = setInterval(bijwerken, 2000)
    return () => {
      cancelAnimationFrame(eerste)
      clearInterval(tik)
    }
  }, [nummer])

  function zoeken(e: React.FormEvent) {
    e.preventDefault()
    const schoon = normaliseerBestelnummer(invoer)
    if (!BESTELNUMMER.test(schoon)) {
      zetFout(
        "Een bestelnummer ziet er zo uit: VP-2026-0148. Je vindt hem in je bevestigingsmail."
      )
      return
    }
    zetFout(null)
    router.push(`/volgen?bestelling=${schoon}`)
  }

  if (!status) {
    return (
      <div className="max-w-lg">
        <form onSubmit={zoeken}>
          <label htmlFor="bestelnummer" className="label text-inkt">
            Bestelnummer
          </label>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkt-zacht" />
              <input
                id="bestelnummer"
                value={invoer}
                onChange={(e) => zetInvoer(e.target.value)}
                placeholder="VP-2026-0148"
                className="cijfers h-11 w-full border border-rand bg-papier pl-9 pr-3 outline-none transition-colors focus:border-inkt"
              />
            </div>
            <Knop type="submit">Zoeken</Knop>
          </div>
        </form>

        {fout && (
          <p className="mt-3 flex items-start gap-2 text-sm text-magenta">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {fout}
          </p>
        )}

        <p className="mt-6 text-sm text-inkt-zacht">
          Even kijken hoe het werkt?{" "}
          <button
            onClick={() => router.push(`/volgen?bestelling=${VOORBEELD}`)}
            className="text-inkt underline underline-offset-4 hover:text-magenta"
          >
            Bekijk een voorbeeldbestelling
          </button>
        </p>
      </div>
    )
  }

  const product = PRODUCTEN.find((p) => status.product.startsWith(p.naam)) ?? PRODUCTEN[1]
  const procent = Math.round(status.voortgang * 100)

  return (
    <div>
      {!status.echteData && (
        <div className="mb-6 flex items-start gap-3 border border-amber/60 bg-amber/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p className="text-sm">
            <strong className="font-semibold">Voorbeeld.</strong> De printer
            hangt nog niet aan de site, dus deze cijfers zijn nagebootst. Zodra
            de printer een sleutel heeft, komt hier precies dit scherm te staan
            met de echte stand.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-[4/3] border border-rand bg-papier-zacht">
          <Voortgang
            id={product.id}
            kleur={status.kleurHex}
            voortgang={status.voortgang}
            maat={product.maat}
          />
        </div>

        <div>
          <p className="label text-inkt-zacht">{status.bestelnummer}</p>
          <h2 className="kop kop-m mt-3">{status.product}</h2>

          <div className="mt-7">
            <div className="flex items-baseline justify-between">
              <span className="label">{STAAT_TEKST[status.staat]}</span>
              <span className="cijfers text-3xl font-semibold tracking-tight">
                {procent}%
              </span>
            </div>
            <div
              className="mt-3 h-2 w-full overflow-hidden bg-papier-diep"
              role="progressbar"
              aria-valuenow={procent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Voortgang van de print"
            >
              <div
                className="vonk-vlak h-full transition-[width] duration-1000 ease-linear"
                style={{ width: `${Math.max(procent, 1)}%` }}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px border border-rand bg-rand">
            {[
              {
                icoon: Layers,
                kop: "Laag",
                waarde: `${status.laag} van ${status.lagenTotaal}`,
              },
              {
                icoon: Clock,
                kop: "Nog te gaan",
                waarde:
                  status.restMinuten === 0
                    ? "Klaar"
                    : status.restMinuten >= 60
                      ? `${Math.floor(status.restMinuten / 60)} uur ${status.restMinuten % 60} min`
                      : `${status.restMinuten} min`,
              },
              {
                icoon: Thermometer,
                kop: "Spuitmond",
                waarde: `${status.nozzleC} °C`,
              },
              {
                icoon: Thermometer,
                kop: "Printplaat",
                waarde: `${status.plaatC} °C`,
              },
            ].map((r) => (
              <div key={r.kop} className="bg-papier p-5">
                <r.icoon className="h-4 w-4 text-inkt-zacht" strokeWidth={1.7} />
                <p className="label mt-3 text-inkt-zacht">{r.kop}</p>
                <p className="cijfers mt-1 text-lg font-medium">{r.waarde}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-inkt-zacht">
            {status.staat === "klaar"
              ? "Je bestelling staat klaar. Je krijgt bericht zodra je hem kunt ophalen."
              : "Zodra de print klaar is krijg je automatisch bericht. Je hoeft dit scherm niet open te houden."}
          </p>

          <button
            onClick={() => router.push("/volgen")}
            className="label mt-6 text-inkt-zacht underline underline-offset-4 hover:text-inkt"
          >
            Andere bestelling zoeken
          </button>
        </div>
      </div>
    </div>
  )
}
