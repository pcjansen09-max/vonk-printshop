"use client"

import { useEffect } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import {
  Bloom,
  EffectComposer,
  N8AO,
  SMAA,
  ToneMapping,
} from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"

/**
 * De nabewerking: wat een fotograaf in de donkere kamer doet.
 *
 * Drie dingen, en elk lost iets op dat je anders ziet:
 *
 * - N8AO zet schaduw in de naden. Waar twee vlakken elkaar raken hoort het
 *   donkerder te zijn, en zonder dat lijkt alles opgeplakt. Dit is het effect
 *   dat een vorm op een tafel zet in plaats van ervoor.
 * - Bloom laat alleen de echt felle plekken uitlopen: de hete spuitmond, een
 *   scherpe weerkaatsing op een rand. De drempel staat hoog, want bloom over
 *   het hele beeld is precies waar een render goedkoop van wordt.
 * - Een tooncurve. Zonder curve lopen felle magenta en amber vlak, omdat alles
 *   boven de één wordt afgekapt. We gebruiken Khronos PBR Neutral en niet AgX:
 *   AgX is gemaakt voor film en trekt de kleur eruit, en een merkkleur die niet
 *   meer klopt is erger dan een beeld dat iets minder filmisch is. Gemeten met
 *   een schermafdruk: onder AgX werd #e50075 een bleek roze.
 *
 * Geen vignet. Deze doeken zijn doorzichtig, dus een vignet zou alleen de
 * randen van het voorwerp zelf verdonkeren en niet de hoeken van het beeld.
 * Ook dat is met een schermafdruk vastgesteld en niet aangenomen.
 *
 * Het geheel gaat uit bij "minder beweging": dan is het de rekentijd niet waard.
 */
/**
 * Zet het wissen van beeldbuffers terug aan.
 *
 * De composer zet gl.autoClear op false zodra hij bestaat (autoClearGuard in
 * @react-three/postprocessing) en houdt dat vast tot hij verdwijnt. drei's
 * ContactShadows rekent erop dat het true is: hij tekent zijn schaduw in een
 * eigen doel en roept nergens gl.clear aan. Samen betekent dat: elk beeld
 * stapelt op het vorige, en bij een draaiend voorwerp krijg je een waaier van
 * alle standen door elkaar.
 *
 * Dat is precies wat er op het scherm stond; daarna teruggevonden in de
 * broncode van allebei de pakketten. De composer zet autoClear rond zijn eigen
 * render toch expliciet, dus hem hier terugzetten breekt niets.
 *
 * De volgorde luistert: prioriteit -1 loopt vóór ContactShadows (0) en vóór de
 * composer (1). Een negatieve prioriteit zet de eigen render van R3F niet
 * terug aan, want die telling kijkt alleen naar priority > 0.
 */
/**
 * De tooncurve zonder nabewerking.
 *
 * De doeken staan bewust op NoToneMapping omdat de composer de curve doet.
 * Draait de composer niet, dan staat er dus helemaal geen curve en worden de
 * hooglichten hard afgekapt. Dit zet hem terug op de renderer en draait dat
 * netjes terug zodra de nabewerking het weer overneemt.
 */
function PlatteTooncurve() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const vorige = gl.toneMapping
    gl.toneMapping = THREE.NeutralToneMapping
    return () => {
      gl.toneMapping = vorige
    }
  }, [gl])
  return null
}

function HerstelWissen() {
  const gl = useThree((s) => s.gl)
  useFrame(() => {
    gl.autoClear = true
  }, -1)
  return null
}

export function Nabewerking({
  aan = true,
  zwaar = true,
  /** Contactverdonkering. Alleen zinvol waar vlakken elkaar raken; op een
   *  tafereel dat in de lucht hangt kost het alleen maar. Gemeten op de
   *  startpagina: met verdonkering 3 beelden per seconde, zonder 24. */
  verdonkering = true,
  /** In dezelfde eenheid als de scene. De modellen staan in millimeters, dus
   *  een straal van een halve eenheid zie je daar niet: die moet mee met de
   *  maat van het voorwerp. */
  aoStraal = 6,
}: {
  aan?: boolean
  zwaar?: boolean
  verdonkering?: boolean
  aoStraal?: number
}) {
  // Staat de nabewerking uit, dan blijft de renderer op NoToneMapping staan en
  // krijgt juist de bezoeker met "minder beweging" een plat, afgekapt beeld.
  // Die zet de curve dus alsnog, gewoon op de renderer zelf.
  if (!aan) return <PlatteTooncurve />

  return (
    <>
      <HerstelWissen />
      {/* Twee dingen die de documentatie van de pakketten zelf zegt:
          - enableNormalPass is alleen voor SSGI nodig en kost een complete
            extra render. N8AO rekent zijn eigen diepte uit.
          - de composer schakelt de kartelbestrijding van het doek zelf uit, dus
            multisampling hier heeft geen zin: SMAA doet het werk, als laatste. */}
      <EffectComposer multisampling={0}>
      {verdonkering ? (
      <N8AO
        aoRadius={aoStraal}
        intensity={2.6}
        distanceFalloff={1}
        quality={zwaar ? "medium" : "performance"}
        // halfRes alleen op zwakkere apparatuur: op halve resolutie wordt de
        // verdonkering zo vaag dat je hem nauwelijks nog ziet.
        halfRes={!zwaar}
        color="#2a1f26"
      />
      ) : (
        <></>
      )}
      <Bloom
        intensity={0.38}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.6}
      />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <SMAA />
      </EffectComposer>
    </>
  )
}
