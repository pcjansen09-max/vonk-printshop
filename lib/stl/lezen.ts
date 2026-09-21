/**
 * Een STL-bestand lezen en er het volume en de buitenmaten uit halen.
 *
 * Dit is de som waar de hele belofte op rust: "upload je model en zie meteen
 * wat het kost". Gaat dit mis, dan klopt elke prijs op de site niet. Daarom
 * rekent hij het volume uit de punten zelf en niet uit het normaalveld dat in
 * het bestand staat: veel exporteurs schrijven daar nullen of onzin in.
 *
 * Alles in het bestand staat in millimeters. Naar buiten toe geven we kubieke
 * centimeters, want daar rekent filament in.
 */

export type Maat = { x: number; y: number; z: number }

export type Model = {
  /** Aantal driehoeken; zegt iets over hoe fijn het model is. */
  driehoeken: number
  volumeCm3: number
  /** Buitenmaten in millimeters. */
  maat: Maat
  /** De punten, plat achter elkaar, voor de weergave op het scherm. */
  punten: Float32Array
}

/**
 * Het volume van een gesloten omhulsel.
 *
 * Elke driehoek vormt met de oorsprong een viervlak; de tekenvolumes daarvan
 * heffen elkaar buiten het model op. Wijzen de normalen naar binnen, dan komt
 * er een negatief getal uit. Dat is geen fout in het model maar een omgekeerde
 * kijkrichting, dus nemen we de absolute waarde. Een negatieve prijs bestaat
 * niet.
 */
export function volumeVanDriehoeken(driehoeken: ArrayLike<number>[]): number {
  let zesVoud = 0
  for (const t of driehoeken) {
    zesVoud +=
      t[0] * (t[4] * t[8] - t[5] * t[7]) -
      t[1] * (t[3] * t[8] - t[5] * t[6]) +
      t[2] * (t[3] * t[7] - t[4] * t[6])
  }
  return Math.abs(zesVoud) / 6
}

export function afmetingen(punten: Float32Array): Maat {
  if (punten.length === 0) return { x: 0, y: 0, z: 0 }
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < punten.length; i += 3) {
    for (let as = 0; as < 3; as++) {
      const w = punten[i + as]
      if (w < min[as]) min[as] = w
      if (w > max[as]) max[as] = w
    }
  }
  return {
    x: max[0] - min[0],
    y: max[1] - min[1],
    z: max[2] - min[2],
  }
}

const KOP = 84
const PER_DRIEHOEK = 50

function lijktOpAscii(buffer: ArrayBuffer): boolean {
  // Alleen de eerste bytes bekijken: een binaire STL mag toevallig ook met
  // "solid" beginnen, dus dat woord alleen is geen bewijs. De lengte beslist.
  const kop = new TextDecoder().decode(new Uint8Array(buffer, 0, Math.min(80, buffer.byteLength)))
  if (!kop.trimStart().toLowerCase().startsWith("solid")) return false
  if (buffer.byteLength < KOP) return true
  const aantal = new DataView(buffer).getUint32(80, true)
  return KOP + aantal * PER_DRIEHOEK !== buffer.byteLength
}

function leesBinair(buffer: ArrayBuffer): Float32Array {
  const dv = new DataView(buffer)
  const aantal = dv.getUint32(80, true)
  const verwacht = KOP + aantal * PER_DRIEHOEK
  if (verwacht !== buffer.byteLength) {
    throw new FoutInBestand(
      "Dit STL-bestand is niet compleet. Sla het opnieuw op en probeer het nog een keer."
    )
  }
  const punten = new Float32Array(aantal * 9)
  let o = KOP
  for (let d = 0; d < aantal; d++) {
    o += 12 // de opgegeven normaal slaan we bewust over
    for (let p = 0; p < 9; p++) {
      punten[d * 9 + p] = dv.getFloat32(o, true)
      o += 4
    }
    o += 2 // attribuutteller
  }
  return punten
}

function leesAscii(buffer: ArrayBuffer): Float32Array {
  const tekst = new TextDecoder().decode(buffer)
  const uit: number[] = []
  const regel = /vertex\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)/g
  let m: RegExpExecArray | null
  while ((m = regel.exec(tekst)) !== null) {
    uit.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]))
  }
  if (uit.length === 0 || uit.length % 9 !== 0) {
    throw new FoutInBestand("Dit lijkt geen geldig STL-bestand te zijn.")
  }
  return new Float32Array(uit)
}

export class FoutInBestand extends Error {}

export function leesSTL(buffer: ArrayBuffer): Model {
  if (buffer.byteLength < 15) {
    throw new FoutInBestand("Dit bestand is leeg of veel te klein voor een 3D-model.")
  }
  const punten = lijktOpAscii(buffer) ? leesAscii(buffer) : leesBinair(buffer)
  const driehoeken = punten.length / 9

  const lijst: Float32Array[] = []
  for (let d = 0; d < driehoeken; d++) lijst.push(punten.subarray(d * 9, d * 9 + 9))

  return {
    driehoeken,
    volumeCm3: volumeVanDriehoeken(lijst) / 1000,
    maat: afmetingen(punten),
    punten,
  }
}
