"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, ShoppingBag, X } from "lucide-react"
import { Vonkje } from "@/components/ui/Vonkje"
import { KnopLink } from "@/components/ui/Knop"
import { MERK } from "@/lib/merk"
import { useWagenKlaar, useWinkelwagen } from "@/lib/winkelwagen"

const MENU = [
  { href: "/3d-printen", label: "3D printen" },
  { href: "/ontwerpen", label: "Ontwerpen" },
  { href: "/drukwerk", label: "Posters" },
  { href: "/banners", label: "Banners" },
  { href: "/volgen", label: "Print volgen" },
  { href: "/over-ons", label: "Over ons" },
]

export function Kop() {
  const pad = usePathname()
  const [open, zetOpen] = useState(false)
  const klaar = useWagenKlaar()
  const aantalOpgeslagen = useWinkelwagen((s) => s.aantalStuks())
  const aantal = klaar ? aantalOpgeslagen : 0

  // Het menu gaat dicht bij het klikken zelf (zie de links hieronder), niet via
  // een effect op het pad. Een effect dat state zet laat React de boom nog een
  // keer doorlopen voordat er iets op het scherm staat.

  return (
    <header className="sticky top-0 z-40 border-b border-rand bg-papier/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Vonkje className="h-7 w-7" />
          <span className="label text-inkt">{MERK.school} Printshop</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {MENU.map((m) => {
            const hier = pad === m.href || pad.startsWith(m.href + "/")
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={hier ? "page" : undefined}
                className={`px-3 py-2 text-[0.9375rem] transition-colors ${
                  hier ? "text-inkt" : "text-inkt-zacht hover:text-inkt"
                }`}
              >
                {m.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            href="/winkelwagen"
            className="relative flex h-11 w-11 items-center justify-center text-inkt-zacht transition-colors hover:text-inkt"
            aria-label={
              aantal > 0 ? `Winkelwagen, ${aantal} stuks` : "Winkelwagen, leeg"
            }
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
            {aantal > 0 && (
              <span className="cijfers absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-magenta px-1 text-[0.625rem] font-semibold text-white">
                {aantal > 99 ? "99+" : aantal}
              </span>
            )}
          </Link>

          {/* Verbergen via een omhulsel en niet via een class op de knop zelf.
              De knop zet al inline-flex, en twee regels die allebei display
              zetten laten Tailwind beslissen wie wint. Dat ging mis: op een
              telefoon van 390 pixels stak de kop 76 pixels buiten beeld. */}
          <span className="hidden sm:contents">
            <KnopLink href="/3d-printen" soort="vol">
              Prijs berekenen
            </KnopLink>
          </span>

          <button
            onClick={() => zetOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center text-inkt lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Menu sluiten" : "Menu openen"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-rand bg-papier px-6 pb-4 pt-2 lg:hidden">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => zetOpen(false)}
              className="block border-b border-rand py-3.5 text-lg last:border-0"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
