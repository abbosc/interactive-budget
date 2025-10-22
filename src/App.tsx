import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AdminPage } from './features/admin/components/AdminPage'
import { RussianExactDesign } from './features/budget/components/RussianExactDesign'
import { PlansPage } from './features/plans/components/PlansPage'
import { PlanDetailsPage } from './features/plans/components/PlanDetailsPage'
import { SummaryPage } from './features/summary/components/SummaryPage'

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
          <Route path="/" element={<Navigate to="/budget" replace />} />
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
