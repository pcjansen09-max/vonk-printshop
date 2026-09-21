import type { Metadata } from "next"
import { Suspense } from "react"
import { Ontwerper } from "@/components/shop/Ontwerper"
import { Label, Sectie } from "@/components/ui/Sectie"

export const metadata: Metadata = {
  title: "Zelf ontwerpen",
  description:
    "Kies een product, zet je eigen kleur en logo erop en zie meteen wat het kost. Menukaarthouders, tapknoppen, displays en meer.",
}

export default function Pagina() {
  return (
    <Sectie className="pt-16 sm:pt-20">
      <div className="max-w-2xl">
        <Label>Zelf ontwerpen</Label>
        <h1 className="kop kop-l mt-4">Jouw kleur, jouw logo</h1>
        <p className="mt-5 text-lg leading-relaxed text-inkt-zacht">
          Geen 3D-bestand nodig. Kies een product, zet er je huiskleur op en
          upload je logo. Je ziet het meteen draaien en je ziet meteen de prijs.
        </p>
      </div>

      <div className="mt-12">
        <Suspense fallback={<div className="h-96" />}>
          <Ontwerper />
        </Suspense>
      </div>
    </Sectie>
  )
}
