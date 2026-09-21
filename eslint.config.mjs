import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Three Fiber werkt per ontwerp door objecten in de tekenlus aan te
    // passen: je zet camera.position.y, niet camera = nieuweCamera. De regel
    // react-hooks/immutability ziet dat als een fout, maar het is precies hoe
    // R3F bedoeld is; een kopie per frame maken zou zestig keer per seconde de
    // hele scene opnieuw opbouwen. Alleen hier uit, nergens anders.
    files: ["components/three/**/*.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
