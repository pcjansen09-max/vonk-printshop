import type { Metadata } from "next"
import { Bestelformulier } from "@/components/shop/Bestelformulier"
import { Label, Sectie } from "@/components/ui/Sectie"

export const metadata: Metadata = { title: "Bestellen" }

export default function Pagina() {
  return (
    <Sectie className="pt-16 sm:pt-20">
      <Label>Bestellen</Label>
      <h1 className="kop kop-l mt-4">Nog even je gegevens</h1>
      <div className="mt-12">
        <Bestelformulier />
      </div>
    </Sectie>
  )
}
