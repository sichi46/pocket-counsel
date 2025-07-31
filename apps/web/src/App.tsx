import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import ChatInterface from '@/components/ChatInterface'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <DisclaimerBanner />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ChatInterface />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  )
}

export default App 