"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { maakStreng } from "./lint"
import { maakVerloopTextuur } from "./verloop"
import { Spuitmond } from "./Spuitmond"
import { Studio } from "./Studio"
import { Nabewerking } from "./Nabewerking"
import { heroScroll } from "@/lib/heroscroll"
import { useRustig } from "@/lib/scrollen"

/**
 * De hero: een spuitmond die een lint filament uitlegt dat over het scherm
 * wegzwiept.
 *
 * Waarom dit en niet een foto van een printer: de belofte van deze site is dat
 * je ziet wat er gebeurt voordat het gebeurt. Een echt 3D-tafereel dat op je
 * muis reageert zegt dat in één beeld, en het is precies wat we verkopen.
 *
 * Het lint waaiert uit in vier banen. De voorste is scherp en vangt licht, de
 * drie erachter zijn zachter en doorschijnend. Dat geeft diepte zonder dat er
 * een nabewerkingsstap bij hoeft, die op een telefoon duur is.
 */

const BANEN = [
  { hoogte: 0.0, breedte: 0.5, dekking: 1.0, ruw: 0.3 },
  { hoogte: -0.5, breedte: 0.4, dekking: 0.5, ruw: 0.6 },
  { hoogte: -0.95, breedte: 0.31, dekking: 0.3, ruw: 0.7 },
  { hoogte: -1.36, breedte: 0.23, dekking: 0.16, ruw: 0.8 },
]

/**
 * Het verloop over de lengte van het lint.
 *
 * Vonks logo loopt van amber naar magenta, maar dat verloop is gemaakt voor een
 * vlak van een paar centimeter. Uitgerekt over een lint dat het halve scherm
 * beslaat blijft magenta dan achter de rand hangen en zie je vooral oranje.
 * Daarom komt magenta hier eerder en houdt hij het laatste stuk vast.
 */
const LINTVERLOOP = [
  "#f8ab21",
  "#f6982a",
  "#f2793a",
  "#ed5450",
  "#e92a60",
  "#e50075",
  "#e50075",
] as const

const STAPPEN = 190
/** Hoeveel punten de doorsnede van de streng telt. */
const ZIJDEN = 10

/**
 * De baan die het filament aflegt: uit de mond, even vlak, en dan in een
 * versnellende zwiep naar de rechterbovenhoek het beeld uit.
 *
 * De baan draait ook iets in de diepte. Daardoor vangt het lint onderweg
 * ander licht en zie je dat het een band is en geen geschilderde streep.
 */
function baanKromme(hoogte: number, faseVerschil: number) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.2 + hoogte * 0.08, 0),
    new THREE.Vector3(1.15, 0.02 + hoogte * 0.2, 0.3 + faseVerschil * 0.16),
    new THREE.Vector3(2.5, 0.62 + hoogte * 0.45, 0.16 + faseVerschil * 0.3),
    new THREE.Vector3(4.05, 2.1 + hoogte * 0.75, -0.3 + faseVerschil * 0.26),
    new THREE.Vector3(5.75, 4.3 + hoogte, -0.8 + faseVerschil * 0.16),
    new THREE.Vector3(7.5, 7.05 + hoogte * 1.2, -1.35),
  ])
}

