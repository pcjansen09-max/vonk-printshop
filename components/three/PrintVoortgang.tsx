"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Studio } from "./Studio"
import { ContactShadows, OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { ProductVorm } from "./ProductVorm"

/**
 * De print die laag voor laag opbouwt.
 *
 * Het model wordt afgesneden op de hoogte waar de printer nu is. Wat eronder
 * zit, is geprint; wat erboven zit, staat er als schim bij zodat je ziet waar
 * het heen gaat. Op de snijhoogte ligt een lichtgevende lijn: dat is de laag
 * die op dit moment gelegd wordt.
 *
 * Dit is het beeld waar de hele belofte van de site op uitkomt. Een balkje van
 * zestig procent zegt niets; dit zegt het wel.
 */

function Opbouw({
  id,
  kleur,
  voortgang,
  hoogte,
  straal,
}: {
  id: string
  kleur: string
  voortgang: number
  hoogte: number
  /** Hoe breed de gloeiende laaglijn is. Hangt aan het model: een vaste maat
   *  legde bij een sleutelhanger een schijf over het halve scherm. */
  straal: number
}) {
  const { gl } = useThree()
  gl.localClippingEnabled = true

  const groep = useRef<THREE.Group>(null)
  const lijn = useRef<THREE.Mesh>(null)

  // Twee vlakken: één houdt het geprinte deel over, één het deel dat nog moet.
  const { onder, boven } = useMemo(
    () => ({
      onder: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      boven: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    }),
    []
  )

  useFrame((_, delta) => {
    const snij = Math.max(0.001, voortgang * hoogte)
    onder.constant = snij
    boven.constant = -snij
    if (lijn.current) {
      lijn.current.position.y = snij
      lijn.current.visible = voortgang > 0.002 && voortgang < 0.999
    }
    if (groep.current) groep.current.rotation.y += delta * 0.22
  })

  return (
    <group ref={groep}>
      {/* het geprinte deel */}
      <group>
        <ProductVormMetVlakken id={id} kleur={kleur} vlakken={[onder]} />
      </group>

      {/* wat er nog moet komen, als lichte schim */}
      <group>
        <ProductVormMetVlakken
          id={id}
          kleur="#cfc7cc"
          vlakken={[boven]}
          doorzichtig
        />
      </group>

      {/* De laag die nu gelegd wordt, als dunne gloeiende ring op die hoogte.
          Stond eerst als gevulde schijf en dat legde een gele vlek over het
          hele model heen; een lijn zegt hetzelfde en verbergt niets. */}
      <mesh ref={lijn} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[straal * 0.93, straal, 64]} />
        <meshBasicMaterial
          color="#f8ab21"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Dezelfde vorm, maar met snijvlakken op elk materiaal.
 *
 * De vormen zetten hun eigen materiaal, dus we lopen na het opbouwen door de
 * boom heen en hangen de vlakken eraan. Dat is minder net dan het materiaal
 * doorgeven, maar het houdt ProductVorm eenvoudig, en die wordt op drie
 * pagina's gebruikt.
 */
function ProductVormMetVlakken({
  id,
  kleur,
  vlakken,
  doorzichtig = false,
}: {
  id: string
  kleur: string
  vlakken: THREE.Plane[]
  doorzichtig?: boolean
}) {
  const groep = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groep.current) return
    groep.current.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      const m = o.material as THREE.Material
      if (m.clippingPlanes !== vlakken) {
        m.clippingPlanes = vlakken
        m.clipShadows = true
        if (doorzichtig) {
          m.transparent = true
          m.opacity = 0.22
          m.depthWrite = false
        }
        m.needsUpdate = true
      }
    })
  })

  return (
    <group ref={groep}>
      <ProductVorm id={id} kleur={kleur} />
    </group>
  )
}

export default function PrintVoortgang({
  id,
  kleur,
  voortgang,
  maat,
}: {
  id: string
  kleur: string
  voortgang: number
  maat: { x: number; y: number; z: number }
}) {
  const grootste = Math.max(maat.x, maat.y, maat.z, 40)
  const afstand = grootste * 2.6

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.8]}
      camera={{
        position: [afstand * 0.6, afstand * 0.55, afstand * 0.92],
        fov: 34,
        near: 1,
        far: afstand * 10,
      }}
      // Geen nabewerking op dit paneel, dus de curve komt van de renderer.
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping }}
    >
      {/* Dezelfde studio als bij de producten. Zonder omgevingskaart is dit het
          enige paneel dat nog vlak oogt, en dat valt op naast de rest. */}
      <Studio resolutie={128} />
      <directionalLight
        position={[grootste * 1.6, grootste * 2.4, grootste * 1.3]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={3}
        shadow-bias={-0.0004}
        shadow-normalBias={grootste * 0.004}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[
            -grootste * 0.85,
            grootste * 0.85,
            grootste * 0.85,
            -grootste * 0.85,
            grootste * 0.5,
            grootste * 6,
          ]}
        />
      </directionalLight>

      <Opbouw
        id={id}
        kleur={kleur}
        voortgang={voortgang}
        hoogte={maat.y}
        straal={Math.max(maat.x, maat.z) * 0.62}
      />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.28}
        scale={grootste * 3.2}
        blur={2.4}
        far={grootste * 1.6}
        color="#2a1f26"
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={afstand * 0.5}
        maxDistance={afstand * 2}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, maat.y * 0.36, 0]}
      />
    </Canvas>
  )
}
