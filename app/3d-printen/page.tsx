import type { Metadata } from "next"
import { Uploader } from "@/components/shop/Uploader"
import { Label, Sectie } from "@/components/ui/Sectie"
import { BOUWVOLUME } from "@/lib/prijs/print3d"

export const metadata: Metadata = {
  title: "3D printen",
  description:
    "Upload je STL-bestand en zie meteen wat het kost. Materiaal, printtijd en levertijd, zonder te wachten op een offerte.",
}

export default function Pagina() {
  return (
    <Sectie className="pt-16 sm:pt-20">
      <div className="max-w-2xl">
        <Label>3D printen</Label>
        <h1 className="kop kop-l mt-4">Upload je model, zie je prijs</h1>
        <p className="mt-5 text-lg leading-relaxed text-inkt-zacht">
          Sleep je STL-bestand hierin. Wij lezen het meteen uit, laten zien hoe
          het op de plaat staat en rekenen voor je uit wat het kost. Je bestand
          blijft in je eigen browser tot je bestelt.
        </p>
        <p className="mt-3 text-sm text-inkt-zacht">
          Onze plaat is {BOUWVOLUME.x} bij {BOUWVOLUME.y} bij {BOUWVOLUME.z}{" "}
          millimeter. Past je model daar niet op, dan zeggen we dat meteen.
        </p>
      </div>

      <div className="mt-12">
        <Uploader />
      </div>
    </Sectie>
  )
}
