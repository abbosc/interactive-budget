import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Category, BudgetConfig, BudgetPlan } from '../../../types/budget'

export function useSummaryData() {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (*)
        `)
        .order('display_order')

      if (error) throw error
      return data as Category[]
    },
  })

  const configQuery = useQuery({
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

  const plansQuery = useQuery({
    queryKey: ['budgetPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data as BudgetPlan[]
    },
  })

  return {
    categories: categoriesQuery.data,
    config: configQuery.data,
    recentPlans: plansQuery.data,
    isLoading: categoriesQuery.isLoading || configQuery.isLoading || plansQuery.isLoading,
    error: categoriesQuery.error || configQuery.error || plansQuery.error,
  }
}
