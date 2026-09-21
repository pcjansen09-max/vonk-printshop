import * as THREE from "three"

/**
 * Een streng filament langs een kromme.
 *
 * De vorige versie was een plat bandje van twee punten breed. Dat was het
 * probleem met de hero: een plat vlak heeft geen silhouet en geen rand die
 * licht vangt, dus hoe je hem ook belicht, hij blijft een geschilderde streep.
 *
 * Dit sleept een echte doorsnede langs de kromme: een afgeplatte ovaal, precies
 * zoals plastic dat uit een ronde mond op een vlak wordt gedrukt. Daarmee heeft
 * de streng dikte, een bovenkant die het licht anders vangt dan de zijkant, en
 * een rand die oplicht. Dat is waar "wel 3D" overgaat in "dit is een ding".
 *
 * De richting van de doorsnede komt uit computeFrenetFrames met gesloten=false:
 * die draagt de normaal mee langs de kromme in plaats van hem per punt opnieuw
 * te verzinnen, zodat de streng niet om zijn as klapt in een bocht.
 *
 * De u-coördinaat loopt van 0 aan het begin naar 1 aan het eind, zodat een
 * verlooptextuur over de lengte meeloopt: warm bij de spuitmond, koel aan het
 * eind.
 */

/** De doorsnede: een ovaal die platter is dan hij breed is. */
function doorsnede(zijden: number): { x: number; y: number; nx: number; ny: number }[] {
  const punten = []
  for (let i = 0; i < zijden; i++) {
    const hoek = (i / zijden) * Math.PI * 2
    const cx = Math.cos(hoek)
    const sy = Math.sin(hoek)
    // Breedte 1, hoogte 0,42: een neergedrukte worst, geen buis.
    const plat = 0.42
    punten.push({
      x: cx * 0.5,
      y: sy * 0.5 * plat,
      // De normaal van een ellips wijst niet dezelfde kant op als het punt:
      // hij moet omgekeerd geschaald worden, anders licht de platte bovenkant
      // verkeerd aan.
      nx: cx / 1,
      ny: sy / plat,
    })
  }
  return punten
}

export function maakStreng(
  kromme: THREE.Curve<THREE.Vector3>,
  stappen: number,
  breedte: number | ((t: number) => number),
  zijden = 10
): THREE.BufferGeometry {
  const punten = kromme.getSpacedPoints(stappen)
  const frames = kromme.computeFrenetFrames(stappen, false)
  const profiel = doorsnede(zijden)

  const aantal = (stappen + 1) * zijden
  const posities = new Float32Array(aantal * 3)
  const normalen = new Float32Array(aantal * 3)
  const uvs = new Float32Array(aantal * 2)
  const indices: number[] = []

  const p = new THREE.Vector3()
  const n = new THREE.Vector3()

  for (let i = 0; i <= stappen; i++) {
    const t = i / stappen
    const midden = punten[i]
    const normaal = frames.normals[Math.min(i, stappen - 1)]
    const binormaal = frames.binormals[Math.min(i, stappen - 1)]
    const maat = typeof breedte === "function" ? breedte(t) : breedte

    for (let k = 0; k < zijden; k++) {
      const q = profiel[k]
      const idx = i * zijden + k

      p.copy(midden)
        .addScaledVector(binormaal, q.x * maat)
        .addScaledVector(normaal, q.y * maat)
      posities[idx * 3] = p.x
      posities[idx * 3 + 1] = p.y
      posities[idx * 3 + 2] = p.z

      n.set(0, 0, 0)
        .addScaledVector(binormaal, q.nx)
        .addScaledVector(normaal, q.ny)
        .normalize()
      normalen[idx * 3] = n.x
      normalen[idx * 3 + 1] = n.y
      normalen[idx * 3 + 2] = n.z

      uvs[idx * 2] = t
      uvs[idx * 2 + 1] = k / zijden
    }

    // De driehoeken staan per stap bij elkaar, zodat setDrawRange de streng
    // laat groeien alsof hij uit de mond komt gerold.
    if (i < stappen) {
      for (let k = 0; k < zijden; k++) {
        const a = i * zijden + k
        const b = i * zijden + ((k + 1) % zijden)
        const c = a + zijden
        const d = b + zijden
        indices.push(a, c, b, b, c, d)
      }
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(posities, 3))
  geo.setAttribute("normal", new THREE.BufferAttribute(normalen, 3))
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeBoundingSphere()
  return geo
}
