import { Navigate } from 'react-router-dom'
import { useBiblePosition } from '@/context/BibleContext'

export function BibleIndexRedirect() {
  const { position } = useBiblePosition()
  return <Navigate to={`/biblia/${position.translation}/${position.book}/${position.chapter}`} replace />
}
