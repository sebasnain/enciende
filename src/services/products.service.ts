import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Product } from '@/types/products'

const productsRef = collection(db, 'products')

export async function listProducts(): Promise<Product[]> {
  const snap = await getDocs(productsRef)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product)
}

export async function createProduct(product: Omit<Product, 'id'>) {
  await addDoc(productsRef, product)
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  await updateDoc(doc(productsRef, id), patch)
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(productsRef, id))
}
