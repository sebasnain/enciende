const sharp = require('sharp')
const path = require('path')

const SRC = path.join(__dirname, '..', 'src', 'assets', 'logo', 'enciende-logo.png')
const OUT = path.join(__dirname, '..', 'public', 'icons')
const BG = '#FFCF8F'

async function makeAny(size) {
  await sharp(SRC)
    .resize(size, size, { fit: 'contain', background: BG })
    .png()
    .toFile(path.join(OUT, `icon-${size}.png`))
}

async function makeMaskable(size) {
  const inner = Math.round(size * 0.6)
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: BG })
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 3, background: BG },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(OUT, `icon-maskable-${size}.png`))
}

async function main() {
  for (const size of [192, 512]) {
    await makeAny(size)
    await makeMaskable(size)
  }
  await sharp(SRC).resize(180, 180, { fit: 'contain', background: BG }).png().toFile(path.join(OUT, 'apple-touch-icon.png'))
  console.log('Icons generated in', OUT)
}

main()
