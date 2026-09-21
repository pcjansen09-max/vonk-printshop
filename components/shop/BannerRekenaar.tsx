"use client"

import { useMemo, useState } from "react"
import { Check, Info } from "lucide-react"
import { Knop } from "@/components/ui/Knop"
import { Keuze, Teller, Veld } from "@/components/shop/Regelaar"
import { PrijsOpbouw } from "@/components/shop/PrijsOpbouw"
import { BestandUpload, type GekozenBestand } from "@/components/shop/BestandUpload"
import {
  BANNERMATERIAAL,
  MAX_BREEDTE_CM,
  berekenBanner,
  type BannerMateriaal,
} from "@/lib/prijs/banner"
import { LEVERTIJD } from "@/lib/merk"
import { useWinkelwagen } from "@/lib/winkelwagen"

/** Maten waar mensen het vaakst om vragen, zodat je niet hoeft na te denken. */
const VEELGEVRAAGD = [
  { naam: "Boven een kraam", breedte: 200, hoogte: 60 },
  { naam: "Langs een hek", breedte: 300, hoogte: 100 },
  { naam: "Achter de bar", breedte: 150, hoogte: 100 },
  { naam: "Naast de deur", breedte: 80, hoogte: 200 },
]

const PERSOON_CM = 180

/**
 * Hoe groot is dat nou eigenlijk.
 *
 * Twee bij één meter zegt niemand iets zolang het los op een scherm staat. Daar
 * zetten we dus een mens van 1,80 naast, op dezelfde schaal, en als er een
 * ontwerp is geüpload staat dat in het doek. Dan is de maat een beeld in plaats
 * van een getal.
 */
function MaatBeeld({
  breedteCm,
  hoogteCm,
  ogen,
  aantalOgen,
  voorbeeld,
}: {
  breedteCm: number
  hoogteCm: number
  ogen: boolean
  aantalOgen: number
  voorbeeld: string | null
}) {
  // Alles past in een vak dat 360 cm breed en 230 cm hoog voorstelt.
  const VAK_B = Math.max(360, breedteCm + 90)
  const VAK_H = Math.max(230, hoogteCm + 30)
  const pct = (cm: number, totaal: number) => `${(cm / totaal) * 100}%`

  // De ogen zitten om de vijftig centimeter; we tekenen ze op de bovenrand zodat
  // je ziet hoe vaak hij opgehangen wordt, niet allemaal vier kanten rond.
  const bovenOgen = ogen ? Math.max(2, Math.round(breedteCm / 50) + 1) : 0

  return (
    <div className="relative flex aspect-[16/10] items-end justify-center overflow-hidden border border-rand bg-papier-zacht px-6 pb-6">
      <div className="relative flex h-full w-full items-end justify-center gap-[2%]">
        <div
          className="relative shrink-0 shadow-[0_22px_50px_-28px_rgba(23,19,26,0.55)] transition-all duration-300"
          style={{
            width: pct(breedteCm, VAK_B),
            height: pct(hoogteCm, VAK_H),
            background: voorbeeld
              ? undefined
              : "linear-gradient(158deg,#f8ab21 0%,#ee564a 52%,#e50075 100%)",
          }}
        >
          {voorbeeld && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={voorbeeld} alt="" className="h-full w-full object-cover" />
          )}
          {bovenOgen > 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-[1.5%] pt-[1.5%]">
              {Array.from({ length: bovenOgen }).map((_, i) => (
                <span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full bg-papier/80 ring-1 ring-inkt/30 sm:h-2 sm:w-2"
                />
              ))}
            </div>
          )}
        </div>

        {/* De mens ernaast, op dezelfde schaal. */}
        <div
          className="relative shrink-0"
          style={{ width: "5%", height: pct(PERSOON_CM, VAK_H) }}
          aria-hidden
        >
          <svg viewBox="0 0 20 72" className="h-full w-full text-rand-sterk" fill="currentColor">
            <circle cx="10" cy="6" r="5" />
            <path d="M4 13h12l2 26h-4l-1 33h-3l-1-24h-2l-1 24H3L2 39H0z" transform="translate(2)" />
          </svg>
        </div>
      </div>

      <p className="cijfers absolute left-5 top-4 text-xs text-inkt-zacht">
        {breedteCm} × {hoogteCm} cm
      </p>
      <p className="label absolute right-5 top-4 text-inkt-zacht">
        {ogen ? `${aantalOgen} ogen` : "zonder ogen"}
      </p>
      <p className="cijfers absolute bottom-1.5 right-5 text-xs text-inkt-zacht">
        mens 1,80 m
      </p>
    </div>
  )
}

