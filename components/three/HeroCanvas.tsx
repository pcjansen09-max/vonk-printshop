"use client"

import dynamic from "next/dynamic"
import { useInBeeld } from "@/lib/inbeeld"

/**
 * Het 3D-tafereel komt pas in de browser binnen.
 *
 * Three.js weegt een paar honderd kilobyte en op de server valt er niets te
 * tekenen. Zo blijft de eerste tekst meteen zichtbaar en laadt het beeld erna,
 * in plaats van dat de hele pagina op de 3D wacht.
 */
const Tafereel = dynamic(() => import("./HeroTafereel"), {
  ssr: false,
  loading: () => null,
})

export function HeroCanvas() {
  // Zodra de hero weggescrold is hoeft hij niet meer te tekenen. Anders vecht
  // hij de hele pagina lang met het doek van de printsectie om dezelfde kaart.
  const { ref, inBeeld } = useInBeeld<HTMLDivElement>()
  return (
    <div ref={ref} className="h-full w-full">
      {inBeeld && <Tafereel />}
    </div>
  )
}
