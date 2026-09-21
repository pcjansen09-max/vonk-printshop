"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Knop, KnopLink } from "@/components/ui/Knop"
import { BTW, centen, euro } from "@/lib/prijs/geld"
import { LEVERTIJD, MERK } from "@/lib/merk"
import { useWagenKlaar, useWinkelwagen } from "@/lib/winkelwagen"
import { nieuwBestelnummer, useBestellingen } from "@/lib/bestellingen"

type Fouten = Partial<Record<"naam" | "email" | "telefoon", string>>

function Invoer({
  id,
  label,
  type = "text",
  waarde,
  onWijzig,
  fout,
  hulp,
  verplicht = false,
  autoComplete,
}: {
  id: string
  label: string
  type?: string
  waarde: string
  onWijzig: (w: string) => void
  fout?: string
  hulp?: string
  verplicht?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="label text-inkt">
        {label}
        {!verplicht && <span className="text-inkt-zacht"> (optioneel)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={waarde}
        autoComplete={autoComplete}
        aria-invalid={!!fout}
        aria-describedby={fout ? `${id}-fout` : undefined}
        onChange={(e) => onWijzig(e.target.value)}
        className={`mt-3 h-11 w-full border bg-papier px-3 outline-none transition-colors focus:border-inkt ${
          fout ? "border-magenta" : "border-rand"
        }`}
      />
      {fout && (
        <p id={`${id}-fout`} className="mt-2 text-sm text-magenta">
          {fout}
        </p>
      )}
      {hulp && !fout && <p className="mt-2 text-sm text-inkt-zacht">{hulp}</p>}
    </div>
  )
}

export function Bestelformulier() {
  const regels = useWinkelwagen((s) => s.regels)
  const totaal = useWinkelwagen((s) => s.totaal())
  const leeg = useWinkelwagen((s) => s.leeg)
  const bewaar = useBestellingen((s) => s.bewaar)
  const klaar = useWagenKlaar()

  const [naam, zetNaam] = useState("")
  const [bedrijf, zetBedrijf] = useState("")
  const [email, zetEmail] = useState("")
  const [telefoon, zetTelefoon] = useState("")
  const [ophalen, zetOphalen] = useState(true)
  const [opmerking, zetOpmerking] = useState("")
  const [fouten, zetFouten] = useState<Fouten>({})
  const [nummer, zetNummer] = useState<string | null>(null)
  const [gekopieerd, zetGekopieerd] = useState(false)

  const btw = centen(totaal * BTW)

  function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const f: Fouten = {}
    if (!naam.trim()) f.naam = "We hebben een naam nodig om je te kunnen bellen."
    // Bewust ruim: één apenstaartje met iets ervoor en een punt erachter. Een
    // strengere regel houdt echte adressen tegen en dat kost een bestelling.
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      f.email = "Vul een e-mailadres in waarop we je kunnen bereiken."
    if (telefoon.trim() && telefoon.replace(/\D/g, "").length < 9)
      f.telefoon = "Dit telefoonnummer lijkt niet compleet."
    zetFouten(f)
    if (Object.keys(f).length > 0) return

    const nu = new Date()
    const bestelnummer = nieuwBestelnummer(nu)
    bewaar({
      nummer: bestelnummer,
      geplaatstOp: nu.toISOString(),
      naam: naam.trim(),
      bedrijf: bedrijf.trim(),
      email: email.trim(),
      telefoon: telefoon.trim(),
      ophalen,
      opmerking: opmerking.trim(),
      regels,
      totaal: centen(totaal + btw),
    })
    leeg()
    zetNummer(bestelnummer)
  }

  if (nummer) {
    return (
      <div className="max-w-xl">
        <div className="border border-rand bg-papier p-8">
          <span className="vonk-vlak inline-flex h-11 w-11 items-center justify-center">
            <Check className="h-5 w-5 text-white" strokeWidth={2.4} />
          </span>
          <h2 className="kop kop-m mt-6">Bedankt, we gaan aan de slag</h2>
          <p className="mt-4 leading-relaxed text-inkt-zacht">
            Je bestelling staat in de wachtrij. We kijken je bestand na en
            zetten de printer aan. Duurt er iets langer dan verwacht, dan hoor
            je dat van ons.
          </p>

          <div className="mt-7 border border-rand bg-papier-zacht p-5">
            <p className="label text-inkt-zacht">Je bestelnummer</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="cijfers text-2xl font-semibold tracking-tight">
                {nummer}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(nummer)
                  zetGekopieerd(true)
                }}
                className="flex items-center gap-1.5 text-sm text-inkt-zacht transition-colors hover:text-inkt"
              >
                {gekopieerd ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Gekopieerd
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Kopiëren
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-sm text-inkt-zacht">
              Hiermee volg je je print. Bewaar hem even.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <KnopLink href={`/volgen?bestelling=${nummer}`} soort="vol">
              Print volgen
            </KnopLink>
            <KnopLink href="/" soort="lijn">
              Terug naar de site
            </KnopLink>
          </div>
        </div>
      </div>
    )
  }

  if (!klaar) {
    return <div className="h-64 max-w-xl border border-rand bg-papier-zacht" aria-hidden />
  }

  if (regels.length === 0) {
    return (
      <div className="max-w-xl border border-rand bg-papier-zacht px-6 py-12 text-center">
        <p className="text-lg">Er zit nog niets in je winkelwagen.</p>
        <KnopLink href="/3d-printen" className="mt-6">
          Iets uitzoeken
        </KnopLink>
      </div>
    )
  }

  return (
    <form onSubmit={verstuur} noValidate className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
      <div className="space-y-6">
        <Invoer
          id="naam"
          label="Je naam"
          waarde={naam}
          onWijzig={zetNaam}
          fout={fouten.naam}
          verplicht
          autoComplete="name"
        />
        <Invoer
          id="bedrijf"
          label="Bedrijf of vereniging"
          waarde={bedrijf}
          onWijzig={zetBedrijf}
          autoComplete="organization"
        />
        <Invoer
          id="email"
          label="E-mail"
          type="email"
          waarde={email}
          onWijzig={zetEmail}
          fout={fouten.email}
          verplicht
          autoComplete="email"
          hulp="Hier sturen we je bevestiging en het bericht dat je print klaar is."
        />
        <Invoer
          id="telefoon"
          label="Telefoon"
          type="tel"
          waarde={telefoon}
          onWijzig={zetTelefoon}
          fout={fouten.telefoon}
          autoComplete="tel"
        />

        <fieldset>
          <legend className="label text-inkt">Afhalen of bezorgen</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { aan: true, kop: "Ophalen in Schagen", hulp: `Gratis, bij ${MERK.adres}` },
              { aan: false, kop: "Laten bezorgen", hulp: "We nemen contact op over de kosten" },
            ].map((o) => (
              <label
                key={o.kop}
                className={`cursor-pointer border px-4 py-3 transition-colors ${
                  ophalen === o.aan ? "border-inkt bg-papier-zacht" : "border-rand hover:border-inkt"
                }`}
              >
                <input
                  type="radio"
                  name="bezorgen"
                  checked={ophalen === o.aan}
                  onChange={() => zetOphalen(o.aan)}
                  className="enkel-voorlezen"
                />
                <span className="block font-medium">{o.kop}</span>
                <span className="block text-sm text-inkt-zacht">{o.hulp}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="opmerking" className="label text-inkt">
            Opmerking <span className="text-inkt-zacht">(optioneel)</span>
          </label>
          <textarea
            id="opmerking"
            rows={4}
            value={opmerking}
            onChange={(e) => zetOpmerking(e.target.value)}
            placeholder="Bijvoorbeeld: het moet klaar zijn voor de proeverij van zaterdag."
            className="mt-3 w-full border border-rand bg-papier p-3 outline-none transition-colors focus:border-inkt"
          />
        </div>
      </div>

      <div className="border border-rand bg-papier-zacht p-6">
        <p className="label">Je bestelling</p>
        <ul className="mt-5 space-y-3">
          {regels.map((r) => (
            <li key={r.id} className="flex justify-between gap-4 text-sm">
              <span className="min-w-0">
                <span className="block font-medium">{r.naam}</span>
                <span className="cijfers block text-inkt-zacht">
                  {r.aantal} stuks
                </span>
              </span>
              <span className="cijfers whitespace-nowrap">{euro(r.bedrag)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2.5 border-t border-rand pt-4">
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

        <Knop soort="vonk" type="submit" className="mt-6 w-full">
          Bestelling plaatsen
        </Knop>
        <p className="mt-4 text-sm text-inkt-zacht">
          Je betaalt bij het ophalen. Klaar in {LEVERTIJD.min} tot{" "}
          {LEVERTIJD.max} werkdagen.
        </p>
        <Link
          href="/winkelwagen"
          className="label mt-5 block text-inkt-zacht underline underline-offset-4 hover:text-inkt"
        >
          Terug naar de winkelwagen
        </Link>
      </div>
    </form>
  )
}
