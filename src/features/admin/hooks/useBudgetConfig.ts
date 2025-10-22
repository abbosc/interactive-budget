import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { BudgetConfig } from '../../../types/budget'
import { toast } from 'sonner'

export function useBudgetConfig() {
  return useQuery({
    queryKey: ['budgetConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_config')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data as BudgetConfig
    },
  })
}

export function useUpdateBudgetConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, total_income }: { id: string; total_income: number }) => {
      const { data, error } = await supabase
        .from('budget_config')
        .update({ total_income })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetConfig'] })
      toast.success('Budget configuration updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update config: ${error.message}`)
    },
  })
}
