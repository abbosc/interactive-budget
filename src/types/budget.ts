export type ThresholdType = 'increase_3' | 'increase_7' | 'decrease_3' | 'decrease_7'

export interface Impact {
  id: string
  subcategory_id: string
  threshold_type: ThresholdType
  message: string
  created_at?: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  default_value: number
  created_at?: string
  impacts?: Impact[]
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  display_order: number
  created_at?: string
  subcategories?: Subcategory[]
}

export interface BudgetConfig {
  id: string
  total_income: number
  is_active: boolean
  created_at?: string
}

export interface BudgetPlan {
  id: string
  budget_config_id?: string
  user_name?: string
  user_age?: number
  user_occupation?: string
  changes: Record<string, number> // {subcategoryId: changeValue}
  total_income: number
  total_expenses: number
  deficit: number
  created_at?: string
}

export interface BudgetChanges {
  [subcategoryId: string]: number
}
