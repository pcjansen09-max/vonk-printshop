"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Studio } from "./Studio"
import { leesbareLaaghoogte, maakPrintMateriaal } from "./printmateriaal"
import { Grid, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

/**
 * Het geüploade model op de printplaat.
 *
 * Het model wordt gecentreerd en op de plaat gezet, zodat je meteen ziet hoe
 * het straks op de printer staat en of het past. De plaat is op schaal: dat is
 * de enige eerlijke manier om "past niet" te laten zien.
 */

function Model({
  punten,
  kleur,
  draait,
}: {
  punten: Float32Array
  kleur: string
  draait: boolean
}) {
  const groep = useRef<THREE.Group>(null)

  const { geometrie, verschuiving } = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(punten.slice(), 3))
    geo.computeVertexNormals()
    geo.computeBoundingBox()
    const doos = geo.boundingBox!
    const midden = new THREE.Vector3()
    doos.getCenter(midden)
    return {
      geometrie: geo,
      // op x en z centreren, en met de onderkant op de plaat zetten
      verschuiving: new THREE.Vector3(-midden.x, -doos.min.y, -midden.z),
    }
  }, [punten])

  useEffect(() => () => geometrie.dispose(), [geometrie])

  const materiaal = useMemo(() => maakPrintMateriaal({ kleur }), [kleur])
  useEffect(() => () => materiaal.dispose(), [materiaal])

  // De laaghoogte volgt hoe ver je weg staat, zodat de lijnen leesbaar blijven.
  useFrame(({ camera, size }) => {
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 38
    materiaal.printUniforms.uLaagHoogte.value = leesbareLaaghoogte(
      camera.position.length(),
      fov,
      size.height
    )
  })

  useFrame((_, delta) => {
    if (draait && groep.current) groep.current.rotation.y += delta * 0.32
  })

  return (
    <group ref={groep}>
      {/* Hetzelfde printmateriaal als bij onze eigen producten: je ziet je
          eigen model meteen met de laaglijnen erop, zoals het eruit komt. */}
      <mesh
        geometry={geometrie}
        position={verschuiving}
        material={materiaal}
        castShadow
        receiveShadow
      />
    </group>
  )
}

/** Zet de camera zo dat het hele model in beeld staat, hoe groot het ook is. */
function PasCameraAan({ maat }: { maat: { x: number; y: number; z: number } }) {
  const { camera } = useThree()
  useEffect(() => {
    const grootste = Math.max(maat.x, maat.y, maat.z, 20)
    const afstand = grootste * 2.4
    camera.position.set(afstand * 0.72, afstand * 0.62, afstand * 0.85)
    camera.lookAt(0, maat.y / 2, 0)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = grootste / 100
      camera.far = afstand * 8
      camera.updateProjectionMatrix()
    }
  }, [camera, maat.x, maat.y, maat.z])
  return null
}

export default function ModelKijker({
  punten,
  maat,
  kleur,
  plaat,
  draait = true,
}: {
  punten: Float32Array
  maat: { x: number; y: number; z: number }
  kleur: string
  plaat: { x: number; y: number; z: number }
  draait?: boolean
}) {
  const grootste = Math.max(maat.x, maat.y, maat.z, 40)
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ fov: 38 }}
      // Geen nabewerking op dit paneel, dus de curve komt van de renderer.
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping }}
    >
      <PasCameraAan maat={maat} />
      {/* Dezelfde studio als bij de producten, zodat een eigen model er niet
          anders uitziet dan wat we zelf laten zien. */}
      <Studio />
      {/* De schaduwcamera hoort om het model heen te staan. Standaard bouwt
          three er een van min vijf tot vijf, en deze scene meet honderden
          millimeters: dan valt er buiten dat kubusje niets meer te zien. */}
      <directionalLight
        position={[grootste + 80, grootste * 1.6 + 90, grootste + 70]}
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
            -grootste * 0.9,
            grootste * 0.9,
            grootste * 0.9,
            -grootste * 0.9,
            grootste * 0.5,
            grootste * 8,
          ]}
        />
      </directionalLight>

      {/* Een vlak dat alleen de schaduw toont. De contactschaduw die hier stond
          zat in de groep die ronddraait, dus draaide de schaduw mee met het
          model in plaats van stil op de plaat te liggen. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[plaat.x * 1.6, plaat.z * 1.6]} />
        <shadowMaterial transparent opacity={0.22} color="#2a1f26" depthWrite={false} />
      </mesh>

      {/* de printplaat op schaal */}
      <Grid
        args={[plaat.x, plaat.z]}
        cellSize={10}
        cellThickness={0.5}
        cellColor="#ded6da"
        sectionSize={50}
        sectionThickness={1}
        sectionColor="#c9bfc5"
        fadeDistance={plaat.x * 3}
        fadeStrength={1}
        infiniteGrid={false}
        position={[0, 0, 0]}
      />

      <Model punten={punten} kleur={kleur} draait={draait} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={Math.max(maat.x, maat.y, maat.z) * 0.8}
        maxDistance={Math.max(maat.x, maat.y, maat.z) * 6}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, maat.y / 2, 0]}
      />
    </Canvas>
  )
}
