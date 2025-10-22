import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import type { Subcategory } from '../../../types/budget'
import { toast } from 'sonner'

export function useCreateSubcategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (subcategory: Omit<Subcategory, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('subcategories')
        .insert(subcategory)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Subcategory created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create subcategory: ${error.message}`)
    },
  })
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subcategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('subcategories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Subcategory updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update subcategory: ${error.message}`)
    },
  })
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Subcategory deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete subcategory: ${error.message}`)
    },
  })
}
