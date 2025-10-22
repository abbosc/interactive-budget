import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Label } from '../../../components/ui/Label'
import { formatMln } from '../../../lib/formatters'
import type { Subcategory } from '../../../types/budget'

interface SubcategoryFormProps {
  categoryId: string
  subcategory?: Subcategory
  onSubmit: (data: Omit<Subcategory, 'id' | 'created_at'>) => void
  onCancel: () => void
}

export function SubcategoryForm({
  categoryId,
  subcategory,
  onSubmit,
  onCancel
}: SubcategoryFormProps) {
  const [name, setName] = useState(subcategory?.name || '')
  const [defaultValue, setDefaultValue] = useState(
    subcategory?.default_value || 10000000000
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      category_id: categoryId,
      name,
      default_value: defaultValue,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Subcategory Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yangi kichik toifa"
          required
        />
      </div>

      <div>
        <Label htmlFor="value">Default Value (in smallest currency unit)</Label>
        <Input
          id="value"
          type="number"
          value={defaultValue}
          onChange={(e) => setDefaultValue(parseInt(e.target.value))}
          min="0"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Current value: {formatMln(defaultValue)}
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {subcategory ? 'Update' : 'Create'} Subcategory
        </Button>
      </div>
    </form>
  )
}
