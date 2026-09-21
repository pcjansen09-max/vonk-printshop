import type { ReactNode } from "react"

/** Het mono-label boven een blok. Zegt in één woord waar je bent. */
export function Label({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={`label text-inkt-zacht ${className}`}>{children}</p>
}

export function Scheiding() {
  return <div className="scheiding" aria-hidden />
}

export function Sectie({
  children,
  className = "",
  breed = false,
  id,
}: {
  children: ReactNode
  className?: string
  breed?: boolean
  id?: string
}) {
  return (
    <section id={id} className={`px-6 sm:px-8 ${className}`}>
      <div className={`mx-auto ${breed ? "max-w-[100rem]" : "max-w-6xl"}`}>
        {children}
      </div>
    </section>
  )
}

/** Kop van een sectie: klein label, grote kop, korte uitleg. Steeds dezelfde
 *  opbouw, zodat de pagina een ritme heeft. */
export function SectieKop({
  label,
  kop,
  uitleg,
  midden = false,
}: {
  label: string
  kop: ReactNode
  uitleg?: ReactNode
  midden?: boolean
}) {
  return (
    <div className={midden ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Label>{label}</Label>
      <h2 className="kop kop-l mt-4">{kop}</h2>
      {uitleg && (
        <p className="mt-5 text-lg leading-relaxed text-inkt-zacht">{uitleg}</p>
      )}
    </div>
  )
}
