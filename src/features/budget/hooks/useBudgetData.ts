import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Category, BudgetConfig } from '../../../types/budget'

export function useBudgetData() {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories (
            *,
            impacts:subcategory_impacts (*)
          )
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

  return {
    categories: categoriesQuery.data,
    config: configQuery.data,
    isLoading: categoriesQuery.isLoading || configQuery.isLoading,
    error: categoriesQuery.error || configQuery.error,
  }
}
