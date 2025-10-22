import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Impact } from '../../../types/budget'

export function useSubcategoryImpacts(subcategoryId: string) {
  return useQuery({
    queryKey: ['subcategoryImpacts', subcategoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategory_impacts')
        .select('*')
        .eq('subcategory_id', subcategoryId)
        .order('threshold_type', { ascending: true })

      if (error) throw error
      return data as Impact[]
    },
    enabled: !!subcategoryId,
  })
}

export function useSaveSubcategoryImpact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (impact: Omit<Impact, 'id' | 'created_at'>) => {
      // Check if impact already exists
      const { data: existing } = await supabase
        .from('subcategory_impacts')
        .select('id')
        .eq('subcategory_id', impact.subcategory_id)
        .eq('threshold_type', impact.threshold_type)
        .single()

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('subcategory_impacts')
          .update({ message: impact.message })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        return data as Impact
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('subcategory_impacts')
          .insert(impact)
          .select()
          .single()

        if (error) throw error
        return data as Impact
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate impacts for this subcategory
      queryClient.invalidateQueries({
        queryKey: ['subcategoryImpacts', variables.subcategory_id],
      })
      // Also invalidate budget data to get updated impacts
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteSubcategoryImpact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; subcategoryId: string }) => {
      const { error } = await supabase
        .from('subcategory_impacts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['subcategoryImpacts', variables.subcategoryId],
      })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
