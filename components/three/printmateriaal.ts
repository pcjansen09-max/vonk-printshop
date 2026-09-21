import * as THREE from "three"

/**
 * Plastic dat eruitziet alsof het geprint is.
 *
 * Het verschil tussen "wel 3D" en "een echte print" zit in drie dingen, en
 * geen daarvan is de vorm:
 *
 * 1. Laaglijnen. Een FDM-printer legt het voorwerp op in laagjes. Op elke
 *    staande wand zie je die ribbeltjes licht vangen. Zonder die lijnen is het
 *    een gladde CG-vorm, met die lijnen is het onmiskenbaar geprint.
 * 2. De glans smeert uit LANGS de laag, niet er dwars op. Ook als de ribbels te
 *    klein zijn om te zien, blijft dat zichtbaar: dat is anisotropie, en het is
 *    de reden dat een geprint vlak er anders uitziet dan een gespoten vlak.
 * 3. Een heldere laag bovenop het pigment, waarin de omgeving vaag te zien is.
 *    Zonder omgevingskaart valt alles hierboven in duigen: zie Studio.tsx.
 *
 * Twee dingen die ik eerst fout had en die met de shader in de hand zijn
 * rechtgezet:
 *
 * - De hoogte werd in WERELDruimte gemeten en de richting werd vergeleken met
 *   een wereld-as, terwijl `normal` in de fragmentshader in VIEWruimte staat.
 *   Twee ruimtes door elkaar: de lijnen liepen dus niet met de vorm mee en
 *   verschenen ook op vlakke bovenkanten. De hoogte hoort bovendien in
 *   OBJECTruimte: een printer legt lagen ten opzichte van het voorwerp, dus ze
 *   horen mee te draaien als het voorwerp draait.
 * - De fragmentshader van three kent geen modelMatrix of modelViewMatrix. De
 *   print-as moet dus als varying uit de vertexshader komen.
 */

export type Plastic = "PLA" | "PETG"

/** Wat de printer werkelijk doet, in millimeter. */
export const LAAGHOOGTE_MM = 0.35

export type PrintMateriaal = THREE.MeshPhysicalMaterial & {
  /** Aan te passen per frame, zodat de lijnen leesbaar blijven bij uitzoomen. */
  printUniforms: {
    uLaagHoogte: { value: number }
    uLaagSterkte: { value: number }
  }
}

type Opties = {
  kleur: string
  soort?: Plastic
  doorschijnend?: boolean
  /** Hoeveel de laaglijnen opvallen. 0 zet ze uit. */
  lijnen?: number
}

function legLaaglijnen(materiaal: PrintMateriaal, sterkte: number) {
  const uniforms = {
    uLaagHoogte: { value: LAAGHOOGTE_MM },
    uLaagSterkte: { value: sterkte },
  }
  materiaal.printUniforms = uniforms

  materiaal.onBeforeCompile = (shader) => {
    shader.uniforms.uLaagHoogte = uniforms.uLaagHoogte
    shader.uniforms.uLaagSterkte = uniforms.uLaagSterkte

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vPrintPos;
varying vec3 vPrintOp;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
// De lagen horen bij het voorwerp, niet bij de wereld: in objectruimte dus.
vPrintPos = transformed;
// De print-as in DEZELFDE ruimte als 'normal' straks staat, namelijk view.
vPrintOp = normalize(mat3(modelViewMatrix) * vec3(0.0, 1.0, 0.0));`
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vPrintPos;
varying vec3 vPrintOp;
uniform float uLaagHoogte;
uniform float uLaagSterkte;

// De ribbel van één laag: bol aan de onderkant, scherper waar de volgende laag
// erop drukt. Daarom een scheve zaagtand en geen sinus.
float laagHelling(float hoogte, float h) {
  float fase = fract(hoogte / max(h, 1e-5));
  float x = (fase - 0.5) * 2.0;
  return sign(x) * pow(abs(x), 0.7);
}`
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
{
  vec3 printOp = normalize(vPrintOp);
  // Het stuk van de print-as dat IN het oppervlak ligt. Op een vlakke
  // bovenkant is dat niets, op een staande wand is dat de volle richting:
  // precies waar de printer wel en geen ribbels achterlaat.
  vec3 langsWand = printOp - normal * dot(normal, printOp);
  float steil = length(langsWand);

  // Hoe breed is één laag op dit moment in beeldpunten? Wordt dat te weinig,
  // dan doven de lijnen uit in plaats van te gaan ruisen.
  float perBeeldpunt = fwidth(vPrintPos.y) / max(uLaagHoogte, 1e-5);
  float leesbaar = 1.0 - smoothstep(0.35, 1.2, perBeeldpunt);

  if (steil > 1e-4 && leesbaar > 0.0) {
    normal = normalize(
      normal
        + (langsWand / steil) * laagHelling(vPrintPos.y, uLaagHoogte)
          * uLaagSterkte * steil * leesbaar
    );
  }
}`
      )
      .replace(
        "#include <clearcoat_normal_fragment_maps>",
        `#include <clearcoat_normal_fragment_maps>
#ifdef USE_CLEARCOAT
  // De glanslaag ligt OVER de ribbels heen, dus hij volgt ze, maar afgevlakt.
  // Laat je hem vlak, dan drijft de glans los van de vorm en valt het op.
  clearcoatNormal = normalize(mix(clearcoatNormal, normal, 0.85));
#endif`
      )
      .replace(
        "#include <lights_physical_fragment>",
        `#include <lights_physical_fragment>
#ifdef USE_ANISOTROPY
{
  // De glans hoort LANGS de laag uit te smeren, dus loodrecht op de print-as.
  // Dit is wat je op een geprint vlak ziet ook als de ribbels zelf te klein
  // zijn: een streep die met de baan meeloopt in plaats van een ronde vlek.
  vec3 langs = cross(normal, normalize(vPrintOp));
  if (length(langs) > 1e-3) {
    material.anisotropyT = normalize(langs);
    material.anisotropyB = cross(normal, material.anisotropyT);
  }
}
#endif`
      )
  }

  // Eigen sleutel, zodat three de gepatchte variant niet verwart met een
  // gewoon physical-materiaal. Three plakt deze achter de normale sleutel, dus
  // alle gewone vlaggen (omgevingskaart, clearcoat) blijven gewoon meetellen.
  materiaal.customProgramCacheKey = () => `printlijnen-${sterkte.toFixed(2)}`
}

