import { create } from 'zustand'
import type { BudgetChanges } from '../types/budget'

interface BudgetStore {
  changes: BudgetChanges
  setChange: (subcategoryId: string, value: number) => void
  removeChange: (subcategoryId: string) => void
  clearChanges: () => void
  getTotalChange: () => number
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  changes: {},

  setChange: (subcategoryId, value) =>
    set((state) => ({
      changes: { ...state.changes, [subcategoryId]: value }
    })),

  removeChange: (subcategoryId) =>
    set((state) => {
      const newChanges = { ...state.changes }
      delete newChanges[subcategoryId]
      return { changes: newChanges }
    }),

  clearChanges: () => set({ changes: {} }),

  getTotalChange: () => {
    const { changes } = get()
    return Object.values(changes).reduce((sum, val) => sum + val, 0)
  },
}))
