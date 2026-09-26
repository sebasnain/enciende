import { Outlet } from 'react-router-dom'
import { TopNav } from './TopNav'
import { BottomNav } from './BottomNav'
import { LiveBanner } from './LiveBanner'
import { LibraryReminderBanner } from './LibraryReminderBanner'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <TopNav />
      <LiveBanner />
      <LibraryReminderBanner />
      <main className={styles.content}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
