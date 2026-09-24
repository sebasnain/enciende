const sharp = require('sharp')
const path = require('path')

const SQUARE = path.join(__dirname, '..', 'src', 'assets', 'logo', 'logo-square.png')
const CIRCLE = path.join(__dirname, '..', 'src', 'assets', 'logo', 'logo-circle.png')
const ICONS_OUT = path.join(__dirname, '..', 'public', 'icons')
const PUBLIC_OUT = path.join(__dirname, '..', 'public')
const BG = '#FFCF8F'

async function makeAny(size) {
  await sharp(SQUARE).resize(size, size).png().toFile(path.join(ICONS_OUT, `icon-${size}.png`))
}

async function makeMaskable(size) {
  const inner = Math.round(size * 0.7)
  const logo = await sharp(SQUARE).resize(inner, inner).toBuffer()

  await sharp({ create: { width: size, height: size, channels: 3, background: BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(path.join(ICONS_OUT, `icon-maskable-${size}.png`))
}

async function main() {
  for (const size of [192, 512]) {
    await makeAny(size)
    await makeMaskable(size)
  }
  await sharp(SQUARE).resize(180, 180).png().toFile(path.join(ICONS_OUT, 'apple-touch-icon.png'))
  await sharp(CIRCLE).resize(64, 64).png().toFile(path.join(PUBLIC_OUT, 'favicon.png'))
  console.log('Icons generated in', ICONS_OUT, 'and favicon in', PUBLIC_OUT)
}

main()
