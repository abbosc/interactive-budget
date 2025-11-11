import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Save, AlertCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { useSubcategoryImpacts, useSaveSubcategoryImpact } from '../hooks/useSubcategoryImpacts'
import type { ThresholdType } from '../../../types/budget'
import { toast } from 'sonner'

interface SubcategoryImpactEditorProps {
  subcategoryId: string
  subcategoryName: string
}

interface ImpactFormData {
  increase_3: string
  increase_7: string
  decrease_3: string
  decrease_7: string
}

const THRESHOLD_LABELS: Record<ThresholdType, string> = {
  increase_3: '+3% natijasi',
  increase_7: '+7% natijasi',
  decrease_3: '-3% natijasi',
  decrease_7: '-7% natijasi',
}

const THRESHOLD_DESCRIPTIONS: Record<ThresholdType, string> = {
  increase_3: 'Byudjet 3% oshganda nima yuz beradi?',
  increase_7: 'Byudjet 7% oshganda nima yuz beradi?',
  decrease_3: 'Byudjet 3% kamaysa nima yo\'qotiladi?',
  decrease_7: 'Byudjet 7% kamaysa nima yo\'qotiladi?',
}

export function SubcategoryImpactEditor({ subcategoryId, subcategoryName }: SubcategoryImpactEditorProps) {
  const { data: impacts, isLoading } = useSubcategoryImpacts(subcategoryId)
  const saveImpact = useSaveSubcategoryImpact()

  const [formData, setFormData] = useState<ImpactFormData>({
    increase_3: '',
    increase_7: '',
    decrease_3: '',
    decrease_7: '',
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (impacts) {
      const newFormData: ImpactFormData = {
        increase_3: '',
        increase_7: '',
        decrease_3: '',
        decrease_7: '',
      }

      impacts.forEach((impact) => {
        newFormData[impact.threshold_type] = impact.message
      })

      setFormData(newFormData)
      setHasChanges(false)
    }
  }, [impacts])

  const handleChange = (thresholdType: ThresholdType, value: string) => {
    setFormData((prev) => ({ ...prev, [thresholdType]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const thresholdTypes: ThresholdType[] = ['increase_3', 'increase_7', 'decrease_3', 'decrease_7']

      for (const thresholdType of thresholdTypes) {
        const message = formData[thresholdType]
        if (message.trim()) {
          await saveImpact.mutateAsync({
            subcategory_id: subcategoryId,
            threshold_type: thresholdType,
            message: message.trim(),
          })
        }
      }

      toast.success('Ta\'sir xabarlari saqlandi')
      setHasChanges(false)
    } catch (error) {
      toast.error('Xatolik yuz berdi')
      console.error('Error saving impacts:', error)
    }
  }

  if (isLoading) {
    return <div className="p-4 text-sm text-slate-500">Yuklanmoqda...</div>
  }

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Ta'sir xabarlari</h3>
          <p className="text-xs text-slate-500 mt-1">{subcategoryName}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveImpact.isPending}
          size="sm"
        >
          <Save className="w-4 h-4 mr-2" />
          Saqlash
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Increase thresholds */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary-dark">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Oshirish</span>
          </div>

          <div className="space-y-2">
            <label className="block">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-700">
                  {THRESHOLD_LABELS.increase_3}
                </span>
                <span className="text-xs text-slate-500">
                  ({THRESHOLD_DESCRIPTIONS.increase_3})
                </span>
              </div>
              <textarea
                value={formData.increase_3}
                onChange={(e) => handleChange('increase_3', e.target.value)}
                placeholder="Masalan: 2 ta yangi bog'cha ochish mumkin"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={2}
              />
            </label>

            <label className="block">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-700">
                  {THRESHOLD_LABELS.increase_7}
                </span>
                <span className="text-xs text-slate-500">
                  ({THRESHOLD_DESCRIPTIONS.increase_7})
                </span>
              </div>
              <textarea
                value={formData.increase_7}
                onChange={(e) => handleChange('increase_7', e.target.value)}
                placeholder="Masalan: 5 ta yangi bog'cha, maoshlarni 15% oshirish"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={2}
              />
            </label>
          </div>
        </div>

        {/* Decrease thresholds */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-700">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">Kamaytirish</span>
          </div>

          <div className="space-y-2">
            <label className="block">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-700">
                  {THRESHOLD_LABELS.decrease_3}
                </span>
                <span className="text-xs text-slate-500">
                  ({THRESHOLD_DESCRIPTIONS.decrease_3})
                </span>
              </div>
              <textarea
                value={formData.decrease_3}
                onChange={(e) => handleChange('decrease_3', e.target.value)}
                placeholder="Masalan: 1 ta bog'chani yopish kerak bo'ladi"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={2}
              />
            </label>

            <label className="block">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-700">
                  {THRESHOLD_LABELS.decrease_7}
                </span>
                <span className="text-xs text-slate-500">
                  ({THRESHOLD_DESCRIPTIONS.decrease_7})
                </span>
              </div>
              <textarea
                value={formData.decrease_7}
                onChange={(e) => handleChange('decrease_7', e.target.value)}
                placeholder="Masalan: 3 ta bog'chani yopish, 100 ta o'qituvchini ishdan bo'shatish"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={2}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-primary-light/10 rounded-md">
        <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-xs text-primary-dark">
          <p className="font-medium mb-1">Qo'llanma:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Har bir chegara uchun aniq va tushunarli xabar yozing</li>
            <li>Foydalanuvchilar slayderni harakatlantirganda bu xabarlarni ko'radilar</li>
            <li>Bo'sh qoldirish mumkin - xabar ko'rsatilmaydi</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
