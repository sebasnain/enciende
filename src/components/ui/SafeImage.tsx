import { useEffect, useState, type ImgHTMLAttributes } from 'react'

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
<rect width="200" height="300" fill="#efe8da"/>
<g fill="none" stroke="#a89f8d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
<path d="M62 100h58a18 18 0 0 1 18 18v82a18 18 0 0 0-18-18H62z"/>
<path d="M62 100v82"/>
</g>
<text x="100" y="236" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#a89f8d">Imagen no disponible</text>
</svg>`

export const IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`

/** <img> que muestra un "imagen no disponible" prolijo si la URL está rota. */
export function SafeImage({ src, onError, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  return (
    <img
      {...rest}
      src={failed || !src ? IMAGE_PLACEHOLDER : src}
      onError={(e) => {
        setFailed(true)
        onError?.(e)
      }}
    />
  )
}
