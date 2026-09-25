import { useEffect, useRef, useState } from 'react'
import { deleteLesson, listLessons, setLesson } from '@/services/lessons.service'
import { useBooks } from '@/hooks/useBooks'
import type { StudyLesson } from '@/types/content'
import { Button } from '@/components/ui/Button'
import styles from '@/components/admin/AdminCrudPage.module.css'

interface LessonsEditorProps {
  studyId: string
}

export function LessonsEditor({ studyId }: LessonsEditorProps) {
  const [lessons, setLessons] = useState<StudyLesson[]>([])
  const [editingOrder, setEditingOrder] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [refBook, setRefBook] = useState(43)
  const [refChapter, setRefChapter] = useState(1)
  const [refVerseStart, setRefVerseStart] = useState('')
  const [refVerseEnd, setRefVerseEnd] = useState('')
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const books = useBooks('NVI')

  async function reload() {
    setLessons(await listLessons(studyId))
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyId])

  function resetForm() {
    setEditingOrder(null)
    setTitle('')
    setBody('')
  }

  function startEdit(lesson: StudyLesson) {
    setEditingOrder(lesson.order)
    setTitle(lesson.title)
    setBody(lesson.body)
  }

  async function handleSave() {
    const order = editingOrder ?? (lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1)
    await setLesson(studyId, order, { title, body })
    await reload()
    resetForm()
  }

  async function handleDelete(order: number) {
    await deleteLesson(studyId, order)
    await reload()
    if (editingOrder === order) resetForm()
  }

  function insertVerseToken() {
    const bookName = books.find((b) => b.bookid === refBook)?.name ?? ''
    const verses = refVerseStart ? `:${refVerseStart}${refVerseEnd ? `-${refVerseEnd}` : ''}` : ''
    const token = `[[${bookName} ${refChapter}${verses}]]`

    const el = bodyRef.current
    if (!el) {
      setBody((b) => b + token)
      return
    }
    const start = el.selectionStart ?? body.length
    const end = el.selectionEnd ?? body.length
    const next = body.slice(0, start) + token + body.slice(end)
    setBody(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  return (
    <div style={{ marginTop: 8 }}>
      {lessons.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {lessons.map((lesson) => (
            <div key={lesson.id} className={styles.row}>
              <span>
                Lección {lesson.order}: {lesson.title}
              </span>
              <span className={styles.rowActions}>
                <button type="button" className={styles.link} onClick={() => startEdit(lesson)}>
                  Editar
                </button>
                <button type="button" className={styles.link} onClick={() => handleDelete(lesson.order)}>
                  Eliminar
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.form}>
        <p className={editingOrder !== null ? styles.modeEdit : styles.modeNew}>
          {editingOrder !== null ? `Editando lección ${editingOrder}` : 'Nueva lección'}
        </p>
        <label>
          <span>Título de la lección</span>
          <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: La fe que agrada a Dios" />
        </label>
        <label>
          <span>Contenido</span>
          <textarea
            ref={bodyRef}
            className={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escribí el texto de la lección. Separá párrafos con una línea en blanco."
            style={{ minHeight: 160 }}
          />
        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ flex: '1 1 160px' }}>
            <span>Libro</span>
            <select className={styles.input} value={refBook} onChange={(e) => setRefBook(Number(e.target.value))}>
              {books.map((b) => (
                <option key={b.bookid} value={b.bookid}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ width: 70 }}>
            <span>Cap.</span>
            <input className={styles.input} type="number" min={1} value={refChapter} onChange={(e) => setRefChapter(Number(e.target.value))} />
          </label>
          <label style={{ width: 80 }}>
            <span>Vers. (opc.)</span>
            <input className={styles.input} type="number" min={1} value={refVerseStart} onChange={(e) => setRefVerseStart(e.target.value)} />
          </label>
          <label style={{ width: 80 }}>
            <span>a (opc.)</span>
            <input className={styles.input} type="number" min={1} value={refVerseEnd} onChange={(e) => setRefVerseEnd(e.target.value)} />
          </label>
          <Button type="button" variant="secondary" onClick={insertVerseToken}>
            Insertar versículo
          </Button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-ink-400)', margin: 0 }}>
          El botón inserta la referencia en el cursor del texto; al leer el estudio queda como link directo a la Biblia.
        </p>

        <div className={styles.formActions}>
          <Button type="button" onClick={handleSave} disabled={!title.trim()}>
            {editingOrder !== null ? 'Guardar lección' : 'Agregar lección'}
          </Button>
          {editingOrder !== null && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
