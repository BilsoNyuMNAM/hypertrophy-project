
import CreateMesocycle from './pages/Createmesocycle'

import Mesocycleui from './pages/Mesocycleui'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import Allmesocycle from './pages/Allmesocycle'
import './App.css'
import Weekpage from './pages/Weekpage'
import Sessionpage from './pages/Sessionpage'
function App() {
  

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Allmesocycle />} />
        <Route path="/create-mesocycle" element = {<CreateMesocycle/>}/>
        <Route path="/mesocycle/week/:weekId" element={<Weekpage/>}/>
        <Route path="/mesocycle/display/:id" element = {<Mesocycleui/>}/>
        <Route path="/mesocycle/week/session/:sessionId" element={<Sessionpage/>}/>
      </Routes>
    </BrowserRouter>
      
    
    </>
  )
}

export default App
