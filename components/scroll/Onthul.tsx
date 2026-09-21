"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useRustig } from "@/lib/scrollen"

/**
 * Laat iets binnenkomen zodra het in beeld komt, één keer.
 *
 * Bewust niet op scrollpositie maar op een waarnemer: een blok dat meebeweegt
 * met het wiel leest als versiering, een blok dat één keer aankomt en blijft
 * staan leest als opbouw. Bij "minder beweging" staat alles er meteen.
 */
export function Onthul({
  children,
  vertraging = 0,
  vanaf = "onder",
  className = "",
}: {
  children: ReactNode
  /** In milliseconden; gebruik dit om een rij na elkaar te laten aankomen. */
  vertraging?: number
  vanaf?: "onder" | "links" | "rechts" | "stil"
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [binnen, zetBinnen] = useState(false)
  const rustig = useRustig()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (rustig) {
      const id = requestAnimationFrame(() => zetBinnen(true))
      return () => cancelAnimationFrame(id)
    }
    const kijker = new IntersectionObserver(
      ([item]) => {
        if (item.isIntersecting) {
          zetBinnen(true)
          kijker.disconnect()
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    )
    kijker.observe(el)
    return () => kijker.disconnect()
  }, [rustig])

  const start =
    vanaf === "links"
      ? "translate3d(-1.75rem,0,0)"
      : vanaf === "rechts"
        ? "translate3d(1.75rem,0,0)"
        : vanaf === "stil"
          ? "none"
          : "translate3d(0,1.75rem,0)"

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: binnen ? 1 : 0,
        transform: binnen ? "none" : start,
        transition: rustig
          ? "none"
          : `opacity 700ms cubic-bezier(.2,.7,.3,1) ${vertraging}ms, transform 700ms cubic-bezier(.2,.7,.3,1) ${vertraging}ms`,
        willChange: binnen ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
