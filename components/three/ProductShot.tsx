"use client"

import { Canvas } from "@react-three/fiber"
import * as THREE from "three"
import { ProductVorm } from "./ProductVorm"
import { Studio } from "./Studio"

/**
 * Eén product, stil, op een doorzichtige achtergrond. Hiermee schieten we de
 * productplaatjes voor de site (scripts/schiet-producten.mjs). Bewust zonder
 * draaien en zonder besturing: een plaatje moet elke keer hetzelfde zijn,
 * anders is het geen plaatje maar een momentopname.
 */
export function ProductShot({
  id,
  kleur,
  maat,
}: {
  id: string
  kleur: string
  maat: { x: number; y: number; z: number }
}) {
  const grootste = Math.max(maat.x, maat.y, maat.z, 40)
  const afstand = grootste * 3.1

  return (
    <Canvas
      // PCFSoftShadowMap is in three 0.185 vervallen en valt stil terug op de
      // harde variant. "percentage" is in deze versie het zachte filter
      // (Vogel-schijf, met shadow-radius als knop). "variance" gaf hier een
      // zwarte waaier onder het voorwerp; gezien op een schermafdruk.
      shadows="percentage"
      dpr={2}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        // Hier draait geen nabewerking, dus de curve moet van de renderer zelf
        // komen. Zonder curve worden de hooglichten hard afgekapt en zien de
        // plaatjes er anders uit dan hetzelfde product in de draaikijker.
        toneMapping: THREE.NeutralToneMapping,
      }}
      camera={{
        position: [afstand * 0.68, afstand * 0.52, afstand * 0.86],
        fov: 30,
        near: 1,
        far: afstand * 10,
      }}
      onCreated={({ camera }) => camera.lookAt(0, maat.y * 0.45, 0)}
    >
      {/* De studio levert al het omgevingslicht. De losse lampen die hier
          stonden zijn eruit: samen met de omgeving was het dubbel licht, en dan
          verbleekt een verzadigde kleur tot roze. Gezien op een schermafdruk. */}
      <Studio />

      {/* Eén lamp blijft, want een omgevingskaart werpt geen schaduw en zonder
          slagschaduw zweeft het voorwerp. */}
      <directionalLight
        position={[grootste * 1.5, grootste * 2.5, grootste * 1.7]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={3}
        shadow-bias={-0.0004}
        shadow-normalBias={grootste * 0.004}
      >
        {/* Strak om het voorwerp: een frustum van vier keer de breedte gooit
            driekwart van de schaduwkaart weg aan lege ruimte. */}
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

      <ProductVorm id={id} kleur={kleur} />
      {/* Een vlak dat alleen de schaduw toont. drei's ContactShadows kan hier
          niet: die rekent erop dat gl.autoClear aanstaat en dat zet de
          nabewerking uit, waarna de schaduw van elk beeld op het vorige stapelt. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={-1}>
        <planeGeometry args={[grootste * 5, grootste * 5]} />
        <shadowMaterial transparent opacity={0.22} color="#2a1f26" depthWrite={false} />
      </mesh>
    </Canvas>
  )
}
