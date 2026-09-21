"use client"

import type { ReactNode } from "react"

/** Een schuif met het getal ernaast, zodat je ziet wat je instelt. */
export function Schuif({
  label,
  waarde,
  eenheid,
  min,
  max,
  stap,
  onWijzig,
  hulp,
}: {
  label: string
  waarde: number
  eenheid: string
  min: number
  max: number
  stap: number
  onWijzig: (w: number) => void
  hulp?: string
}) {
  const id = `schuif-${label.replace(/\s+/g, "-").toLowerCase()}`
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="label text-inkt">
          {label}
        </label>
        <span className="cijfers text-sm font-medium">
          {waarde}
          {eenheid}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={stap}
        value={waarde}
        onChange={(e) => onWijzig(parseFloat(e.target.value))}
        className="mt-3 h-1 w-full cursor-pointer appearance-none bg-rand accent-magenta"
      />
      {hulp && <p className="mt-2 text-sm text-inkt-zacht">{hulp}</p>}
    </div>
  )
}

/** Een rij keuzeknoppen. Duidelijker dan een uitklaplijst op een telefoon. */
export function Keuze<T extends string>({
  label,
  waarde,
  opties,
  onWijzig,
  kolommen = 2,
}: {
  label: string
  waarde: T
  opties: { waarde: T; label: string; hulp?: string; kleur?: string }[]
  onWijzig: (w: T) => void
  kolommen?: number
}) {
  return (
    <fieldset>
      <legend className="label text-inkt">{label}</legend>
      <div
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${kolommen}, minmax(0, 1fr))` }}
      >
        {opties.map((o) => {
          const aan = o.waarde === waarde
          return (
            <button
              key={o.waarde}
              type="button"
              onClick={() => onWijzig(o.waarde)}
              aria-pressed={aan}
              className={`flex items-center gap-2.5 border px-3 py-2.5 text-left text-sm transition-colors ${
                aan
                  ? "border-inkt bg-inkt text-white"
                  : "border-rand bg-papier hover:border-inkt"
              }`}
            >
              {o.kleur && (
                <span
                  className="h-4 w-4 shrink-0 border border-black/15"
                  style={{ background: o.kleur }}
                  aria-hidden
                />
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium">{o.label}</span>
                {o.hulp && (
                  <span
                    className={`block truncate text-xs ${
                      aan ? "text-white/70" : "text-inkt-zacht"
                    }`}
                  >
                    {o.hulp}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function Veld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="label text-inkt">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function Teller({
  waarde,
  onWijzig,
  min = 1,
  max = 9999,
}: {
  waarde: number
  onWijzig: (w: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="inline-flex border border-rand">
      <button
        type="button"
        onClick={() => onWijzig(Math.max(min, waarde - 1))}
        className="h-11 w-11 text-lg transition-colors hover:bg-papier-zacht disabled:opacity-30"
        disabled={waarde <= min}
        aria-label="Eén minder"
      >
        −
      </button>
      <input
        type="number"
        value={waarde}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          onWijzig(Number.isNaN(n) ? min : Math.min(max, Math.max(min, n)))
        }}
        className="cijfers h-11 w-16 border-x border-rand text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Aantal"
      />
      <button
        type="button"
        onClick={() => onWijzig(Math.min(max, waarde + 1))}
        className="h-11 w-11 text-lg transition-colors hover:bg-papier-zacht disabled:opacity-30"
        disabled={waarde >= max}
        aria-label="Eén meer"
      >
        +
      </button>
    </div>
  )
}
