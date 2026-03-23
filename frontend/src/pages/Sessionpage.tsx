import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

import { useSession } from "../hooks/useSession"
import Exercisecomponent from "./Exercisecomponent"

interface Set {
    id: number;
    reps: number;
    weight: number;
    rir: number;
}

export default function Sessionpage(){
    const {sessionId}= useParams()
    const location = useLocation()
    const navigate = useNavigate()
    
    const { weekId, mesoId } = (location.state as { weekId?: string; mesoId?: string }) || {}
    
    // Null guard: redirect if weekId or mesoId is missing
    if (!weekId || !mesoId) {
        navigate(-1)
        return null
    }
    
    const {Addexercise,MUSCLE_COLORS,  addexercise, Selecttrainedmuscle, exerciseName, addsetData, addSet, sessionName, submitSession, apiCall, setApiCall, logSoreness} = useSession({sessionId, weekId, mesoId})
    
    const [currentDropdown, setCurrentDropdown] = useState<number | null>(null);    
    const [isOpen, setOpen]= useState(false)
    const muscle= ["back","chest","legs", "biceps","triceps","forearms","abs","front delts","side delts","rear delts","glutes","calves","traps"]
    
 
    return(
       <div className="h-screen w-full bg-black text-white overflow-y-auto">
            <div className="w-full h-screen max-w-5xl mx-auto mt-7 ">
                <div className="px-8 py-6">
                     <div className="mb-10">
                        <button onClick={()=>{navigate(-1)}}className="cursor-pointer font-spaceMono">← Back to Session</button>
                    </div>
                    <div className="mb-10 flex justify-between items-center">
                        
                        <p className="h-10 w-full text-xl font-spaceMono uppercase">{sessionName}</p>
                        <div className="p-2">
                            <button className="cursor-pointer"onClick={submitSession}>Save Session</button>
                        </div>
                        
                    </div>

                    <div >
                        {
                            addexercise.length === 0? <p>Start adding exercise</p>:addexercise.map((exercise)=>{
                                //@ts-ignore
                                return <Exercisecomponent logSoreness={logSoreness} Addexercise={Addexercise} muscletrained={exercise.muscletrained} addexercise={addexercise} MUSCLE_COLORS={MUSCLE_COLORS} muscle={muscle} currentDropdown={currentDropdown} setCurrentDropdown={setCurrentDropdown} isOpen={isOpen} setOpen={setOpen} exercise_name={exercise.exercise_name} id={exercise.id} exerciseName={exerciseName} addset={addSet} set={exercise.set} addsetData={addsetData} Selecttrainedmuscle={Selecttrainedmuscle} apiCall={apiCall} setApiCall={setApiCall} weekId={weekId} mesoId={mesoId} existingSoreness={exercise.soreness}/>
                            })
                        }
                        
                    </div>


                    <div>
                        <button className="cursor-pointer" onClick={()=>{Addexercise()}}>+ ADD EXERCISE </button>
                       
                    </div>
                </div>
            </div>
        </div>
    )
}