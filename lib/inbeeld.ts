"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Staat dit stuk pagina in beeld?
 *
 * Waarvoor: een WebGL-doek tekent zichzelf zestig keer per seconde, ook als het
 * al lang naar boven weggescrold is. Op de startpagina staan er twee, en die
 * vochten om dezelfde grafische kaart terwijl je er maar één kon zien. Gemeten
 * op een breed scherm: zeven beelden per seconde met allebei aan.
 *
 * De marge zorgt dat een doek al draait vlak voordat je het ziet, zodat je nooit
 * op een stilstaand beeld aankomt.
 */
export function useInBeeld<T extends HTMLElement>(marge = "300px") {
  const ref = useRef<T>(null)
  const [inBeeld, zet] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const kijker = new IntersectionObserver(
      ([stuk]) => zet(stuk.isIntersecting),
      { rootMargin: marge }
    )
    kijker.observe(el)
    return () => kijker.disconnect()
  }, [marge])

  return { ref, inBeeld }
}