export function BannerRekenaar() {
  const [breedteCm, zetBreedte] = useState(200)
  const [hoogteCm, zetHoogte] = useState(100)
  const [materiaal, zetMateriaal] = useState<BannerMateriaal>("pvc")
  const [ogen, zetOgen] = useState(true)
  const [zoom, zetZoom] = useState(true)
  const [aantal, zetAantal] = useState(1)
  const [bestand, zetBestand] = useState<GekozenBestand | null>(null)
  const [voorbeeld, zetVoorbeeld] = useState<string | null>(null)
  const [toegevoegd, zetToegevoegd] = useState(false)

  const voegToe = useWinkelwagen((s) => s.voegToe)

  const uitkomst = useMemo(() => {
    try {
      return {
        prijs: berekenBanner({ breedteCm, hoogteCm, materiaal, ogen, zoom, aantal }),
        fout: null as string | null,
      }
    } catch (e) {
      return { prijs: null, fout: e instanceof Error ? e.message : "Dit lukt niet." }
    }
  }, [breedteCm, hoogteCm, materiaal, ogen, zoom, aantal])

  const { prijs, fout } = uitkomst
  const teBreed = breedteCm > MAX_BREEDTE_CM && hoogteCm > MAX_BREEDTE_CM

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-4">
        <MaatBeeld
          breedteCm={breedteCm}
          hoogteCm={hoogteCm}
          ogen={ogen}
          aantalOgen={prijs?.aantalOgen ?? 0}
          voorbeeld={voorbeeld}
        />

        <div>
          <p className="label mb-3 text-inkt">Je ontwerp</p>
          <BestandUpload
            soort="banner"
            breedteCm={breedteCm}
            hoogteCm={hoogteCm}
            bestand={bestand}
            onKies={(b, url) => {
              zetBestand(b)
              zetVoorbeeld(url)
              zetToegevoegd(false)
            }}
          />
        </div>

        <div className="flex items-start gap-3 border border-rand bg-papier px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-inkt-zacht" strokeWidth={1.7} />
          <p className="text-sm text-inkt-zacht">
            Onze rol is {MAX_BREEDTE_CM} centimeter breed, dus één van beide
            maten moet daaronder blijven. Een banner van 300 bij 100 kan dus
            prima: die gaat dwars op de rol.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <Veld label="Veelgevraagd">
          <div className="grid grid-cols-2 gap-2">
            {VEELGEVRAAGD.map((v) => {
              const aan = v.breedte === breedteCm && v.hoogte === hoogteCm
              return (
                <button
                  key={v.naam}
                  onClick={() => {
                    zetBreedte(v.breedte)
                    zetHoogte(v.hoogte)
                  }}
                  className={`border px-3 py-2.5 text-left transition-colors ${
                    aan ? "border-inkt bg-papier-zacht" : "border-rand hover:border-inkt"
                  }`}
                >
                  <span className="block text-sm font-medium">{v.naam}</span>
                  <span className="cijfers block text-xs text-inkt-zacht">
                    {v.breedte} × {v.hoogte} cm
                  </span>
                </button>
              )
            })}
          </div>
        </Veld>

        <Veld label="Eigen maat">
          <div className="flex flex-wrap items-end gap-4">
            {[
              { kop: "Breedte", waarde: breedteCm, zet: zetBreedte },
              { kop: "Hoogte", waarde: hoogteCm, zet: zetHoogte },
            ].map((m) => (
              <label key={m.kop} className="flex-1">
                <span className="block text-sm text-inkt-zacht">{m.kop}</span>
                {/* De ring hoort om het hele veld, dus ook om de "cm". Op het
                    invoerveld alleen valt de eenheid erbuiten. */}
                <span className="mt-2 flex h-11 items-center border border-rand bg-papier focus-within:border-inkt has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-magenta">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={10}
                    max={1000}
                    value={m.waarde}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      if (Number.isFinite(n)) m.zet(Math.min(1000, Math.max(10, Math.round(n))))
                      zetToegevoegd(false)
                    }}
                    className="ring-om-het-kader cijfers h-full w-full bg-transparent px-3 outline-none"
                    aria-label={`${m.kop} in centimeter`}
                  />
                  <span className="pr-3 text-sm text-inkt-zacht">cm</span>
                </span>
              </label>
            ))}
          </div>
        </Veld>

        <Keuze
          label="Doek"
          waarde={materiaal}
          onWijzig={(m) => {
            zetMateriaal(m)
            zetToegevoegd(false)
          }}
          kolommen={1}
          opties={(Object.keys(BANNERMATERIAAL) as BannerMateriaal[]).map((k) => ({
            waarde: k,
            label: `${BANNERMATERIAAL[k].naam} · ${BANNERMATERIAAL[k].euroPerM2.toString().replace(".", ",")} euro per m²`,
            hulp: BANNERMATERIAAL[k].toelichting,
          }))}
        />

        <Veld label="Afwerking">
          <div className="space-y-2">
            {[
              {
                aan: ogen,
                zet: zetOgen,
                kop: "Ogen langs de rand",
                hulp: "Metalen ringen om de vijftig centimeter, om hem mee vast te binden.",
              },
              {
                aan: zoom,
                zet: zetZoom,
                kop: "Zoom rondom",
                hulp: "Omgezette rand, zodat de wind hem niet uitscheurt. Buiten een aanrader.",
              },
            ].map((o) => (
              <label
                key={o.kop}
                className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors ${
                  o.aan ? "border-inkt bg-papier-zacht" : "border-rand hover:border-inkt"
                }`}
              >
                <input
                  type="checkbox"
                  checked={o.aan}
                  onChange={(e) => {
                    o.zet(e.target.checked)
                    zetToegevoegd(false)
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-magenta"
                />
                <span>
                  <span className="block font-medium">{o.kop}</span>
                  <span className="block text-sm text-inkt-zacht">{o.hulp}</span>
                </span>
              </label>
            ))}
          </div>
        </Veld>

        <Veld label="Aantal">
          <Teller waarde={aantal} onWijzig={zetAantal} max={200} />
        </Veld>

        {fout || !prijs ? (
          <div className="border border-magenta/40 bg-magenta/5 px-4 py-4">
            <p className="text-sm leading-relaxed">{fout}</p>
          </div>
        ) : (
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
              Klaar in {LEVERTIJD.min} tot {LEVERTIJD.max} werkdagen. Bestanden
              boven de 40 MB mail je ons; voor de rest is dit genoeg.
            </p>
            <Knop
              soort="vonk"
              className="mt-6 w-full"
              disabled={teBreed}
              onClick={() => {
                voegToe({
                  soort: "banner",
                  naam: `Banner ${breedteCm} × ${hoogteCm} cm`,
                  omschrijving: [
                    BANNERMATERIAAL[materiaal].naam.toLowerCase(),
                    ogen ? `${prijs.aantalOgen} ogen` : "zonder ogen",
                    zoom ? "met zoom" : null,
                  ]
                    .filter(Boolean)
                    .join(", "),
                  aantal,
                  bedrag: prijs.totaal,
                  bestandsnaam: bestand?.naam,
                  keuzes: { breedteCm, hoogteCm, materiaal, ogen, zoom },
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
        )}
      </div>
    </div>
  )
}
