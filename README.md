# Vonk Printshop

Webshop voor de Printshop van Vonk Schagen: 3D printen, posters, banners en
drukwerk. Gemaakt voor de opdracht E-commerce, jaar 2.

## Begin hier

De site is af en draait. Wat je nodig hebt:

```bash
npm install
npm run dev          # http://localhost:3000
```

Node 20 of nieuwer. Verder niets: geen database, geen sleutels, geen account.
Alles draait in de browser van de bezoeker.

**Zelf online zetten.** Maak een gratis account op vercel.com, klik "Add New
Project", sleep deze map erin (of zet hem eerst op GitHub en koppel die). Vercel
herkent Next.js zelf, je hoeft niets in te stellen. Je krijgt een adres als
`jouwnaam-printshop.vercel.app` en de site vult dat adres zelf in waar het nodig
is.

**Versiebeheer.** Deze map heeft nog geen git-geschiedenis. Begin je eigen:

```bash
git init && git add -A && git commit -m "Vonk Printshop overgenomen"
```

**Waar je begint als je iets wil veranderen**

| Wat | Bestand |
|---|---|
| Naam, adres, mailadres, kleuren | `lib/merk.ts` |
| Prijzen van 3D printen | `lib/prijs/print3d.ts` |
| Prijzen van drukwerk | `lib/prijs/drukwerk.ts` |
| Prijzen van banners | `lib/prijs/banner.ts` |
| Filamenten, papiersoorten, producten | `lib/catalogus.ts` |
| Levertijd | `lib/merk.ts` (`LEVERTIJD`) |

Verander je een prijs, draai dan `npm test`. Die tests rekenen na of de getoonde
regels samen het totaal vormen, zodat een klant die het natelt uitkomt.

De belofte van de site staat in één zin op de voorpagina: **je model erin, de
prijs eruit.** Bestaande printshops in Schagen werken via de mail. Je stuurt een
bestand, je wacht op een prijs, je mailt terug. Hier zit die hele lus in de
website.

## Wat er werkt

| Onderdeel | Waar | Wat het doet |
|---|---|---|
| Model uploaden | `/3d-printen` | Leest je STL uit in je eigen browser, laat het model op de printplaat zien en rekent de prijs uit |
| Zelf ontwerpen | `/ontwerpen` | Kies een product, je huiskleur en je logo, met een draaiend voorbeeld in 3D |
| Drukwerk | `/drukwerk` | A4 tot A1 op drie papiersoorten, op maat gesneden |
| Banners | `/banners` | Spandoeken op maat, op pvc, mesh of textiel |
| Bestand beoordelen | `/drukwerk`, `/banners` | Zegt bij het uploaden meteen of je ontwerp scherp genoeg is voor dat formaat |
| Print volgen | `/volgen` | Laat laag voor laag zien hoe ver de printer is |
| Bestellen | `/winkelwagen`, `/bestellen` | Winkelwagen, gegevens en een bestelnummer om mee te volgen |

## Hoe de prijs tot stand komt

Geen verzonnen tabel maar een som die klopt met wat er in de werkplaats gebeurt,
zodat het gedrag ook klopt bij instellingen die we nooit getest hebben.

**3D printen** (`lib/prijs/print3d.ts`)

1. Het volume komt uit het STL-bestand zelf: elke driehoek vormt met de
   oorsprong een viervlak, en die tekenvolumes heffen elkaar buiten het model
   op. De normaal die in het bestand staat gebruiken we niet, want veel
   exporteurs schrijven daar onzin in.
2. Materiaal = volume × (schil + vulling in wat overblijft) × verlies.
3. Tijd = materiaal ÷ doorvoer, en de doorvoer is laaghoogte × lijnbreedte ×
   snelheid. Daarom duurt een dunnere laag automatisch langer.
4. Daarbij een vast bedrag voor voorbereiding, één keer per opdracht en niet per
   stuk, plus een staffelkorting en een bodemprijs.

**Drukwerk** (`lib/prijs/drukwerk.ts`) rekent per A4 aan oppervlak, maal het
papier, maal het aantal.

**Banners** (`lib/prijs/banner.ts`) rekenen per vierkante meter doek, plus de
ogen langs de rand en de zoom eromheen. De rol is 150 cm breed, dus een banner
van 300 bij 100 kan gewoon: die gaat dwars. Pas als allebei de maten breder zijn
dan de rol kan het niet meer.

**Is dit bestand scherp genoeg** (`lib/bestand/resolutie.ts`) rekent uit hoeveel
punten per inch er overblijven op het gekozen formaat. Een poster wil er 120,
een banner maar 40, want die hangt op afstand. Dat antwoord komt op het moment
dat je het bestand kiest en niet als het al gedrukt is.

