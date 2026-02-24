import Volumecard from "../components/Volumecard"
import { use, useState } from "react"
import Frequencycard from "../components/Frequencycard"
import { useNavigate } from "react-router-dom";
function Volume({ volume, setVolume }: { volume: any, setVolume: any }) {
    const musclename: string[] = ["back","chest","legs","biceps","triceps","forearms","abs","front delts","side delts","rear delts","glutes","calves","traps"];
    return (
        <>
            <div className="p-6">
                <div>
                    <h1 className="text-2xl font-bold ">Starting Volume</h1>
                    <p className="text-gray-400">Sets per week. Recommended: 6-12 per weeks per muscle </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">        
                    <Volumecard muscleGroup={musclename} volume={volume} setVolume={setVolume}/>
                </div>
            </div>
        </>
    )
}

function Frequency({ frequency, setFrequency }: { frequency: any, setFrequency: any }) {
    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold ">Training Frequency</h1>
                <p className="text-gray-400">How many times per week will you train each muscle</p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto px-4">
                <Frequencycard frequency={frequency} setFrequency={setFrequency}/>
            </div>
        </div>
    )
}

function MesocycleOverview({ mesocycleName, setMesocycleName }: { mesocycleName: string, setMesocycleName: any }) {
    
    return (
        <div>
            <div className="p-6">
                <div>
                    <div className="pb-4">
                        <h1 className="text-2xl font-bold pb-2.5"> Name of your Mesocycle</h1>
                        <p className="text-gray-400">Give this training block a name </p>
                    </div>
                    <div>
                        <label>Mesocycle Name</label>
                        <br></br>
                        <input 
                            type="text" 
                            value={mesocycleName} 
                            onChange={(e) => setMesocycleName(e.target.value)}
                            className="rounded-md w-full h-8 px-3 py-2 border bg-secondary/50" 
                            placeholder="bulk1"
                        />
                    </div>
                </div>
            </div>
            <div className="p-6">
                <p className="mb-2">Structure Overview</p>
                <p className="text-gray-400 mb-2">Your mesocycle will be <strong>4 progressive weeks</strong> followed by <strong>1 deload week</strong> </p>
                <div className="flex justify-between text-xs">
                    <span>Week 1: 3 RIR</span>
                    <span>Week 2: 2 RIR</span>
                    <span>Week 3: 1 RIR</span>
                    <span>Week 5: Deload</span>
                </div>
            </div>
        </div>
    )
}

export default function CreateMesocycle() {
    const [currentStep, setCurrentStep] = useState(1)
    const navigate = useNavigate();
    const [mesocycleName, setMesocycleName] = useState("")
    const [volume, setVolume] = useState({
        "back": 8, "chest": 8, "legs": 8, "biceps": 8, "triceps": 8,
        "forearms": 8, "abs": 8, "front delts": 8, "side delts": 8,
        "rear delts": 8, "glutes": 8, "calves": 8, "traps": 8
    })
    const [frequency, setFrequency] = useState([
        {"back": 2}, {"chest": 2}, {"legs": 2}, {"biceps": 2}, {"triceps": 2},
        {"forearms": 2}, {"abs": 2}, {"front delts": 2}, {"side delts": 2},
        {"rear delts": 2}, {"glutes": 2}, {"calves": 2}, {"traps": 2}
    ])

   async function handleSubmit(){
    console.log("Mesocycle name:", mesocycleName, "Volume:", volume, "Frequency:", frequency)
         const volumeArray = Object.entries(volume).map(([muscle, sets]) => ({ muscle_name: muscle, set: sets }))

        const frequencyArray = frequency.map((f) => {
                 const [muscle, timesPerWeek] = Object.entries(f)[0]
                 return { muscle_name: muscle, timesPerWeek }
             })
        const payload = { name: mesocycleName, volume: volumeArray, frequencies: frequencyArray }

        const response = await fetch("http://localhost:8787/api/v1/mesoCycle/create",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(payload)
        })
        if(response.status === 201){
            navigate("/")
        } else {
            console.error("Failed to create mesocycle")
        }
        // navigate("/")
    
   }


    return (
        <div className="w-full h-screen bg-black text-white">
            <div className="p-4 w-full h-screen flex flex-col items-center justify-center">
                <div className="border-2 border-black w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-7">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">1</div>
                            <span>Overview</span>
                            <div className="w-12 h-px bg-white"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-white text-black" : ""} flex items-center justify-center`}>2</div>
                            <span>Volume</span>
                            <div className="w-12 h-px bg-white"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${currentStep >= 3 ? "bg-white text-black" : ""} flex items-center justify-center`}>3</div>
                            <span>Frequency</span>
                        </div>
                    </div>

                    {currentStep === 1 
                        ? <MesocycleOverview mesocycleName={mesocycleName} setMesocycleName={setMesocycleName}/> 
                        : currentStep === 2 
                        ? <Volume volume={volume} setVolume={setVolume}/> 
                        : <Frequency frequency={frequency} setFrequency={setFrequency}/>
                    }

                    <div className="flex justify-between px-3">
                        <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}>
                            <span className={`${currentStep <= 1 ? "text-gray-400 cursor-not-allowed" : ""}`}> Back </span>
                        </button>
                        {currentStep === 3 
                            ? <button className="bg-white text-black px-4 py-2 rounded-sm" onClick={handleSubmit}> Create Mesocycle</button> 
                            : <button className="bg-white text-black px-4 py-2 rounded-sm" onClick={() => setCurrentStep(prev => prev + 1)}> Next</button>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}