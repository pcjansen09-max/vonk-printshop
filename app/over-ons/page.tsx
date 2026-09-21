import type { Metadata } from "next"
import { Check, X } from "lucide-react"
import { KnopLink } from "@/components/ui/Knop"
import { Label, Scheiding, Sectie, SectieKop } from "@/components/ui/Sectie"
import { LEVERTIJD, MERK } from "@/lib/merk"
import { FILAMENTEN, PAPIER } from "@/lib/catalogus"

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "De Printshop van Vonk Schagen: wat we kunnen, wat we niet kunnen, met welke machines we werken en voor wie we printen.",
}

const MACHINES = [
  { naam: "3D-printer", wat: "Tot 256 bij 256 bij 256 millimeter, in PLA en PETG." },
  { naam: "Printer", wat: "Van A4 tot A1, in kleur, tot 500 vel per opdracht." },
  { naam: "Snijmachine", wat: "Recht op maat snijden, ook afwijkende formaten." },
  { naam: "Rolprinter", wat: "Banners tot 150 centimeter breed, elke lengte." },
]

const WEL = [
  "3D printen in PLA en PETG, vanaf één stuk",
  "Posters, flyers, programmakaarten en menukaarten",
  "Banners op pvc, mesh of textiel, op maat",
  "Op normaal papier, dik karton en fotopapier",
  "A4, A3, A2 en A1",
  "Snijden op maat",
  "Je eigen kleur en je eigen logo",
]

const NIET = [
  "Echt drukwerk in grote oplagen; dat is een drukkerij",
  "Textiel of kleding bedrukken",
  "Lamineren; die machine hebben we niet",
  "Werk waar we de rechten niet van kennen",
]

const DOELGROEPEN = [
  {
    id: "horeca",
    kop: "Horeca",
    tekst: "Een café wisselt zijn kaart en zijn speciaalbieren voortdurend. Elke wissel is nieuw materiaal: een tapknop, een bordje bij de proeverij, een houder voor de nieuwe kaart. Wij printen dat in jullie eigen kleur en met jullie logo, en dat kan bij ons vanaf één stuk.",
  },
  {
    id: "retail",
    kop: "Kapsalons en retail",
    tekst: "Displays voor je balie koop je nu standaard in bij een groothandel, in het formaat dat toevallig bestaat. Wij maken ze op maat en in je huisstijlkleur, zodat je balie er niet uitziet als die van iedereen.",
  },
  {
    id: "verenigingen",
    kop: "Verenigingen",
    tekst: "Medailles voor een toernooi, sleutelhangers met het clublogo, bordjes voor je sponsors. Grote partijen willen er graag duizend leveren; wij maken er dertig, en we zitten om de hoek.",
  },
  {
    id: "bouw",
    kop: "Bouw en installatie",
    tekst: "Een klem, een afstandhouder of een mal die niet meer te koop is. Stilstaand werk kost meer dan het onderdeel. Stuur je model of een foto met maten, dan ligt er de volgende dag een vervanger.",
  },
]

