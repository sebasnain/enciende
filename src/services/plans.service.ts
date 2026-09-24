import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { PlanProgress, ReadingPlan, ReadingPlanDay } from '@/types/plans'

const plansRef = collection(db, 'plans')

export async function listPublishedPlans(): Promise<ReadingPlan[]> {
  const q = query(plansRef, where('published', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReadingPlan)
}

export async function getPlan(planId: string): Promise<ReadingPlan | null> {
  const snap = await getDoc(doc(plansRef, planId))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ReadingPlan) : null
}

export async function listPlanDays(planId: string): Promise<ReadingPlanDay[]> {
  const daysRef = collection(db, 'plans', planId, 'days')
  const snap = await getDocs(query(daysRef, orderBy('order')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReadingPlanDay)
}

export async function createPlan(plan: Omit<ReadingPlan, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(plansRef, { ...plan, createdAt: serverTimestamp() })
  return docRef.id
}

export async function updatePlan(planId: string, patch: Partial<ReadingPlan>) {
  await updateDoc(doc(plansRef, planId), patch)
}

export async function deletePlan(planId: string) {
  await deleteDoc(doc(plansRef, planId))
}

export async function setPlanDay(planId: string, order: number, day: Omit<ReadingPlanDay, 'id' | 'order'>) {
  const dayRef = doc(db, 'plans', planId, 'days', String(order))
  await setDoc(dayRef, { ...day, order })
}

function progressRef(uid: string, planId: string) {
  return doc(db, 'users', uid, 'planProgress', planId)
}

export async function getPlanProgress(uid: string, planId: string): Promise<PlanProgress | null> {
  const snap = await getDoc(progressRef(uid, planId))
  return snap.exists() ? (snap.data() as PlanProgress) : null
}

export async function enrollInPlan(uid: string, planId: string) {
  await setDoc(
    progressRef(uid, planId),
    { planId, enrolledAt: serverTimestamp(), completedDayIds: {}, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function setDayComplete(uid: string, planId: string, dayId: string, complete: boolean) {
  await updateDoc(progressRef(uid, planId), {
    [`completedDayIds.${dayId}`]: complete ? true : deleteField(),
    updatedAt: serverTimestamp(),
  })
}

export interface ActivePlanProgress {
  plan: ReadingPlan
  progress: PlanProgress
}

export async function getActivePlanProgress(uid: string): Promise<ActivePlanProgress | null> {
  const progressCollectionRef = collection(db, 'users', uid, 'planProgress')
  const snap = await getDocs(query(progressCollectionRef, orderBy('updatedAt', 'desc')))
  if (snap.empty) return null

  const progress = snap.docs[0].data() as PlanProgress
  const plan = await getPlan(progress.planId)
  return plan ? { plan, progress } : null
}
