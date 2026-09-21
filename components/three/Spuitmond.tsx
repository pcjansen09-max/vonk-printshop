"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RoundedBoxGeometry } from "@react-three/drei"
import * as THREE from "three"

/**
 * De hete kant van de printer: koelblok, verwarmingsblok en de mond zelf.
 *
 * Opgebouwd uit eenvoudige vormen in plaats van een ingeladen model. Dat
 * scheelt een bestand van een paar megabyte op de eerste pagina, en het geeft
 * ons de vrijheid om het messing van de mond precies de goede glans te geven.
 *
 * Alles is afgerond en alles is metaal. Dat is de reden dat dit er eerst als
 * een stapeltje grijze doosjes uitzag: een scherpe hoek zonder weerspiegeling
 * vangt nergens licht, dus zie je alleen een vlak. Een afgeronde rand op een
 * geborsteld blok trekt een lichtstreep, en dán leest het als gefreesd metaal.
 * Het werkt alleen samen met de studio-omgeving: metaal zonder omgeving is
 * zwart.
 */
export function Spuitmond({ warm = 1 }: { warm?: number }) {
  const gloed = useRef<THREE.Mesh>(null)
  const druppel = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (gloed.current) {
      // Heel licht ademen, zoals een verwarmingselement dat bijregelt.
      const m = gloed.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = warm * (0.38 + Math.sin(t * 2.1) * 0.09)
    }
    if (druppel.current) {
      // Het plastic dat de mond verlaat is het heetst en gloeit het felst.
      const m = druppel.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = warm * (2.6 + Math.sin(t * 3.4) * 0.5)
    }
  })

  return (
    <group>
      {/* koelblok met ribben, geanodiseerd aluminium */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <RoundedBoxGeometry args={[0.56, 1.05, 0.56]} radius={0.05} smoothness={2} />
        <meshPhysicalMaterial
          color="#c9c5c8"
          roughness={0.5}
          metalness={0.74}
          clearcoat={0.3}
          clearcoatRoughness={0.35}
          envMapIntensity={0.95}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 1.16 + i * 0.24, 0]} castShadow>
          <RoundedBoxGeometry args={[0.7, 0.05, 0.7]} radius={0.014} smoothness={2} />
          {/* Iets ruwer en minder spiegelend dan eerst: op 0,42 vingen de
              ribben zoveel amber uit de studio dat het aluminium als messing
              las. Nu blijven ze neutraal grijs met een warme rand. */}
          <meshPhysicalMaterial
            color="#c4c0c3"
            roughness={0.55}
            metalness={0.72}
            envMapIntensity={0.95}
          />
        </mesh>
      ))}

      {/* verwarmingsblok: zwart geanodiseerd, met de gloed van het element */}
      <mesh ref={gloed} position={[0, 0.72, 0]} castShadow>
        <RoundedBoxGeometry args={[0.72, 0.42, 0.62]} radius={0.045} smoothness={2} />
        <meshStandardMaterial
          color="#221d1f"
          roughness={0.42}
          metalness={0.72}
          // Een verwarmingsblok is zwart geanodiseerd aluminium met een gloed
          // erin, geen roze doos. Op 1,6 overstemde de gloed de kleur volledig
          // en werd het blok het felste vlak van de hele pagina.
          emissive="#e50075"
          emissiveIntensity={0.38}
          envMapIntensity={1.1}
        />
      </mesh>

      {/* de mond: messing, gepolijst, duidelijk warmer van kleur dan de rest */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.055, 0.34, 40]} />
        <meshPhysicalMaterial
          color="#c9a05a"
          roughness={0.17}
          metalness={1}
          clearcoat={0.5}
          clearcoatRoughness={0.12}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* de druppel die de mond verlaat: dit is het heetste punt in beeld en
          het enige dat fel genoeg is om te laten uitlopen in de nabewerking */}
      <mesh ref={druppel} position={[0, 0.21, 0]}>
        <sphereGeometry args={[0.075, 24, 18]} />
        <meshStandardMaterial
          color="#ff5aa8"
          emissive="#ff2e93"
          emissiveIntensity={2.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* het filament dat er nog in gaat */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.7, 24]} />
        <meshPhysicalMaterial
          color="#e50075"
          roughness={0.4}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </group>
  )
}
