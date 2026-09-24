import { useEffect, useState } from 'react'
import { listPublishedPlans } from '@/services/plans.service'
import type { ReadingPlan } from '@/types/plans'
import { ListCard } from '@/components/ui/ListCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function PlanList() {
  const [plans, setPlans] = useState<ReadingPlan[] | null>(null)

  useEffect(() => {
    listPublishedPlans().then(setPlans)
  }, [])

  if (!plans) return <Spinner />
  if (plans.length === 0) return <EmptyState message="Todavía no hay planes de lectura publicados." />

  return (
    <div>
      <h1>Planes de lectura</h1>
      {plans.map((plan) => (
        <ListCard
          key={plan.id}
          to={`/planes/${plan.id}`}
          title={plan.title}
          subtitle={`${plan.durationDays} días · ${plan.category}`}
          coverImage={plan.coverImage}
        />
      ))}
    </div>
  )
}
