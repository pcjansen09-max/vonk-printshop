import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Product } from "@/lib/catalogus"
import { euro } from "@/lib/prijs/geld"

export function ProductKaart({ product }: { product: Product }) {
  return (
    <Link
      href={`/ontwerpen?product=${product.id}`}
      className="group flex flex-col border border-rand bg-papier p-6 transition-colors hover:border-inkt"
    >
      <p className="label text-inkt-zacht">{product.voorWie}</p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">{product.naam}</h3>
      <p className="mt-2.5 flex-1 leading-relaxed text-inkt-zacht">
        {product.omschrijving}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-rand pt-4">
        <span className="cijfers text-sm text-inkt-zacht">
          vanaf {euro(product.vanafPrijs)}
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-inkt-zacht transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-magenta"
          strokeWidth={1.8}
        />
      </div>
    </Link>
  )
}
