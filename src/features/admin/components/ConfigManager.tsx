import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Label } from '../../../components/ui/Label'
import { formatMln } from '../../../lib/formatters'
import { useBudgetConfig, useUpdateBudgetConfig } from '../hooks/useBudgetConfig'

export function ConfigManager() {
  const { data: config, isLoading } = useBudgetConfig()
  const updateConfig = useUpdateBudgetConfig()
  const [totalIncome, setTotalIncome] = useState(0)

  useEffect(() => {
    if (config) {
      setTotalIncome(config.total_income)
    }
  }, [config])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (config) {
      updateConfig.mutate({ id: config.id, total_income: totalIncome })
    }
  }

  if (isLoading) {
    return <div className="text-slate-500">Loading configuration...</div>
  }

  if (!config) {
    return <div className="text-slate-500">No active budget configuration found</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200">
      <h2 className="text-xl font-semibold mb-4">Budget Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="income">Total Income (in smallest currency unit)</Label>
          <Input
            id="income"
            type="number"
            value={totalIncome}
            onChange={(e) => setTotalIncome(parseInt(e.target.value))}
            min="0"
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Current value: {formatMln(totalIncome)}
          </p>
        </div>

        <Button type="submit" disabled={updateConfig.isPending}>
          {updateConfig.isPending ? 'Updating...' : 'Update Configuration'}
        </Button>
      </form>
    </div>
  )
}
