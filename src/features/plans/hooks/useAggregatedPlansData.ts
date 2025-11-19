import { useMemo } from 'react'
import { useBudgetPlans } from './useBudgetPlans'
import { useCategories } from '../../admin/hooks/useCategories'

export interface SubcategoryAggregation {
  subcategoryId: string
  subcategoryName: string
  defaultValue: number
  totalChange: number
  percentChange: number
  participantCount: number
  categoryColor: string
}

export interface CategoryAggregation {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  subcategories: SubcategoryAggregation[]
}

export interface AggregatedPlansData {
  totalPlans: number
  totalParticipants: number
  originalIncome: number
  proposedIncome: number
  incomeChange: number
  originalExpenses: number
  proposedExpenses: number
  expensesChange: number
  originalDeficit: number
  proposedDeficit: number
  deficitChange: number
  categories: CategoryAggregation[]
}

export function useAggregatedPlansData() {
  const { data: plans, isLoading: plansLoading, error: plansError } = useBudgetPlans()
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()

  const aggregatedData = useMemo<AggregatedPlansData | null>(() => {
    if (!plans || !categories) return null

    // Calculate original values from first plan or config
    const firstPlan = plans[0]
    if (!firstPlan) {
      return {
        totalPlans: 0,
        totalParticipants: 0,
        originalIncome: 0,
        proposedIncome: 0,
        incomeChange: 0,
        originalExpenses: 0,
        proposedExpenses: 0,
        expensesChange: 0,
        originalDeficit: 0,
        proposedDeficit: 0,
        deficitChange: 0,
        categories: [],
      }
    }

    // Get default values from subcategories
    const subcategoryDefaults = new Map<string, number>()
    categories.forEach((category) => {
      category.subcategories?.forEach((subcat) => {
        subcategoryDefaults.set(subcat.id, subcat.default_value)
      })
    })

    // Calculate original totals
    let originalExpenses = 0
    subcategoryDefaults.forEach((value) => {
      originalExpenses += value
    })

    // Use first plan's income as baseline (assuming it's constant)
    const originalIncome = firstPlan.total_income
    const originalDeficit = originalIncome - originalExpenses

    // Aggregate changes across all plans
    const subcategoryChanges = new Map<string, { totalChange: number; count: number }>()

    plans.forEach((plan) => {
      Object.entries(plan.changes).forEach(([subcategoryId, newValue]) => {
        const defaultValue = subcategoryDefaults.get(subcategoryId) || 0
        const change = newValue - defaultValue

        if (!subcategoryChanges.has(subcategoryId)) {
          subcategoryChanges.set(subcategoryId, { totalChange: 0, count: 0 })
        }

        const current = subcategoryChanges.get(subcategoryId)!
        current.totalChange += change
        current.count += 1
      })
    })

    // Calculate proposed totals
    let proposedExpenses = originalExpenses
    subcategoryChanges.forEach((changeData) => {
      proposedExpenses += changeData.totalChange
    })

    const proposedIncome = originalIncome // Income stays same
    const proposedDeficit = proposedIncome - proposedExpenses

    // Build category aggregations
    const categoryAggregations: CategoryAggregation[] = categories.map((category) => {
      const subcatAggs: SubcategoryAggregation[] =
        category.subcategories?.map((subcat) => {
          const changeData = subcategoryChanges.get(subcat.id)
          const totalChange = changeData?.totalChange || 0
          const participantCount = changeData?.count || 0
          const percentChange = subcat.default_value > 0 ? (totalChange / subcat.default_value) * 100 : 0

          return {
            subcategoryId: subcat.id,
            subcategoryName: subcat.name,
            defaultValue: subcat.default_value,
            totalChange,
            percentChange,
            participantCount,
            categoryColor: category.color,
          }
        }) || []

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
        subcategories: subcatAggs,
      }
    })

    return {
      totalPlans: plans.length,
      totalParticipants: new Set(plans.map((p) => p.user_name || 'anonymous')).size,
      originalIncome,
      proposedIncome,
      incomeChange: proposedIncome - originalIncome,
      originalExpenses,
      proposedExpenses,
      expensesChange: proposedExpenses - originalExpenses,
      originalDeficit,
      proposedDeficit,
      deficitChange: proposedDeficit - originalDeficit,
      categories: categoryAggregations,
    }
  }, [plans, categories])

  return {
    data: aggregatedData,
    isLoading: plansLoading || categoriesLoading,
    error: plansError || categoriesError,
  }
}
