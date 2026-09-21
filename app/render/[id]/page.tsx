import { notFound } from "next/navigation"
import { ProductShot } from "@/components/three/ProductShot"
import { PRODUCTEN } from "@/lib/catalogus"

/**
 * De opnamestudio voor de productplaatjes.
 *
 * Staat niet in de navigatie en wordt nergens gelinkt; hij bestaat zodat
 * scripts/schiet-producten.mjs de plaatjes in public/producten opnieuw kan
 * maken als een vorm verandert. Een gereedschap dat je weggooit rot; deze
 * pagina kost een bezoeker niets, want hij wordt alleen opgehaald als je hem
 * opvraagt.
 */
export const dynamic = "force-static"

export function generateStaticParams() {
  return PRODUCTEN.flatMap((p) => [{ id: p.id }, { id: `${p.id}-amber` }])
}

export default async function Pagina({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const amber = id.endsWith("-amber")
  const product = PRODUCTEN.find((p) => p.id === id.replace(/-amber$/, ""))
  if (!product) notFound()

  return (
    <>
      {/* De kop en de voet horen niet op een productplaatje. Ze liggen over het
          doek heen, dus een opname van alleen het doek pakt ze toch mee. */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            "header,footer,nextjs-portal{display:none!important}" +
            "body{background:transparent!important}",
        }}
      />
      <div style={{ width: "100vw", height: "100vh", background: "transparent" }}>
        <ProductShot
          id={product.id}
          maat={product.maat}
          kleur={amber ? "#f8ab21" : "#e50075"}
        />
      </div>
    </>
  )
}