De klant ziet die opbouw op het scherm. Wie de regels optelt komt op het totaal
uit; ook de kortingsregel staat er gewoon bij.

## Wat er nog niet aan hangt

Twee dingen wachten op het schoolaccount:

- **Supabase.** De winkelwagen en de bestellingen staan nu in de browser
  (`lib/winkelwagen.ts`, `lib/bestellingen.ts`). Ze hebben bewust de vorm van
  een rij in een tabel, dus ze kunnen één op één naar Supabase zonder dat de
  pagina's veranderen.
- **De printer.** `lib/printer/status.ts` heeft de vorm van OctoPrint en
  Moonraker: voortgang, laag, temperaturen, resterende tijd. Zolang er geen
  sleutel is, rekent hij een stand uit en **zegt de pagina er zelf bij dat het
  een voorbeeld is.** Een demo die zich voordoet als echt is erger dan geen
  demo.

## Huisstijl

De kleuren komen uit Vonks eigen logo (`logo.svg` op vonknh.nl): een radiaal
verloop van amber `#f8ab21` naar magenta `#e50075`. Dat verloop is het hart van
het ontwerp, want een 3D-printer die warm filament uitspuit is diezelfde vonk.
Alles staat in `lib/merk.ts` en `app/globals.css`.

Proxima Nova is Vonks letter maar zit achter een Typekit-licentie. Figtree is
daar de dichtstbijzijnde vrije verwant van. JetBrains Mono draagt de labels en
de cijfers.

## De 3D

Drie plekken gebruiken echte 3D (React Three Fiber): de voorpagina, de
productkijker op `/ontwerpen` en de printvoortgang. Wat ze er echt uit laat zien
zit in drie bestanden:

- `components/three/Studio.tsx` bouwt een fotostudio van lichtvlakken. Plastic
  zonder omgeving heeft niets om in te weerspiegelen en blijft een vlakke kleur,
  hoeveel lampen je er ook op zet. Die studio wordt in de browser zelf gebakken,
  er gaat geen verzoek naar buiten.
- `components/three/printmateriaal.ts` legt de laaglijnen. Dat is wat een print
  een print maakt: ribbels op elke staande wand, niet op de vlakke bovenkant
  (daar legt de printer een spiraal), en ze doven uit als één laag smaller wordt
  dan een beeldpunt zodat het niet gaat ruisen.
- `components/three/Nabewerking.tsx` doet de schaduw in de naden, de gloed op de
  hete spuitmond en de tooncurve.

Wil je iets aan het licht veranderen: zet in `Studio.tsx` tijdelijk `background`
op de `<Environment>` en je ziet waar de lichtvlakken staan.

## Draaien en toetsen

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # controleert of alles compileert

npm test             # de rekenkant: STL, prijzen, banners, winkelwagen, printerstand
npx tsc --noEmit     # typecontrole
npx eslint .         # stijlcontrole
```

En met een echte browser, terwijl `npm run dev` draait:

```bash
node scripts/maak-proef-stl.mjs /tmp/proefbalkje.stl
BASIS=http://localhost:3000 node scripts/doorloop.mjs
```

`doorloop.mjs` loopt elke pagina langs, kijkt of er op een telefoon nergens
zijwaarts gescrold hoeft te worden, en gaat de hele weg af van model uploaden
tot bestelnummer. Verder staan er nog:

| Script | Wat het doet |
|---|---|
| `proef-scroll.mjs` | Schermafdrukken over de hele voorpagina, om de scroll na te kijken |
| `proef-banner.mjs` | De bannerpagina en de bestandscontrole |
| `proef-snelheid.mjs` | Hoeveel beelden per seconde de 3D haalt |
| `schiet-producten.mjs` | Maakt de productplaatjes in `public/producten/` opnieuw uit de 3D-modellen |
| `maak-deelplaatje.mjs` | Maakt `app/opengraph-image.png`, het plaatje in een gedeelde link |

Verander je een product of een kleur, draai dan `schiet-producten.mjs` opnieuw,
anders staat er een oud plaatje op de voorpagina.

## Wat je nog zou kunnen doen

- De winkelwagen en de bestellingen naar Supabase, zoals hierboven beschreven.
  De vorm staat er al op.
- Echt kunnen betalen. Nu eindigt het bestellen bij een bestelnummer.
- De printer echt aansluiten via OctoPrint of Moonraker.
- De teksten nalopen: het mailadres en het telefoonnummer in `lib/merk.ts` zijn
  die van de Printshop, controleer of ze nog kloppen.
