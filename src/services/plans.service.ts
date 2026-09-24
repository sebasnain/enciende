import {
  addDoc,
  collection,
  deleteDoc,
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

export async function addPlanDay(planId: string, day: Omit<ReadingPlanDay, 'id'>) {
  const daysRef = collection(db, 'plans', planId, 'days')
  await addDoc(daysRef, day)
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

export async function markDayComplete(uid: string, planId: string, dayId: string) {
  await setDoc(
    progressRef(uid, planId),
    { completedDayIds: { [dayId]: true }, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
