import { useMutation } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { BudgetPlan } from '../../../types/budget'
import { toast } from 'sonner'

export function useSaveBudgetPlan() {
  return useMutation({
    mutationFn: async (plan: Omit<BudgetPlan, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('budget_plans')
        .insert(plan)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Budget plan saved successfully')
    },
    onError: (error) => {
      toast.error(`Failed to save budget plan: ${error.message}`)
    },
  })
}
