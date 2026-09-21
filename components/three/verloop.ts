import * as THREE from "three"
import { VONKVERLOOP } from "@/lib/merk"

/**
 * Het vonkverloop als textuur van één pixel hoog.
 *
 * Zo blijft het materiaal een gewoon belicht materiaal: het lint vangt licht
 * en werpt schaduw, en het verloop loopt over de lengte mee. Een platte kleur
 * in een shader zou goedkoper zijn maar ziet er ook zo uit.
 */
export function maakVerloopTextuur(
  stops: readonly string[] = VONKVERLOOP,
  breedte = 512
): THREE.Texture {
  const doek = document.createElement("canvas")
  doek.width = breedte
  doek.height = 1
  const ctx = doek.getContext("2d")!
  const verloop = ctx.createLinearGradient(0, 0, breedte, 0)
  stops.forEach((kleur, i) => verloop.addColorStop(i / (stops.length - 1), kleur))
  ctx.fillStyle = verloop
  ctx.fillRect(0, 0, breedte, 1)

  const tex = new THREE.CanvasTexture(doek)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}
