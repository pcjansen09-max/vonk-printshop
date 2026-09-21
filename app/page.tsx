import Link from "next/link"
import { ArrowRight, Boxes, Clock, MapPin, Ruler } from "lucide-react"
import { HeroDiepte } from "@/components/three/HeroDiepte"
import { PrintSectie } from "@/components/scroll/PrintSectie"
import { ProductPan } from "@/components/scroll/ProductPan"
import { FormaatGroei } from "@/components/scroll/FormaatGroei"
import { RolOntrolt } from "@/components/scroll/RolOntrolt"
import { Onthul } from "@/components/scroll/Onthul"
import { KnopLink } from "@/components/ui/Knop"
import { Label, Scheiding, Sectie, SectieKop } from "@/components/ui/Sectie"
import { LEVERTIJD, MERK } from "@/lib/merk"

const FEITEN = [
  { icoon: Clock, kop: `${LEVERTIJD.min} tot ${LEVERTIJD.max} werkdagen`, tekst: "van bestelling tot ophalen" },
  { icoon: Ruler, kop: "A4 tot en met A1", tekst: "en 3D tot 25 bij 25 centimeter" },
  { icoon: Boxes, kop: "Vanaf één stuk", tekst: "geen minimum van honderd" },
  { icoon: MapPin, kop: `In ${MERK.plaats}`, tekst: "zelf ophalen kan gewoon" },
]

const STAPPEN = [
  {
    nr: "01",
    kop: "Upload je model",
    tekst: "Sleep je STL erin. Wij lezen het bestand meteen uit en laten zien hoe groot het is en hoeveel materiaal erin gaat.",
    naar: "/3d-printen",
    link: "Model uploaden",
  },
  {
    nr: "02",
    kop: "Zie direct de prijs",
    tekst: "Geen mailtje, geen wachten tot morgen. Je ziet per onderdeel wat het kost: materiaal, printtijd en voorbereiding.",
    naar: "/3d-printen",
    link: "Prijs berekenen",
  },
  {
    nr: "03",
    kop: "Volg je print live",
    tekst: "Zodra de printer begint, zie je op je eigen scherm hoe ver hij is. Klaar is klaar, dan krijg je bericht.",
    naar: "/volgen",
    link: "Print volgen",
  },
]

const DOELGROEPEN = [
  { kop: "Horeca", tekst: "Menukaarthouders, tapknoppen per speciaalbier en bordjes voor je proeverij. Wisselt je kaart, dan wisselt het bordje mee." },
  { kop: "Kapsalons en retail", tekst: "Displays op maat in je eigen kleur, in plaats van standaard materiaal uit de groothandel." },
  { kop: "Verenigingen", tekst: "Medailles, sleutelhangers en sponsorbordjes. Ook als je er maar twintig nodig hebt." },
  { kop: "Bouw en installatie", tekst: "Een klem of afstandhouder die niet meer te koop is. Stil werk kost geld, dus wij printen hem binnen een dag." },
]

