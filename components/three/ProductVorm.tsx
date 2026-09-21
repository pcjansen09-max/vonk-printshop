"use client"

import * as THREE from "three"
import { createContext, useContext, useEffect, useMemo } from "react"
import { RoundedBoxGeometry } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { leesbareLaaghoogte, maakPrintMateriaal } from "./printmateriaal"

/**
 * De producten als echte 3D-vorm, opgebouwd uit basisvormen.
 *
 * Waarom geen ingeladen modellen: acht bestanden van elk een paar honderd
 * kilobyte maken de pagina traag, terwijl deze vormen simpel genoeg zijn om uit
 * te rekenen. Belangrijker: zo verandert de kleur echt mee met je keuze, want
 * het is één materiaal dat we doorgeven.
 *
 * De maten komen uit de catalogus en staan in millimeters, zodat het model in
 * de kijker dezelfde schaal heeft als de prijsberekening.
 *
 * Elk blok is afgerond. Dat is geen opsmuk: een scherpe hoek van precies
 * negentig graden bestaat niet in een geprint voorwerp, want de spuitmond is
 * rond. Zo'n perfecte hoek vangt ook geen licht, en juist dat lichtlijntje
 * langs elke rand is wat een vorm er echt uit laat zien in plaats van getekend.
 */

export type VormProps = {
  kleur: string
  logo?: THREE.Texture | null
  /** PETG glimt meer dan PLA, en transparant filament laat licht door. */
  soort?: "PLA" | "PETG"
  doorschijnend?: boolean
}

/** Eén materiaal voor het hele product: één shader, één keer compileren. */
const MateriaalContext = createContext<THREE.Material | null>(null)

function useMateriaal() {
  const m = useContext(MateriaalContext)
  if (!m) throw new Error("ProductVorm hoort het materiaal aan te leveren.")
  return m
}

/**
 * Een blok met afgeronde randen.
 *
 * De afronding is ongeveer een millimeter, net als bij een echte print, maar
 * nooit meer dan een kwart van de dunste kant: anders slaat een dun plaatje om
 * in een worst.
 */
function Blok({
  maat,
  ...rest
}: { maat: [number, number, number] } & Omit<
  React.ComponentProps<"mesh">,
  "args" | "children"
>) {
  const materiaal = useMateriaal()
  const straal = Math.min(1.1, Math.min(...maat) * 0.26)
  return (
    <mesh {...rest} material={materiaal}>
      <RoundedBoxGeometry args={maat} radius={straal} smoothness={2} bevelSegments={2} />
    </mesh>
  )
}

function Rond({
  args,
  ...rest
}: { args: [number, number, number, number?] } & Omit<
  React.ComponentProps<"mesh">,
  "args" | "children"
>) {
  const materiaal = useMateriaal()
  const [boven, onder, hoogte, segmenten = 48] = args
  return (
    <mesh {...rest} material={materiaal}>
      <cylinderGeometry args={[boven, onder, hoogte, segmenten]} />
    </mesh>
  )
}

/** Het logo als dun plaatje op het aangewezen vlak. */
function LogoVlak({
  logo,
  breedte,
  hoogte,
  positie,
  rotatie = [0, 0, 0],
}: {
  logo: THREE.Texture
  breedte: number
  hoogte: number
  positie: [number, number, number]
  rotatie?: [number, number, number]
}) {
  return (
    <mesh position={positie} rotation={rotatie}>
      <planeGeometry args={[breedte, hoogte]} />
      <meshPhysicalMaterial
        map={logo}
        transparent
        roughness={0.38}
        clearcoat={0.4}
        clearcoatRoughness={0.35}
        polygonOffset
        polygonOffsetFactor={-4}
      />
    </mesh>
  )
}

function Menukaarthouder({ logo }: VormProps) {
  return (
    <group>
      {/* voet */}
      <Blok maat={[110, 12, 45]} position={[0, 6, 0]} castShadow receiveShadow />
      {/* schuine rug */}
      <Blok maat={[110, 76, 7]} position={[0, 42, -13]} rotation={[-0.22, 0, 0]} castShadow />
      {/* opstaande rand die de kaart tegenhoudt */}
      <Blok maat={[110, 10, 6]} position={[0, 17, 15]} castShadow />
      {logo && (
        <LogoVlak logo={logo} breedte={44} hoogte={20} positie={[0, 6.4, 22.6]} />
      )}
    </group>
  )
}

function Tapknop({ logo }: VormProps) {
  const materiaal = useMateriaal()
  return (
    <group>
      <Rond args={[22, 26, 16, 56]} position={[0, 8, 0]} castShadow receiveShadow />
      <Rond args={[14, 22, 68, 56]} position={[0, 50, 0]} castShadow />
      <mesh position={[0, 88, 0]} castShadow material={materiaal}>
        <sphereGeometry args={[14, 48, 32]} />
      </mesh>
      {/* Een afgevlakt front waar het logo op komt. Bewust ondiep: als dit
          dieper is dan de kegel breed, steekt het als een vin uit. */}
      <Blok maat={[26, 34, 1.6]} position={[0, 52, 15.2]} rotation={[0.06, 0, 0]} castShadow />
      {logo && (
        <LogoVlak logo={logo} breedte={22} hoogte={22} positie={[0, 52, 16.2]} rotatie={[0.06, 0, 0]} />
      )}
    </group>
  )
}

function Tafelnummer() {
  return (
    <group>
      <Blok maat={[60, 10, 40]} position={[0, 5, 0]} castShadow receiveShadow />
      <Blok maat={[52, 58, 6]} position={[0, 38, -6]} rotation={[-0.16, 0, 0]} castShadow />
    </group>
  )
}

