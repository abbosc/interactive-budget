import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Label } from '../../../components/ui/Label'
import type { Category } from '../../../types/budget'

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: Omit<Category, 'id' | 'created_at'>) => void
  onCancel: () => void
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '')
  const [icon, setIcon] = useState(category?.icon || '&#xf0a3;')
  const [color, setColor] = useState(category?.color || '#2ecc71')
  const [displayOrder, setDisplayOrder] = useState(category?.display_order || 1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      icon,
      color,
      display_order: displayOrder,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ma'orif"
          required
        />
      </div>

      <div>
        <Label htmlFor="icon">Icon (HTML entity)</Label>
        <Input
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="&#xf0a3;"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Font Awesome HTML entity code
        </p>
      </div>

      <div>
        <Label htmlFor="color">Color (hex)</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#2ecc71"
            required
          />
          <div
            className="w-10 h-10 rounded border"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="order">Display Order</Label>
        <Input
          id="order"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
          min="1"
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {category ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  )
}
