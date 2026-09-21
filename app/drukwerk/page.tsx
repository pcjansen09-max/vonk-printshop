import type { Metadata } from "next"
import { DrukwerkRekenaar } from "@/components/shop/DrukwerkRekenaar"
import { Label, Sectie } from "@/components/ui/Sectie"

export const metadata: Metadata = {
  title: "Posters en drukwerk",
  description:
    "Posters, flyers en programmakaarten van A4 tot A1, op normaal papier, dik karton of fotopapier. Prijs direct zichtbaar.",
}

export default function Pagina() {
  return (
    <Sectie className="pt-16 sm:pt-20">
      <div className="max-w-2xl">
        <Label>Posters en drukwerk</Label>
        <h1 className="kop kop-l mt-4">Op papier, ook meteen met een prijs</h1>
        <p className="mt-5 text-lg leading-relaxed text-inkt-zacht">
          Posters voor je evenement, flyers voor de bar, programmakaarten voor
          een proeverij. Kies je formaat en papier en je ziet direct wat het
          kost. Snijden zit erbij.
        </p>
      </div>

      <div className="mt-12">
        <DrukwerkRekenaar />
      </div>
    </Sectie>
  )
}
