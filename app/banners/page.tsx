import type { Metadata } from "next"
import { BannerRekenaar } from "@/components/shop/BannerRekenaar"
import { Label, Sectie } from "@/components/ui/Sectie"
import { MAX_BREEDTE_CM } from "@/lib/prijs/banner"

export const metadata: Metadata = {
  title: "Banners op maat",
  description:
    "Spandoeken op pvc, mesh of textiel, tot 150 centimeter rolbreedte en elke lengte. Ogen en zoom erbij, prijs direct zichtbaar.",
}

export default function Pagina() {
  return (
    <Sectie className="pt-16 sm:pt-20">
      <div className="max-w-2xl">
        <Label>Banners op maat</Label>
        <h1 className="kop kop-l mt-4">Zo groot als je hek is</h1>
        <p className="mt-5 text-lg leading-relaxed text-inkt-zacht">
          Een spandoek boven de kraam, langs het hek van het sportveld of achter
          de bar. Je geeft de maat, wij printen op de rol van {MAX_BREEDTE_CM}{" "}
          centimeter breed en zetten er ogen en een zoom aan. Upload je ontwerp
          en we zeggen meteen of het scherp genoeg is.
        </p>
      </div>

      <div className="mt-12">
        <BannerRekenaar />
      </div>
    </Sectie>
  )
}