function Lint({
  hoogte,
  breedte,
  dekking,
  ruw,
  index,
  rustig,
}: (typeof BANEN)[number] & { index: number; rustig: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const getekend = useRef(0)

  const { geometrie, textuur } = useMemo(() => {
    const kromme = baanKromme(hoogte, index)
    // Het lint wordt naar het einde toe smaller, alsof het wegvalt in de
    // verte. Bij de mond is het precies zo breed als de mond zelf.
    const geo = maakStreng(kromme, STAPPEN, (t) => breedte * (1 - t * 0.42))
    return { geometrie: geo, textuur: maakVerloopTextuur(LINTVERLOOP) }
  }, [hoogte, breedte, index])

  useEffect(() => {
    // Het lint tekent zichzelf: het komt uit de mond gerold in plaats van er
    // in één klap te staan. Bij "minder beweging" staat het er meteen.
    if (rustig) {
      geometrie.setDrawRange(0, Infinity)
      return
    }
    geometrie.setDrawRange(0, 0)
  }, [geometrie, rustig])

  useFrame((_, delta) => {
    if (rustig) return
    const totaal = STAPPEN * ZIJDEN * 6
    if (getekend.current < totaal) {
      getekend.current = Math.min(totaal, getekend.current + delta * totaal * 0.62)
      geometrie.setDrawRange(0, Math.floor(getekend.current))
    }
  })

  useEffect(() => () => geometrie.dispose(), [geometrie])

  return (
    <mesh ref={mesh} geometry={geometrie} castShadow={index === 0}>
      {/* Warm plastic heeft een glanslaag: dat is de streep licht die over de
          bovenkant van de streng loopt en waaraan je ziet dat hij rond is. */}
      <meshPhysicalMaterial
        map={textuur}
        roughness={ruw}
        metalness={0}
        clearcoat={dekking > 0.6 ? 0.75 : 0.3}
        clearcoatRoughness={0.16}
        sheen={0.2}
        sheenRoughness={0.6}
        envMapIntensity={1.2}
        transparent={dekking < 1}
        opacity={dekking}
        depthWrite={dekking > 0.6}
      />
    </mesh>
  )
}

function Tafereel({ rustig }: { rustig: boolean }) {
  const groep = useRef<THREE.Group>(null)
  const { viewport, size } = useThree()
  const doel = useRef({ x: 0, y: 0 })

  useFrame(({ pointer }, delta) => {
    if (!groep.current) return
    if (!rustig) {
      // De muis geeft een klein beetje leven, het scrollen doet het echte werk:
      // het tafereel kantelt weg en zakt terwijl je verder leest, zodat het lint
      // meedraait in plaats van als plaatje te blijven staan.
      const sc = heroScroll.waarde
      doel.current.x = pointer.y * 0.09 + sc * 0.34
      doel.current.y = pointer.x * 0.16 - sc * 0.5
      groep.current.position.y = plek[1] - sc * 1.9
      groep.current.position.x = plek[0] + sc * 1.1
      groep.current.scale.setScalar(schaal * (1 - sc * 0.16))
    }
    // Naijlen in plaats van meteen volgen: dat voelt als gewicht en niet als
    // een plaatje dat aan de cursor vastzit.
    groep.current.rotation.x +=
      (doel.current.x - groep.current.rotation.x) * Math.min(1, delta * 2.4)
    groep.current.rotation.y +=
      (doel.current.y - groep.current.rotation.y) * Math.min(1, delta * 2.4)
  })

  // De tekstkolom loopt tot ongeveer een tiende rechts van het midden. Alles
  // van het tafereel hoort daar rechts van te blijven staan, anders loopt het
  // lint over de kop en over de knoppen heen.
  // Op een breed scherm loopt de tekstkolom tot net rechts van het midden en
  // hoort het tafereel daar rechts van te blijven, anders loopt het lint over
  // de kop en de knoppen heen.
  //
  // Op een telefoon staat het tafereel onder de tekst in een eigen strook. Daar
  // is die uitwijk niet nodig en zou hij het juist half uit beeld duwen, dus
  // schuift het dan naar links en gaat het groter.
  //
  // De keuze hangt aan de breedte in beeldpunten en niet aan de verhouding van
  // het canvas: die strook is breed en laag, dus de verhouding zei niets over
  // hoeveel ruimte er werkelijk is.
  const smal = size.width < 768
  const schaal = smal
    ? Math.min(1.15, viewport.width / 6.2)
    : Math.min(1.02, viewport.width / 11)
  const plek: [number, number, number] = smal ? [-2.2, -1.15, 0] : [1.1, -1.95, 0]

  return (
    <group ref={groep} scale={schaal} position={plek}>
      <group scale={1.15}>
        <Spuitmond />
      </group>
      {BANEN.map((b, i) => (
        <Lint key={i} {...b} index={i} rustig={rustig} />
      ))}
      {/* Geen grondschaduw. De mond hangt in de lucht en er is geen tafel, dus
          een schaduw op de grond gaf alleen een grijze veeg naast de knoppen.
          Gezien op een schermafdruk van de startpagina. */}
    </group>
  )
}

export default function HeroTafereel() {
  const rustig = useRustig()

  return (
    <Canvas
      // Twee keer de beeldpuntdichtheid kost hier vier keer zoveel werk en
      // levert op een tafereel dat beweegt nauwelijks iets op.
      dpr={[1, 1.6]}
      shadows="percentage"
      camera={{ position: [1.2, 2.6, 9.4], fov: 34 }}
      // De tooncurve zit in de nabewerking; twee keer afvlakken maakt de kleur dof.
      gl={{ antialias: false, alpha: true, toneMapping: THREE.NoToneMapping }}
      style={{ pointerEvents: "none" }}
    >
      {/* Een studio in plaats van losse lampen. Die wordt in de browser zelf
          gebakken, dus er gaat geen verzoek naar buiten: drei's kant-en-klare
          omgevingen halen een HDRI van een CDN, en een eerste pagina die
          daarvan afhangt is er een te veel. */}
      <Studio intensiteit={0.7} resolutie={192} />

      {/* Eén lamp voor de slagschaduw; een omgevingskaart werpt er geen. */}
      <directionalLight
        position={[5, 8, 6]}
        intensity={1.2}
        castShadow
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.1, 30]} />
      </directionalLight>

      <Tafereel rustig={rustig} />

      {/* Bloom voor de hete mond: die hoort licht te geven, niet alleen roze te
          zijn. De drempel staat hoog zodat alleen het gloeiende stuk uitloopt. */}
      <Nabewerking aan={!rustig} zwaar={false} verdonkering={false} />
    </Canvas>
  )
}
