import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '@/firebase/config'
import { Button } from '@/components/ui/Button'
import styles from './AuthForm.module.css'

export function ForgotPassword() {
  const location = useLocation()
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? '')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      auth.languageCode = 'es'
      await sendPasswordResetEmail(auth, email.trim(), { url: `${window.location.origin}/login` })
      setSentTo(email.trim())
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : ''
      // Same answer whether or not the account exists, so this form can't be used to find out
      // which emails are registered.
      if (code === 'auth/user-not-found') setSentTo(email.trim())
      else if (code === 'auth/invalid-email') setError('Ese correo no es válido.')
      else if (code === 'auth/too-many-requests') setError('Hiciste muchos intentos. Esperá unos minutos y probá de nuevo.')
      else setError('No pudimos enviar el correo. Revisá tu conexión y probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (sentTo) {
    return (
      <div className={styles.form}>
        <h1 className={styles.title}>Revisá tu correo</h1>
        <p className={styles.info}>
          Si <strong>{sentTo}</strong> tiene una cuenta, te enviamos un enlace para crear una contraseña nueva. Revisá también la carpeta de
          spam o correo no deseado.
        </p>
        <p className={styles.switch}>
          <Link to="/login">Volver a ingresar</Link>
        </p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Recuperar contraseña</h1>
      <p className={styles.info}>Escribí el correo con el que te registraste y te enviamos un enlace para crear una contraseña nueva.</p>
      <input
        className={styles.input}
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />
      {error && <p className={styles.error}>{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Enviando…' : 'Enviar enlace'}
      </Button>
      <p className={styles.switch}>
        <Link to="/login">Volver a ingresar</Link>
      </p>
    </form>
  )
}
