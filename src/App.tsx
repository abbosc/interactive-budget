import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { HomePage } from './features/home/components/HomePage'
import { MapPage } from './features/home/components/MapPage'
import { RegionPage } from './features/region/components/RegionPage'
import { AdminPage } from './features/admin/components/AdminPage'
import { RussianExactDesign } from './features/budget/components/RussianExactDesign'
import { PlansPage } from './features/plans/components/PlansPage'
import { PlanDetailsPage } from './features/plans/components/PlanDetailsPage'
import { SummaryPage } from './features/summary/components/SummaryPage'
import { AboutPage } from './features/about/components/AboutPage'
import { HelpPage } from './features/help/components/HelpPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map-page" element={<MapPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/region/:regionId" element={<RegionPage />} />
          <Route path="/budget" element={<RussianExactDesign />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/:id" element={<PlanDetailsPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
