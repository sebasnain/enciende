import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { listProducts } from '@/services/products.service'
import { getSocialSettings } from '@/services/live.service'
import { PRODUCT_CATEGORIES, type Product } from '@/types/products'
import { formatPrice } from '@/utils/price'
import { useCart } from '@/hooks/useCart'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Icon } from '@/components/ui/Icon'
import styles from './Library.module.css'

const CATEGORY_ACCENTS = ['amarillo', 'verde', 'celeste', 'rosa', 'lila'] as const

function categoryAccent(category: string): string {
  const idx = PRODUCT_CATEGORIES.indexOf(category as (typeof PRODUCT_CATEGORIES)[number])
  const color = CATEGORY_ACCENTS[(idx < 0 ? 0 : idx) % CATEGORY_ACCENTS.length]
  return `var(--highlight-${color})`
}

function whatsappHref(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

export function Library() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [whatsapp, setWhatsapp] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [cartOpen, setCartOpen] = useState(false)
  const cart = useCart()

  useEffect(() => {
    listProducts().then(setProducts)
    getSocialSettings().then((s) => setWhatsapp(s?.whatsapp ?? null))
  }, [])

  const categories = useMemo(() => {
    if (!products) return []
    const present = new Set(products.map((p) => p.category).filter(Boolean))
    return ['Todos', ...PRODUCT_CATEGORIES.filter((c) => present.has(c))]
  }, [products])

  const visibleProducts = useMemo(() => {
    if (!products) return []
    return activeCategory === 'Todos' ? products : products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  const cartProducts = useMemo(() => {
    if (!products) return []
    return cart.items.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p)
  }, [products, cart.items])

  const cartTotal = cartProducts.reduce((sum, p) => sum + (p.price || 0), 0)

  function requestPurchase() {
    if (!whatsapp || cartProducts.length === 0) return
    const lines = cartProducts.map((p) => `- ${p.name} (${formatPrice(p.price || 0)})`)
    const text = `Hola! Quiero comprar estos libros de la librería:\n\n${lines.join('\n')}\n\nTotal: ${formatPrice(cartTotal)}`
    window.open(whatsappHref(whatsapp, text), '_blank', 'noopener')
    cart.clear()
    setCartOpen(false)
  }

  if (!products) return <Spinner />

  return (
    <div className={styles.page}>
      <h1>Librería</h1>

      {products.length === 0 ? (
        <EmptyState message="Todavía no hay productos publicados." />
      ) : (
        <>
          <div className={styles.categoryRow}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryChip} ${activeCategory === category ? styles.categoryChipActive : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {visibleProducts.map((product) => {
              const inCart = cart.items.includes(product.id)
              const hasDiscount = !!product.originalPrice && product.originalPrice > product.price
              return (
                <div
                  key={product.id}
                  className={`${styles.card} ${!product.available ? styles.unavailable : ''}`}
                  style={{ '--accent': categoryAccent(product.category) } as CSSProperties}
                >
                  <div className={styles.imageWrap}>
                    <img src={product.imageURL} alt={product.name} className={styles.image} />
                    {product.category && <span className={styles.categoryBadge}>{product.category}</span>}
                  </div>
                  <div className={styles.body}>
                    <p className={styles.name}>{product.name}</p>
                    <div className={styles.priceRow}>
                      {hasDiscount && <span className={styles.originalPrice}>{formatPrice(product.originalPrice!)}</span>}
                      <span className={styles.price}>{formatPrice(product.price || 0)}</span>
                    </div>
                    <button
                      className={`${styles.addButton} ${inCart ? styles.addButtonActive : ''}`}
                      onClick={() => cart.toggle(product.id)}
                      disabled={!product.available}
                    >
                      <Icon name={inCart ? 'check-lg' : 'bag-plus'} />
                      {inCart ? 'Agregado' : product.available ? 'Agregar' : 'No disponible'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className={styles.floatingStack}>
        {cart.items.length > 0 && (
          <button className={`${styles.floatingButton} ${styles.cartButton}`} onClick={() => setCartOpen(true)} aria-label="Ver carrito">
            <Icon name="bag-fill" />
            <span className={styles.cartBadge}>{cart.items.length}</span>
          </button>
        )}
        {whatsapp && (
          <a
            className={`${styles.floatingButton} ${styles.whatsappButton}`}
            href={whatsappHref(whatsapp, 'Hola! Quería consultar sobre los libros de la librería.')}
            target="_blank"
            rel="noreferrer"
            aria-label="Consultar por WhatsApp"
          >
            <Icon name="whatsapp" />
          </a>
        )}
      </div>

      {cartOpen && (
        <Modal title="Tu carrito" onClose={() => setCartOpen(false)}>
          {cartProducts.length === 0 ? (
            <EmptyState message="Tu carrito está vacío." />
          ) : (
            <>
              <div className={styles.cartList}>
                {cartProducts.map((product) => (
                  <div key={product.id} className={styles.cartRow}>
                    <span>{product.name}</span>
                    <span className={styles.cartRowRight}>
                      {formatPrice(product.price || 0)}
                      <button className={styles.cartRemove} onClick={() => cart.remove(product.id)} aria-label={`Quitar ${product.name}`}>
                        <Icon name="x-lg" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.cartTotal}>
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <button className={styles.requestButton} onClick={requestPurchase} disabled={!whatsapp}>
                <Icon name="whatsapp" /> Solicitar compra por WhatsApp
              </button>
              {!whatsapp && <p className={styles.cartHint}>Configurá el WhatsApp de contacto en el panel de administración.</p>}
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