export default function Home() {
  return (
    <>
      {/* ------------------------------------------------ hero: gelaagde diepte */}
      <HeroDiepte>
        <div className="max-w-2xl">
          <Label>
            {MERK.school} {MERK.plaats} · Leerbedrijf
          </Label>
          <h1 className="kop kop-xl mt-6">
            Je model erin,
            <br />
            <span className="vonk-tekst">de prijs eruit.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-inkt-zacht sm:text-xl">
            Wij printen in 3D en drukken op papier, hier in {MERK.plaats}.
            Upload je bestand en je weet binnen een paar seconden wat het kost
            en wanneer het klaar is. Geen offerte die morgen misschien komt.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <KnopLink href="/3d-printen" soort="vol">
              Bereken je prijs
            </KnopLink>
            <KnopLink href="/ontwerpen" soort="lijn">
              Zelf ontwerpen
            </KnopLink>
          </div>
        </div>
      </HeroDiepte>

      {/* ------------------------------------------------------ feiten: rustig */}
      <Sectie className="relative z-10 pb-4">
        <div className="grid grid-cols-2 gap-px border border-rand bg-rand lg:grid-cols-4">
          {FEITEN.map((f, i) => (
            /* De kaart houdt zijn papier-achtergrond; alleen de inhoud komt
               binnen. Zet je de doorzichtigheid op de kaart zelf, dan zie je het
               rand-raster als grijze plaat tot het onthuld is. */
            <div key={f.kop} className="bg-papier p-6">
              <Onthul vertraging={i * 70}>
                <f.icoon className="h-5 w-5 text-magenta" strokeWidth={1.6} />
                <p className="mt-4 font-semibold tracking-tight">{f.kop}</p>
                <p className="mt-1 text-sm text-inkt-zacht">{f.tekst}</p>
              </Onthul>
            </div>
          ))}
        </div>
      </Sectie>

      {/* ------------------------------------- werkwijze: onthullen, één voor één */}
      <Sectie className="pt-28">
        <Onthul>
          <SectieKop
            label="Hoe het werkt"
            kop="Drie stappen, geen wachtkamer"
            uitleg={
              <>
                De printshops die er nu zijn werken via de mail. Je stuurt je
                bestand, je wacht op een prijs, je mailt terug. Bij ons zit die
                hele lus in de website.
              </>
            }
          />
        </Onthul>
        <div className="mt-14 grid gap-px border border-rand bg-rand md:grid-cols-3">
          {STAPPEN.map((s, i) => (
            <div key={s.nr} className="bg-papier">
              <Onthul vertraging={i * 110} className="flex h-full flex-col p-8">
                <span className="label vonk-tekst">{s.nr}</span>
                <h3 className="kop kop-m mt-5">{s.kop}</h3>
                <p className="mt-4 flex-1 leading-relaxed text-inkt-zacht">
                  {s.tekst}
                </p>
                <Link
                  href={s.naar}
                  className="label group mt-8 inline-flex items-center gap-2 text-inkt transition-colors hover:text-magenta"
                >
                  {s.link}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </Link>
              </Onthul>
            </div>
          ))}
        </div>
      </Sectie>

      {/* --------------------------- het wiel is de printer: vastgezet en geschrobd */}
      <PrintSectie />

      {/* ------------------------------------------ producten: zijwaarts langslopen */}
      <ProductPan />

      {/* ------------------------------------------------- papier: groeiende vellen */}
      <FormaatGroei />

      <RolOntrolt />

      {/* -------------------------------------------------- voor wie: stil en plat */}
      <Sectie className="pt-32">
        <Scheiding />
        <div className="grid gap-14 pt-16 lg:grid-cols-[1fr_1.3fr]">
          <Onthul>
            <SectieKop
              label="Voor wie"
              kop="Lokaal is hier het hele punt"
              uitleg={`Een sleutelhanger uit China duurt zes weken en komt in duizendtallen. Wij zitten in ${MERK.plaats} en printen er twintig.`}
            />
          </Onthul>
          <div className="grid gap-px self-start border border-rand bg-rand sm:grid-cols-2">
            {DOELGROEPEN.map((d, i) => (
              <div key={d.kop} className="bg-papier p-6">
                <Onthul vertraging={i * 80}>
                  <h3 className="font-semibold tracking-tight">{d.kop}</h3>
                  <p className="mt-2 leading-relaxed text-inkt-zacht">
                    {d.tekst}
                  </p>
                </Onthul>
              </div>
            ))}
          </div>
        </div>
      </Sectie>

      {/* ------------------------------------------------------------------- slot */}
      <Sectie className="pt-28">
        <Onthul>
          <div className="relative overflow-hidden border border-rand p-10 sm:p-16">
            <div className="vonk-vlak absolute inset-x-0 top-0 h-1" aria-hidden />
            <div className="max-w-xl">
              <h2 className="kop kop-l">Benieuwd wat jouw idee kost?</h2>
              <p className="mt-5 text-lg leading-relaxed text-inkt-zacht">
                Heb je nog geen 3D-bestand? Kies dan een product en zet je eigen
                kleur en logo erop. Je ziet de prijs terwijl je kiest.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <KnopLink href="/3d-printen" soort="vonk">
                  Model uploaden
                </KnopLink>
                <KnopLink href="/ontwerpen" soort="lijn">
                  Product kiezen
                </KnopLink>
              </div>
            </div>
          </div>
        </Onthul>
      </Sectie>
    </>
  )
}
