import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { BudgetPlan } from '../../../types/budget'

export function useBudgetPlans() {
  return useQuery({
    queryKey: ['budgetPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as BudgetPlan[]
    },
  })
}

export function useBudgetPlan(id: string) {
  return useQuery({
    queryKey: ['budgetPlan', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as BudgetPlan
    },
    enabled: !!id,
  })
}

export function useDeleteBudgetPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Starting delete mutation for plan ID:', id)

      const { data, error } = await supabase
        .from('budget_plans')
        .delete()
        .eq('id', id)
        .select()

      console.log('🗑️ Delete response:', { data, error })

      if (error) {
        console.error('🗑️ Delete error:', error)
        throw error
      }

      // Check if any rows were actually deleted
      if (!data || data.length === 0) {
        console.error('🗑️ No rows were deleted! This could be an RLS policy issue.')
        throw new Error('Failed to delete: No rows affected. Check Supabase RLS policies.')
      }

      console.log('🗑️ Delete successful, deleted rows:', data)
      return data
    },
    onSuccess: (data, id) => {
      console.log('🗑️ onSuccess called, invalidating queries for plan:', id)
      // Invalidate and refetch budget plans list
      queryClient.invalidateQueries({ queryKey: ['budgetPlans'] })
      console.log('🗑️ Queries invalidated')
    },
    onError: (error, id) => {
      console.error('🗑️ onError called for plan:', id, 'Error:', error)
    },
  })
}
