import { euro, type Regel } from "@/lib/prijs/geld"

/**
 * De prijs uit elkaar getrokken.
 *
 * Dit is het verschil met een drukkerij die per mail een bedrag noemt: je ziet
 * waar het geld heen gaat. Wie de regels optelt komt op het totaal uit, ook de
 * kortingsregel telt gewoon mee.
 */
export function PrijsOpbouw({
  regels,
  totaal,
  btw,
  totaalInclusief,
  perStuk,
  aantal,
}: {
  regels: Regel[]
  totaal: number
  btw: number
  totaalInclusief: number
  perStuk?: number
  aantal?: number
}) {
  return (
    <div className="border border-rand bg-papier">
      <table className="w-full">
        <caption className="enkel-voorlezen">Opbouw van de prijs</caption>
        <tbody>
          {regels.map((r) => (
            <tr key={r.wat} className="border-b border-rand">
              <td className="px-5 py-3.5">
                <p className="font-medium">{r.wat}</p>
                <p className="text-sm text-inkt-zacht">{r.toelichting}</p>
              </td>
              <td className="cijfers whitespace-nowrap px-5 py-3.5 text-right align-top font-medium">
                {r.bedrag < 0 ? "− " : ""}
                {euro(Math.abs(r.bedrag))}
              </td>
            </tr>
          ))}
          <tr className="border-b border-rand">
            <td className="px-5 py-3 text-inkt-zacht">Btw 21 procent</td>
            <td className="cijfers px-5 py-3 text-right text-inkt-zacht">
              {euro(btw)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="px-5 py-4">
              <p className="label">Totaal inclusief btw</p>
              {perStuk !== undefined && aantal !== undefined && aantal > 1 && (
                <p className="cijfers mt-1 text-sm text-inkt-zacht">
                  {euro(perStuk)} per stuk, exclusief btw
                </p>
              )}
            </td>
            <td className="cijfers px-5 py-4 text-right text-2xl font-semibold tracking-tight">
              {euro(totaalInclusief)}
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="enkel-voorlezen">
        Exclusief btw {euro(totaal)}, btw {euro(btw)}.
      </p>
    </div>
  )
}
