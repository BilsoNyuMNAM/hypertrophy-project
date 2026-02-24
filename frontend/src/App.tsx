import ReactDOM from 'react-dom/client'
import CreateMesocycle from './pages/Createmesocycle'
import Mesocycleui from './pages/Mesocycleui'
import { Routes, Route, BrowserRouter} from 'react-router-dom'
import Allmesocycle from './pages/Allmesocycle'
import './App.css'

function App() {
  

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Allmesocycle />} />
        <Route path="/create-mesocycle" element = {<CreateMesocycle/>}/>
        <Route path="/mesocycle/display/:id" element = {<Mesocycleui/>}/>
      </Routes>
    </BrowserRouter>
      
    
    </>
  )
}

export default App