/**
 * Eén materiaal. Roep dit in een useMemo aan en ruim het op met dispose().
 *
 * De waarden komen uit vergelijken, niet uit een tabel: mat PLA is zijdemat met
 * een poederig randje, PETG heeft een dikke natte coating over een mattere kern.
 */
export function maakPrintMateriaal({
  kleur,
  soort = "PLA",
  doorschijnend = false,
  lijnen = 1,
}: Opties): PrintMateriaal {
  const petg = soort === "PETG"

  const materiaal = new THREE.MeshPhysicalMaterial(
    petg
      ? {
          color: new THREE.Color(kleur),
          roughness: 0.3,
          metalness: 0,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1,
          specularIntensity: 1,
          ior: 1.57,
          iridescence: 0.12,
          iridescenceIOR: 1.35,
          envMapIntensity: 1.15,
        }
      : {
          color: new THREE.Color(kleur),
          roughness: 0.52,
          metalness: 0,
          clearcoat: 0.22,
          clearcoatRoughness: 0.42,
          sheen: 0.3,
          sheenColor: new THREE.Color("#fff3f7"),
          sheenRoughness: 0.85,
          specularIntensity: 0.6,
          ior: 1.46,
          envMapIntensity: 1.05,
        }
  ) as PrintMateriaal

  if (petg) materiaal.iridescenceThicknessRange = [120, 420]

  // Zet USE_ANISOTROPY aan. Zonder deze regel bestaat material.anisotropyT niet
  // en doet de shaderpatch hierboven niets.
  materiaal.anisotropy = 0.6
  materiaal.anisotropyRotation = 0

  if (doorschijnend) {
    materiaal.transmission = 0.82
    materiaal.thickness = 7
    materiaal.attenuationDistance = 34
    materiaal.attenuationColor = new THREE.Color(kleur)
    materiaal.roughness = 0.22
    materiaal.clearcoat = 0.9
  }

  if (lijnen > 0) legLaaglijnen(materiaal, 0.34 * lijnen)

  return materiaal
}

/**
 * De laaghoogte die je op dit moment op het scherm ziet.
 *
 * Een echte laag van 0,35 mm is op een uitgezoomd scherm smaller dan een
 * beeldpunt. Dan zie je niets, of erger: ruis. Daarom rekenen we uit hoeveel
 * millimeter één beeldpunt beslaat en mikken we op ongeveer drie beeldpunten
 * per laag, met de echte hoogte als ondergrens en vier keer de echte hoogte als
 * bovengrens. Zo is het van dichtbij precies wat de printer doet en van veraf
 * een grovere maar zichtbare versie van hetzelfde.
 */
export function leesbareLaaghoogte(
  afstand: number,
  fovGraden: number,
  hoogteInBeeldpunten: number
): number {
  const fov = (fovGraden * Math.PI) / 180
  const mmPerBeeldpunt = (2 * Math.tan(fov / 2) * afstand) / hoogteInBeeldpunten
  return Math.min(Math.max(mmPerBeeldpunt * 2.4, LAAGHOOGTE_MM), LAAGHOOGTE_MM * 2.5)
}
