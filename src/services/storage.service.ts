import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { app } from '@/firebase/config'

const MAX_SIDE = 1600
const JPEG_QUALITY = 0.85

/** Achica la imagen (lado mayor 1600px) y la pasa a JPEG para que pese poco. */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la imagen.')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen.'))), 'image/jpeg', JPEG_QUALITY),
  )
}

/** Sube una imagen a Storage y devuelve su URL pública. */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('El archivo tiene que ser una imagen.')
  const blob = await compressImage(file)
  const fileRef = ref(getStorage(app), `uploads/${crypto.randomUUID()}.jpg`)
  await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(fileRef)
}
