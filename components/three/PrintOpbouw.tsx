"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Studio } from "./Studio"
import { ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import { ProductVorm } from "./ProductVorm"
import { printScroll } from "@/lib/printscroll"

/**
 * Een tapknop die zichzelf opbouwt terwijl jij scrollt.
 *
 * Het wiel is hier de printer: wat onder de snijhoogte zit is geprint, wat
 * erboven zit staat er als schim bij, en op de grens ligt een gloeiende ring op
 * de laag die nu gelegd wordt. Dat is precies wat de klant straks op zijn eigen
 * scherm ziet, en het is het enige moment op deze pagina waarop het scrollen
 * zelf het onderwerp is.
 */

const MAAT = { x: 45, y: 95, z: 45 }

function Opbouw() {
  const { gl } = useThree()
  gl.localClippingEnabled = true

  const groep = useRef<THREE.Group>(null)
  const lijn = useRef<THREE.Mesh>(null)
  const geprint = useRef<THREE.Group>(null)
  const schim = useRef<THREE.Group>(null)

  const { onder, boven } = useMemo(
    () => ({
      onder: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      boven: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    }),
    []
  )

  const gezet = useRef(false)

  useFrame((_, delta) => {
    const t = Math.min(1, Math.max(0, printScroll.waarde))
    const snij = Math.max(0.001, t * MAAT.y)
    onder.constant = snij
    boven.constant = -snij

    if (lijn.current) {
      lijn.current.position.y = snij
      lijn.current.visible = t > 0.004 && t < 0.995
      const m = lijn.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.55 + Math.sin(performance.now() / 260) * 0.25
    }
    if (groep.current) groep.current.rotation.y += delta * 0.16

    // De snijvlakken eenmalig aan de materialen hangen; ProductVorm zet zijn
    // eigen materiaal, dus dat kan pas als de boom er staat.
    if (!gezet.current && geprint.current && schim.current) {
      const hang = (g: THREE.Group, vlakken: THREE.Plane[], schimmig: boolean) => {
        let raak = false
        g.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return
          raak = true
          const m = o.material as THREE.Material
          m.clippingPlanes = vlakken
          m.clipShadows = true
          if (schimmig) {
            m.transparent = true
            m.opacity = 0.23
            m.depthWrite = false
          }
          m.needsUpdate = true
        })
        return raak
      }
      const a = hang(geprint.current, [onder], false)
      const b = hang(schim.current, [boven], true)
      gezet.current = a && b
    }
  })

  return (
    <group ref={groep} position={[0, -MAAT.y * 0.5, 0]}>
      <group ref={geprint}>
        <ProductVorm id="tapknop" kleur="#e50075" />
      </group>
      <group ref={schim}>
        <ProductVorm id="tapknop" kleur="#b9b0b6" />
      </group>
      <mesh ref={lijn} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[MAAT.x * 0.5, MAAT.x * 0.62, 64]} />
        <meshBasicMaterial
          color="#f8ab21"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.26}
        scale={MAAT.y * 1.9}
        blur={2.6}
        far={MAAT.y}
        color="#2a1f26"
      />
    </group>
  )
}

export default function PrintOpbouw() {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.6]}
      camera={{ position: [128, 86, 176], fov: 30, near: 1, far: 900 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      {/* Dezelfde studio als overal, zodat de print die hier opgebouwd wordt er
          hetzelfde uitziet als het product dat je erna ziet. */}
      <Studio resolutie={128} />
      <directionalLight position={[90, 150, 110]} intensity={1.1} castShadow />
      <Opbouw />
    </Canvas>
  )
}
