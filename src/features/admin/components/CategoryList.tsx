import { useState } from 'react'
import { Pencil, Trash2, Plus, AlertCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { CategoryForm } from './CategoryForm'
import { SubcategoryForm } from './SubcategoryForm'
import { SubcategoryImpactEditor } from './SubcategoryImpactEditor'
import { formatMln } from '../../../lib/formatters'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories'
import {
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from '../hooks/useSubcategories'
import type { Category, Subcategory } from '../../../types/budget'

export function CategoryList() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const createSubcategory = useCreateSubcategory()
  const updateSubcategory = useUpdateSubcategory()
  const deleteSubcategory = useDeleteSubcategory()

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: string
    subcategory?: Subcategory
  } | null>(null)
  const [impactEditorOpen, setImpactEditorOpen] = useState<string | null>(null)

  const handleCreateCategory = (data: Omit<Category, 'id' | 'created_at'>) => {
    createCategory.mutate(data, {
      onSuccess: () => {
        setShowCategoryForm(false)
      },
    })
  }

  const handleUpdateCategory = (data: Omit<Category, 'id' | 'created_at'>) => {
    if (editingCategory) {
      updateCategory.mutate(
        { ...data, id: editingCategory.id },
        {
          onSuccess: () => {
            setEditingCategory(null)
          },
        }
      )
    }
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category? All subcategories will be deleted.')) {
      deleteCategory.mutate(id)
    }
  }

  const handleCreateSubcategory = (data: Omit<Subcategory, 'id' | 'created_at'>) => {
    createSubcategory.mutate(data, {
      onSuccess: () => {
        setEditingSubcategory(null)
      },
    })
  }

  const handleUpdateSubcategory = (data: Omit<Subcategory, 'id' | 'created_at'>) => {
    if (editingSubcategory?.subcategory) {
      updateSubcategory.mutate(
        { ...data, id: editingSubcategory.subcategory.id },
        {
          onSuccess: () => {
            setEditingSubcategory(null)
          },
        }
      )
    }
  }

  const handleDeleteSubcategory = (id: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      deleteSubcategory.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="text-slate-500">Loading categories...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories & Subcategories</h2>
        <Button onClick={() => setShowCategoryForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {showCategoryForm && (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-medium mb-4">Create New Category</h3>
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={() => setShowCategoryForm(false)}
          />
        </div>
      )}

      {editingCategory && (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-medium mb-4">Edit Category</h3>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleUpdateCategory}
            onCancel={() => setEditingCategory(null)}
          />
        </div>
      )}

      {editingSubcategory && (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-medium mb-4">
            {editingSubcategory.subcategory ? 'Edit' : 'Create'} Subcategory
          </h3>
          <SubcategoryForm
            categoryId={editingSubcategory.categoryId}
            subcategory={editingSubcategory.subcategory}
            onSubmit={
              editingSubcategory.subcategory
                ? handleUpdateSubcategory
                : handleCreateSubcategory
            }
            onCancel={() => setEditingSubcategory(null)}
          />
        </div>
      )}

      <div className="space-y-4">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="bg-white p-6 rounded-lg border border-slate-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: category.color, fontFamily: 'FontAwesome' }}
                  dangerouslySetInnerHTML={{ __html: category.icon }}
                />
                <div>
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <p className="text-sm text-slate-500">
                    Order: {category.display_order}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingCategory(category)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-slate-700">
                  Subcategories:
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditingSubcategory({ categoryId: category.id })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subcategory
                </Button>
              </div>

              {category.subcategories && category.subcategories.length > 0 ? (
                <div className="space-y-2">
                  {category.subcategories.map((sub) => (
                    <div key={sub.id} className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-sm text-slate-500">
                            Default: {formatMln(sub.default_value)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={impactEditorOpen === sub.id ? 'default' : 'ghost'}
                            onClick={() =>
                              setImpactEditorOpen(
                                impactEditorOpen === sub.id ? null : sub.id
                              )
                            }
                            title="Manage impact messages"
                          >
                            <AlertCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingSubcategory({
                                categoryId: category.id,
                                subcategory: sub,
                              })
                            }
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSubcategory(sub.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {impactEditorOpen === sub.id && (
                        <SubcategoryImpactEditor
                          subcategoryId={sub.id}
                          subcategoryName={sub.name}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No subcategories yet
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
