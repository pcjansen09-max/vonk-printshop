"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { ProductVorm } from "./ProductVorm"
import { Studio } from "./Studio"
import { Nabewerking } from "./Nabewerking"
import { useRustig } from "@/lib/scrollen"

function Draaiend({
  id,
  kleur,
  logoUrl,
  draait,
  soort,
  doorschijnend,
}: {
  id: string
  kleur: string
  logoUrl: string | null
  draait: boolean
  soort?: "PLA" | "PETG"
  doorschijnend?: boolean
}) {
  const groep = useRef<THREE.Group>(null)

  const logo = useMemo(() => {
    if (!logoUrl) return null
    const tex = new THREE.TextureLoader().load(logoUrl)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return tex
  }, [logoUrl])

  useEffect(() => () => logo?.dispose(), [logo])

  useFrame((_, delta) => {
    if (draait && groep.current) groep.current.rotation.y += delta * 0.4
  })

  return (
    <group ref={groep}>
      <ProductVorm
        id={id}
        kleur={kleur}
        logo={logo}
        soort={soort}
        doorschijnend={doorschijnend}
      />
    </group>
  )
}

export default function ProductKijker({
  id,
  kleur,
  logoUrl,
  maat,
  draait = true,
  soort = "PLA",
  doorschijnend = false,
}: {
  id: string
  kleur: string
  logoUrl: string | null
  maat: { x: number; y: number; z: number }
  draait?: boolean
  soort?: "PLA" | "PETG"
  doorschijnend?: boolean
}) {
  const rustig = useRustig()
  const grootste = Math.max(maat.x, maat.y, maat.z, 40)
  const afstand = grootste * 2.5

  return (
    <Canvas
      // PCFSoftShadowMap is in three 0.185 vervallen en valt stil terug op de
      // harde variant. "percentage" is in deze versie het zachte filter
      // (Vogel-schijf, met shadow-radius als knop). "variance" gaf hier een
      // zwarte waaier onder het voorwerp; gezien op een schermafdruk.
      shadows="percentage"
      dpr={[1, 2]}
      camera={{
        position: [afstand * 0.62, afstand * 0.58, afstand * 0.9],
        fov: 34,
        near: 1,
        far: afstand * 10,
      }}
      // De tooncurve komt uit de nabewerking. Laat je hem hier ook aan staan,
      // dan wordt het beeld twee keer afgevlakt en verliest de kleur zijn kracht.
      gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}
    >
      {/* De studio doet het werk dat eerst drie lampen deden: hij geeft het
          plastic iets om in te weerspiegelen. */}
      <Studio />

      {/* Eén lamp blijft: een omgevingskaart werpt geen schaduw, en zonder
          slagschaduw zweeft het voorwerp. */}
      {/* De schaduwcamera zit strak om het voorwerp. Hij besloeg eerst vier keer
          de breedte van het voorwerp, dus ging driekwart van de schaduwkaart op
          aan lege ruimte. Nu is dezelfde kaart ruim twee keer zo scherp. */}
      <directionalLight
        position={[grootste * 1.6, grootste * 2.6, grootste * 1.3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={4}
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

      <Draaiend
        id={id}
        kleur={kleur}
        logoUrl={logoUrl}
        draait={draait}
        soort={soort}
        doorschijnend={doorschijnend}
      />


      {/* Eén contactschaduw. Twee gestapelde met een kleine 'far' gaven een
          zwarte waaier: die knipt bijna het hele voorwerp weg en dan blijven er
          alleen slierten over. 'far' hoort ongeveer de halve hoogte te zijn. */}
      {/* Een vlak dat alleen de schaduw laat zien en verder onzichtbaar is.
          Dit in plaats van drei's ContactShadows: die tekent in een eigen doel
          en rekent erop dat gl.autoClear aanstaat, wat de nabewerking uitzet.
          Zo hangt de schaduw aan de echte lamp, dus hij valt de goede kant op
          en wordt langer als het voorwerp hoger is. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        renderOrder={-1}
      >
        <planeGeometry args={[grootste * 5, grootste * 5]} />
        <shadowMaterial transparent opacity={0.26} color="#2a1f26" depthWrite={false} />
      </mesh>

      {/* De straal van de contactverdonkering hoort bij de maat van het
          voorwerp. Met een achtste is hij onzichtbaar; gemeten op een
          schermafdruk werkt ongeveer een kwart. */}
      <Nabewerking aan={!rustig} aoStraal={grootste * 0.25} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={afstand * 0.5}
        maxDistance={afstand * 2.2}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, maat.y * 0.32, 0]}
      />
    </Canvas>
  )
}