export default function Pagina() {
  return (
    <>
      <Sectie className="pt-16 sm:pt-20">
        <div className="max-w-2xl">
          <Label>Over ons</Label>
          <h1 className="kop kop-l mt-4">
            De printshop van {MERK.school} {MERK.plaats}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-inkt-zacht">
            Wij zijn het leerbedrijf van {MERK.school} in {MERK.plaats}. We
            printen in 3D en we drukken op papier, en we doen dat voor
            ondernemers en verenigingen hier in de buurt.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-inkt-zacht">
            Het verschil met de drukkerijen die er al zijn zit niet in de
            machines maar in het wachten. Daar stuur je een bestand, wacht je op
            een prijs en mail je terug. Bij ons zit die hele lus in de website:
            je uploadt, je ziet de prijs, je bestelt, en je kijkt live mee met
            de printer.
          </p>
        </div>
      </Sectie>

      <Sectie id="werkwijze" className="pt-20">
        <div className="grid gap-px border border-rand bg-rand sm:grid-cols-2">
          <div className="bg-papier p-8">
            <p className="label text-inkt">Dit doen we</p>
            <ul className="mt-6 space-y-3">
              {WEL.map((w) => (
                <li key={w} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-magenta" strokeWidth={2.2} />
                  <span className="leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-papier p-8">
            <p className="label text-inkt">Dit doen we niet</p>
            <ul className="mt-6 space-y-3">
              {NIET.map((n) => (
                <li key={n} className="flex gap-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-inkt-zacht" strokeWidth={2.2} />
                  <span className="leading-relaxed text-inkt-zacht">{n}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-inkt-zacht">
              Liever meteen nee dan een week later. Kunnen we het niet, dan
              weten we meestal wel wie het wel kan.
            </p>
          </div>
        </div>
      </Sectie>

      <Sectie className="pt-20">
        <SectieKop label="Machines" kop="Waar we mee werken" />
        <div className="mt-10 grid gap-px border border-rand bg-rand sm:grid-cols-2 lg:grid-cols-4">
          {MACHINES.map((m) => (
            <div key={m.naam} className="bg-papier p-6">
              <h3 className="font-semibold tracking-tight">{m.naam}</h3>
              <p className="mt-2 leading-relaxed text-inkt-zacht">{m.wat}</p>
            </div>
          ))}
        </div>
      </Sectie>

      <Sectie className="pt-20">
        <SectieKop label="Materiaal" kop="Filament en papier" />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="label text-inkt-zacht">Filament</p>
            <ul className="mt-5 space-y-3">
              {FILAMENTEN.map((f) => (
                <li key={f.id} className="flex items-start gap-3">
                  <span
                    className="mt-1 h-4 w-4 shrink-0 border border-black/15"
                    style={{ background: f.hex }}
                    aria-hidden
                  />
                  <span>
                    <span className="font-medium">{f.naam}</span>
                    <span className="text-inkt-zacht"> · {f.soort}</span>
                    <span className="block text-sm text-inkt-zacht">
                      {f.waarvoor}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label text-inkt-zacht">Papier</p>
            <ul className="mt-5 space-y-3">
              {Object.entries(PAPIER).map(([k, p]) => (
                <li key={k}>
                  <span className="font-medium">{p.naam}</span>
                  <span className="block text-sm text-inkt-zacht">
                    {p.toelichting}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-inkt-zacht">
              Zit je materiaal er niet bij? Vraag het gerust. We kunnen vaak wat
              bestellen als het een terugkerende opdracht wordt.
            </p>
          </div>
        </div>
      </Sectie>

      <Sectie className="pt-20">
        <Scheiding />
        <div className="pt-16">
          <SectieKop label="Voor wie" kop="Wie er bij ons printen" />
          <div className="mt-10 grid gap-px border border-rand bg-rand sm:grid-cols-2">
            {DOELGROEPEN.map((d) => (
              <div key={d.id} id={d.id} className="scroll-mt-24 bg-papier p-8">
                <h3 className="text-xl font-semibold tracking-tight">{d.kop}</h3>
                <p className="mt-3 leading-relaxed text-inkt-zacht">{d.tekst}</p>
              </div>
            ))}
          </div>
        </div>
      </Sectie>

      <Sectie id="contact" className="scroll-mt-24 pt-20">
        <div className="grid gap-10 border border-rand p-10 sm:p-14 lg:grid-cols-2">
          <div>
            <Label>Contact</Label>
            <h2 className="kop kop-l mt-4">Even overleggen mag ook</h2>
            <p className="mt-5 leading-relaxed text-inkt-zacht">
              Weet je niet zeker of iets kan, of heb je geen 3D-bestand? Loop
              binnen of stuur een bericht. We denken graag mee, ook als het
              uiteindelijk een klein klusje is.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <KnopLink href="/3d-printen" soort="vol">
                Prijs berekenen
              </KnopLink>
              <KnopLink href="/ontwerpen" soort="lijn">
                Zelf ontwerpen
              </KnopLink>
            </div>
          </div>
          <dl className="space-y-5 self-center">
            {[
              { k: "Adres", w: MERK.adres },
              { k: "Telefoon", w: MERK.telefoon },
              { k: "E-mail", w: MERK.email },
              {
                k: "Levertijd",
                w: `${LEVERTIJD.min} tot ${LEVERTIJD.max} werkdagen`,
              },
            ].map((r) => (
              <div key={r.k} className="border-b border-rand pb-4 last:border-0">
                <dt className="label text-inkt-zacht">{r.k}</dt>
                <dd className="mt-1.5 text-lg">{r.w}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Sectie>
    </>
  )
}
