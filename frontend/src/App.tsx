
import CreateMesocycle from './pages/Createmesocycle'
import Performance from './pages/Performance'
import Mesocycleui from './pages/Mesocycleui'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import {QueryClientProvider,QueryClient} from '@tanstack/react-query' 
import Allmesocycle from './pages/Allmesocycle'
import './App.css'
import Weekpage from './pages/Weekpage'
import Sessionpage from './pages/Sessionpage'
function App() {
  //@ts-ignore
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Allmesocycle />} />
          <Route path="/create-mesocycle" element = {<CreateMesocycle/>}/>
          <Route path="/mesocycle/week/:weekId" element={<Weekpage/>}/>
          <Route path="/mesocycle/display/:id" element = {<Mesocycleui/>}/>
          <Route path="/mesocycle/week/session/:sessionId" element={<Sessionpage/>}/>
          <Route path="/performance" element={<Performance/>}/>
        </Routes>
      </BrowserRouter>
    </>
    </QueryClientProvider>
  )
}

export default App
