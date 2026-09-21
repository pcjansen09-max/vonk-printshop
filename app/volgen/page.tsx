import type { Metadata } from "next"
import { Suspense } from "react"
import { Volger } from "@/components/shop/Volger"
import { Label, Sectie } from "@/components/ui/Sectie"

export const metadata: Metadata = {
  title: "Print volgen",
  description:
    "Volg je bestelling live: hoeveel lagen er al liggen, hoe warm de printer is en hoe lang het nog duurt.",
}

export default function Pagina() {
  return (
    <Sectie className="pt-16 sm:pt-20">
      <div className="max-w-2xl">
        <Label>Print volgen</Label>
        <h1 className="kop kop-l mt-4">Kijk mee met de printer</h1>
        <p className="mt-5 text-lg leading-relaxed text-inkt-zacht">
          Je hoeft niet te bellen om te vragen of het al klaar is. Vul je
          bestelnummer in en je ziet op welke laag de printer zit en hoe lang
          het nog duurt.
        </p>
      </div>

      <div className="mt-12">
        <Suspense fallback={<div className="h-96" />}>
          <Volger />
        </Suspense>
      </div>
    </Sectie>
  )
}
