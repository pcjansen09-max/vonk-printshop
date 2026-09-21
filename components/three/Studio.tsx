"use client"

import { memo, useEffect, useMemo } from "react"
import * as THREE from "three"
import { Environment, Lightformer } from "@react-three/drei"

/**
 * De fotostudio waarin alles staat.
 *
 * Dit is de grootste stap tussen "wel 3D" en "een echte productfoto". Plastic
 * zonder omgeving heeft niets om in te weerspiegelen; dan blijft het een
 * vlakke kleur, hoeveel lampen je er ook op richt.
 *
 * Twee dingen zijn hier met een schermafdruk uitgezocht en niet gegokt:
 *
 * - De lichtvlakken moeten GROOT zijn. Onze producten bestaan uit platte
 *   vlakken, en een plat vlak weerspiegelt maar één richting. Een kleine
 *   softbox levert dan één stipje of niets; een softbox die het halve
 *   beeldveld beslaat geeft een verloop over het hele vlak, en juist dat
 *   verloop laat zien dat er licht op valt.
 * - De achtergrond moet een verloop zijn en geen egale kleur. Een egale
 *   omgeving maakt elk plat vlak precies even licht, en dat is waarom een
 *   render er plat uitziet. Met licht boven en donker onder krijgt elke
 *   staande wand vanzelf een verloop van boven naar beneden, net als in een
 *   echte ruimte.
 *
 * <Environment> met eigen kinderen bakt dit in de browser tot een cubemap. Er
 * gaat geen enkel verzoek naar buiten. Dat is bewust: drei's kant-en-klare
 * presets halen een HDRI van raw.githack.com, en een klantsite die stukgaat
 * omdat andermans CDN eruit ligt is geen site.
 */

/** De wanden van de studio: licht van boven, donkerder naar de vloer. */
function useAchtergrond() {
  const textuur = useMemo(() => {
    const doek = document.createElement("canvas")
    doek.width = 4
    doek.height = 128
    const ctx = doek.getContext("2d")!
    const verloop = ctx.createLinearGradient(0, 0, 0, 128)
    verloop.addColorStop(0, "#ffffff")
    verloop.addColorStop(0.42, "#efeaec")
    verloop.addColorStop(0.72, "#c9c0c6")
    verloop.addColorStop(1, "#8e858c")
    ctx.fillStyle = verloop
    ctx.fillRect(0, 0, 4, 128)
    const t = new THREE.CanvasTexture(doek)
    t.colorSpace = THREE.SRGBColorSpace
    t.mapping = THREE.EquirectangularReflectionMapping
    return t
  }, [])

  useEffect(() => () => textuur.dispose(), [textuur])
  return textuur
}

/**
 * Bewust gememoiseerd. <Environment frames={1}> bakt opnieuw zodra dit
 * component opnieuw rendert, want de kinderen zijn dan nieuwe React-elementen.
 * Zonder memo bakt de studio dus bij elke kleurwissel de hele cubemap over.
 */
export const Studio = memo(function Studio({
  intensiteit = 0.62,
  resolutie = 256,
}: {
  intensiteit?: number
  resolutie?: number
}) {
  const achtergrond = useAchtergrond()

  return (
    <Environment resolution={resolutie} frames={1} environmentIntensity={intensiteit}>
      <mesh scale={60}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshBasicMaterial map={achtergrond} side={THREE.BackSide} toneMapped={false} />
      </mesh>

      {/* Hoofdlicht: een brede softbox schuin boven en naar links. Groot genoeg
          om een verloop over een heel vlak te leggen in plaats van een stip. */}
      <Lightformer
        form="rect"
        intensity={6}
        color="#ffffff"
        position={[-6, 11, 9]}
        rotation={[-Math.PI / 3.4, -0.5, 0]}
        scale={[26, 18, 1]}
      />

      {/* De twee staande striplampen. Dit zijn de lange witte strepen die je op
          elke productfoto over een ronding ziet lopen; zij maken zichtbaar dat
          iets rond is in plaats van gekleurd. */}
      <Lightformer
        form="rect"
        intensity={4.6}
        color="#ffffff"
        position={[-16, 3, 7]}
        rotation={[0, Math.PI / 2.7, 0]}
        scale={[3.4, 22, 1]}
      />
      <Lightformer
        form="rect"
        intensity={3}
        color="#fff3e8"
        position={[15, 4, 5]}
        rotation={[0, -Math.PI / 2.6, 0]}
        scale={[2.4, 20, 1]}
      />

      {/* Vonks eigen kleuren komen terug in de weerspiegeling: amber als warme
          weerkaatsing van onderen, magenta als randlicht van achteren. Subtiel;
          je moet het niet als gekleurd licht herkennen, alleen merken dat het
          bij deze site hoort. */}
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#f8ab21"
        position={[-9, -7, 8]}
        rotation={[Math.PI / 2.3, 0, 0]}
        scale={[18, 10, 1]}
      />
      <Lightformer
        form="rect"
        intensity={2.4}
        color="#e50075"
        position={[8, 6, -14]}
        rotation={[0, Math.PI * 0.85, 0]}
        scale={[14, 12, 1]}
      />

      {/* Het witte bord vóór het voorwerp, schuin boven de camera. In een echte
          studio staat hier een reflectiescherm, en dat is precies wat een plat
          vlak nodig heeft: zonder iets vóór het voorwerp weerspiegelt de
          voorkant de lege ruimte achter de camera en blijft hij dof. Dit is de
          reden dat productfoto's een brede zachte glans over het vlak hebben. */}
      <Lightformer
        form="rect"
        intensity={2.8}
        color="#ffffff"
        position={[-3, 9, 20]}
        rotation={[-Math.PI / 5.5, -0.22, 0]}
        scale={[30, 16, 1]}
      />

      {/* Een smalle streep pal boven: geeft de bovenrand van elk voorwerp een
          scherp lichtlijntje, zodat het loskomt van de achtergrond. */}
      <Lightformer
        form="rect"
        intensity={7}
        color="#ffffff"
        position={[2, 14, -2]}
        rotation={[Math.PI / 2, 0, 0.2]}
        scale={[16, 2.2, 1]}
      />

      {/* Twee smalle, felle strepen schuin voor het voorwerp.
          De grote softboxen hierboven geven het verloop, maar een verloop alleen
          blijft dof: wat een oppervlak echt laat glimmen is een KLEINE, FELLE
          bron, want die geeft een scherpe streep in plaats van een vage gloed.
          Dit is waarom een fotograaf naast zijn softbox nog een striplight zet. */}
      <Lightformer
        form="rect"
        intensity={14}
        color="#ffffff"
        position={[-11, 7, 13]}
        rotation={[-0.5, -0.72, 0.35]}
        scale={[1.1, 13, 1]}
      />
      <Lightformer
        form="rect"
        intensity={9}
        color="#fff8f0"
        position={[12, 5, 11]}
        rotation={[-0.35, 0.78, -0.3]}
        scale={[0.8, 11, 1]}
      />
    </Environment>
  )
})
