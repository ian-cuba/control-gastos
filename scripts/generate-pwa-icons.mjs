import sharp from "sharp"
import { mkdir, readFile } from "fs/promises"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const svgPath = join(root, "public", "gastometro-icon.svg")
const outDir = join(root, "public")

const svg = await readFile(svgPath)

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-icon.png", size: 180 },
  { name: "icon-light-32x32.png", size: 32 },
  { name: "icon-dark-32x32.png", size: 32 },
]

await mkdir(outDir, { recursive: true })

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(outDir, name))
  console.log(`Generated ${name} (${size}x${size})`)
}
