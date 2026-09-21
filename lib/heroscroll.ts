/**
 * De scrollstand van de hero, gedeeld tussen de pagina en het 3D-tafereel.
 *
 * Bewust een gewoon object en geen React-state: het tafereel leest deze waarde
 * zestig keer per seconde in zijn eigen tekenlus. Zou dit state zijn, dan tekende
 * React de hele boom opnieuw bij elke scrollpuls, en dat is precies wat je op een
 * telefoon niet wilt.
 */
export const heroScroll = { waarde: 0 }
