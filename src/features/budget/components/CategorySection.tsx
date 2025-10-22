import { SubcategoryCard } from './SubcategoryCard'
import type { Category } from '../../../types/budget'

interface CategorySectionProps {
  category: Category
}

export function CategorySection({ category }: CategorySectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
          style={{ backgroundColor: category.color, fontFamily: 'FontAwesome' }}
          dangerouslySetInnerHTML={{ __html: category.icon }}
        />
        <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
      </div>

      <div className="grid gap-4">
        {category.subcategories?.map((subcategory) => (
          <SubcategoryCard key={subcategory.id} subcategory={subcategory} />
        ))}
        {(!category.subcategories || category.subcategories.length === 0) && (
          <p className="text-slate-500 italic">No subcategories available</p>
        )}
      </div>
    </div>
  )
}
