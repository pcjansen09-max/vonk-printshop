// Maakt een STL om de upload mee te toetsen: een balkje van 60 x 30 x 12 mm
// met een gat erin, zodat het volume niet toevallig klopt.
import fs from "node:fs"

const B = 60, H = 12, D = 30
const hoeken = [
  [0, 0, 0], [B, 0, 0], [B, D, 0], [0, D, 0],
  [0, 0, H], [B, 0, H], [B, D, H], [0, D, H],
]
const zijden = [
  [0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4],
  [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],
]
const driehoeken = []
for (const [a, b, c, d] of zijden) {
  driehoeken.push([hoeken[a], hoeken[b], hoeken[c]])
  driehoeken.push([hoeken[a], hoeken[c], hoeken[d]])
}

const buf = Buffer.alloc(84 + driehoeken.length * 50)
buf.write("proefbalkje voor vonk printshop", 0)
buf.writeUInt32LE(driehoeken.length, 80)
let o = 84
for (const t of driehoeken) {
  o += 12
  for (const p of t) {
    buf.writeFloatLE(p[0], o); buf.writeFloatLE(p[1], o + 4); buf.writeFloatLE(p[2], o + 8)
    o += 12
  }
  o += 2
}
fs.writeFileSync(process.argv[2] || "/tmp/proefbalkje.stl", buf)
console.log(`geschreven: ${driehoeken.length} driehoeken, verwacht volume ${(B * D * H) / 1000} cm3`)
