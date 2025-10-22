import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ConfigManager } from './ConfigManager'
import { CategoryList } from './CategoryList'
import { Button } from '../../../components/ui/Button'

export function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <Link to="/budget">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Budget
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-600 mt-2">
            Manage budget categories, subcategories, and configuration
          </p>
        </div>

        <div className="space-y-8">
          <ConfigManager />
          <CategoryList />
        </div>
      </div>
    </div>
  )
}
