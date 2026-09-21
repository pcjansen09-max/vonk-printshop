import type { Metadata } from "next"
import { WinkelwagenLijst } from "@/components/shop/WinkelwagenLijst"
import { Label, Sectie } from "@/components/ui/Sectie"

export const metadata: Metadata = { title: "Winkelwagen" }

export default function Pagina() {
  return (
    <Sectie className="pt-16 sm:pt-20">
      <Label>Winkelwagen</Label>
      <h1 className="kop kop-l mt-4">Wat je hebt uitgekozen</h1>
      <div className="mt-12">
        <WinkelwagenLijst />
      </div>
    </Sectie>
  )
}
