import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '@/firebase/config'
import { useAuth } from '@/context/AuthContext'
import { StreakFlame } from '@/components/streak/StreakFlame'
import { ShareApp } from '@/components/profile/ShareApp'
import { Button } from '@/components/ui/Button'
import { buildLabel, forceAppUpdate } from '@/utils/appUpdate'
import styles from './Profile.module.css'

export function Profile() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(false)

  if (!profile) return null

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  function handleUpdate() {
    setUpdating(true)
    forceAppUpdate()
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.name}>{profile.displayName}</h1>
      <p className={styles.email}>{profile.email}</p>

      <div className={styles.streakBox}>
        <StreakFlame streak={profile.streak.current} size={48} />
        <span className={styles.streakLabel}>Racha actual — récord: {profile.streak.longest} días</span>
      </div>

      <ShareApp />

      {profile.role === 'admin' && <Button variant="secondary" onClick={() => navigate('/admin')}>Panel de administración</Button>}
      <Button variant="ghost" onClick={handleLogout}>
        Cerrar sesión
      </Button>

      <p className={styles.version}>
        Versión del {buildLabel()} ·{' '}
        <button type="button" className={styles.updateLink} onClick={handleUpdate} disabled={updating}>
          {updating ? 'Actualizando…' : 'Buscar actualización'}
        </button>
      </p>
    </div>
  )
}