function Proeverijbordje({ logo }: VormProps) {
  return (
    <group>
      <Blok maat={[80, 10, 35]} position={[0, 5, 0]} castShadow receiveShadow />
      <Blok maat={[80, 44, 5]} position={[0, 30, -8]} rotation={[-0.3, 0, 0]} castShadow />
      <Blok maat={[80, 8, 5]} position={[0, 13, 9]} castShadow />
      {logo && (
        <LogoVlak logo={logo} breedte={30} hoogte={14} positie={[0, 5.6, 18]} />
      )}
    </group>
  )
}

function Displaystandaard({ logo }: VormProps) {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <Blok
          key={i}
          maat={[150, 16, 60]}
          position={[0, 8 + i * 26, -i * 22]}
          castShadow
          receiveShadow
        />
      ))}
      <Blok maat={[150, 88, 8]} position={[0, 44, -56]} castShadow />
      {logo && (
        <LogoVlak logo={logo} breedte={70} hoogte={30} positie={[0, 66, -51.6]} />
      )}
    </group>
  )
}

function Sleutelhanger({ logo }: VormProps) {
  const materiaal = useMateriaal()
  const vorm = useMemo(() => {
    const s = new THREE.Shape()
    const b = 55, h = 30, r = 8
    s.moveTo(-b / 2 + r, -h / 2)
    s.lineTo(b / 2 - r, -h / 2)
    s.quadraticCurveTo(b / 2, -h / 2, b / 2, -h / 2 + r)
    s.lineTo(b / 2, h / 2 - r)
    s.quadraticCurveTo(b / 2, h / 2, b / 2 - r, h / 2)
    s.lineTo(-b / 2 + r, h / 2)
    s.quadraticCurveTo(-b / 2, h / 2, -b / 2, h / 2 - r)
    s.lineTo(-b / 2, -h / 2 + r)
    s.quadraticCurveTo(-b / 2, -h / 2, -b / 2 + r, -h / 2)
    const gat = new THREE.Path()
    gat.absarc(-b / 2 + 9, 0, 4, 0, Math.PI * 2, true)
    s.holes.push(gat)
    return s
  }, [])

  return (
    <group>
      <mesh
        position={[0, 3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        material={materiaal}
      >
        <extrudeGeometry
          args={[vorm, { depth: 6, bevelEnabled: true, bevelSize: 0.9, bevelThickness: 0.9, bevelSegments: 3, curveSegments: 24 }]}
        />
      </mesh>
      {logo && (
        <LogoVlak logo={logo} breedte={26} hoogte={18} positie={[6, 9.4, 0]} rotatie={[-Math.PI / 2, 0, 0]} />
      )}
    </group>
  )
}

function Folderhouder({ logo }: VormProps) {
  return (
    <group>
      <Blok maat={[160, 10, 70]} position={[0, 5, 0]} castShadow receiveShadow />
      <Blok maat={[160, 106, 6]} position={[0, 58, -30]} rotation={[-0.12, 0, 0]} castShadow />
      <Blok maat={[160, 44, 6]} position={[0, 26, 28]} rotation={[0.1, 0, 0]} castShadow />
      {[-77, 77].map((x) => (
        <Blok key={x} maat={[6, 52, 66]} position={[x, 30, 0]} castShadow />
      ))}
      {logo && (
        <LogoVlak logo={logo} breedte={70} hoogte={26} positie={[0, 26, 31.4]} rotatie={[0.1, 0, 0]} />
      )}
    </group>
  )
}

function Vervangonderdeel() {
  const materiaal = useMateriaal()
  return (
    <group>
      <Blok maat={[60, 8, 40]} position={[0, 4, 0]} castShadow receiveShadow />
      <Blok maat={[8, 32, 40]} position={[-26, 16, 0]} castShadow />
      {/* Een open koker: die hoort van binnen ook zichtbaar te zijn, dus beide
          kanten van het vlak tekenen. */}
      <mesh position={[8, 22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[9, 9, 40, 40, 1, true]} />
        <primitive object={materiaal} attach="material" />
      </mesh>
    </group>
  )
}

const VORMEN: Record<string, (p: VormProps) => React.ReactElement> = {
  menukaarthouder: Menukaarthouder,
  tapknop: Tapknop,
  tafelnummer: Tafelnummer,
  proeverijbordje: Proeverijbordje,
  displaystandaard: Displaystandaard,
  sleutelhanger: Sleutelhanger,
  folderhouder: Folderhouder,
  vervangonderdeel: Vervangonderdeel,
}

export function ProductVorm({ id, ...props }: { id: string } & VormProps) {
  const Vorm = VORMEN[id] ?? Menukaarthouder

  const materiaal = useMemo(
    () =>
      maakPrintMateriaal({
        kleur: props.kleur,
        soort: props.soort ?? "PLA",
        doorschijnend: props.doorschijnend ?? false,
      }),
    [props.kleur, props.soort, props.doorschijnend]
  )
  useEffect(() => () => materiaal.dispose(), [materiaal])

  // De laaghoogte volgt hoe ver je weg staat. Van dichtbij precies wat de
  // printer doet, van veraf grover maar nog zichtbaar in plaats van weggefilterd.
  useFrame(({ camera, size }) => {
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 35
    const afstand = camera.position.length()
    materiaal.printUniforms.uLaagHoogte.value = leesbareLaaghoogte(
      afstand,
      fov,
      size.height
    )
  })

  return (
    <MateriaalContext value={materiaal}>
      <Vorm {...props} />
    </MateriaalContext>
  )
}
