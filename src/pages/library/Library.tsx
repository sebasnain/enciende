import { useEffect, useState } from 'react'
import { listProducts } from '@/services/products.service'
import { getSocialSettings } from '@/services/live.service'
import type { Product } from '@/types/products'
import type { SocialSettings } from '@/types/products'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './Library.module.css'

export function Library() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [social, setSocial] = useState<SocialSettings | null>(null)

  useEffect(() => {
    listProducts().then(setProducts)
    getSocialSettings().then(setSocial)
  }, [])

  if (!products) return <Spinner />

  return (
    <div>
      <h1>Librería</h1>
      {products.length === 0 ? (
        <EmptyState message="Todavía no hay productos publicados." />
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product.id} className={`${styles.card} ${!product.available ? styles.unavailable : ''}`}>
              <img src={product.imageURL} alt={product.name} className={styles.image} />
              <div className={styles.body}>
                <p className={styles.name}>{product.name}</p>
                <p className={styles.price}>{product.priceLabel}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {social?.whatsapp && (
        <p className={styles.contact}>
          Consultas y reservas por WhatsApp:{' '}
          <a href={`https://wa.me/${social.whatsapp}`} target="_blank" rel="noreferrer">
            {social.whatsapp}
          </a>
        </p>
      )}
    </div>
  )
}
