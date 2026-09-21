import Link from "next/link"
import { Vonkje } from "@/components/ui/Vonkje"
import { LEVERTIJD, MERK } from "@/lib/merk"

const KOLOMMEN = [
  {
    kop: "Bestellen",
    links: [
      { href: "/3d-printen", label: "3D-model uploaden" },
      { href: "/ontwerpen", label: "Zelf ontwerpen" },
      { href: "/drukwerk", label: "Posters en drukwerk" },
      { href: "/banners", label: "Banners op maat" },
      { href: "/volgen", label: "Print volgen" },
    ],
  },
  {
    kop: "Voor wie",
    links: [
      { href: "/over-ons#horeca", label: "Horeca" },
      { href: "/over-ons#retail", label: "Kapsalons en retail" },
      { href: "/over-ons#verenigingen", label: "Verenigingen" },
      { href: "/over-ons#bouw", label: "Bouw en installatie" },
    ],
  },
  {
    kop: "Printshop",
    links: [
      { href: "/over-ons", label: "Over ons" },
      { href: "/over-ons#werkwijze", label: "Hoe het werkt" },
      { href: "/over-ons#contact", label: "Contact" },
    ],
  },
]

export function Voet() {
  return (
    <footer className="mt-32 border-t border-rand bg-papier-zacht">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <Vonkje className="h-7 w-7" />
              <span className="label text-inkt">{MERK.school} Printshop</span>
            </div>
            <p className="mt-5 max-w-xs leading-relaxed text-inkt-zacht">
              3D printen en drukwerk uit {MERK.plaats}. Je ziet meteen wat het
              kost en je volgt je print live mee.
            </p>
            <p className="label mt-6 text-inkt-zacht">
              Levertijd {LEVERTIJD.min} tot {LEVERTIJD.max} werkdagen
            </p>
          </div>

          {KOLOMMEN.map((k) => (
            <div key={k.kop}>
              <p className="label text-inkt">{k.kop}</p>
              <ul className="mt-5 space-y-3">
                {k.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-inkt-zacht transition-colors hover:text-inkt"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-rand pt-8 text-sm text-inkt-zacht sm:flex-row sm:items-center sm:justify-between">
          <p>
            {MERK.adres} · {MERK.telefoon} ·{" "}
            <a href={`mailto:${MERK.email}`} className="hover:text-inkt">
              {MERK.email}
            </a>
          </p>
          <p>
            Een leerbedrijf van {MERK.school} {MERK.plaats}
          </p>
        </div>
      </div>
    </footer>
  )
}
