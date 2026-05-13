import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useState } from "react"
import Dimmer from "../components/Dimmer"
import { useSession } from "../hooks/useSession"
import Exercisecomponent from "./Exercisecomponent"

export default function Sessionpage(){
    const {sessionId}= useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [showDimmer, setShowDimmer] = useState(false)
    const { weekId, mesoId } = (location.state as { weekId?: string; mesoId?: string }) || {}
     
    
    if (!weekId || !mesoId || !sessionId) {
        navigate(-1)
        return null
    }
    
    const {Addexercise,MUSCLE_COLORS,  addexercise, persistableExercises, Selecttrainedmuscle, exerciseName, addsetData, addSet, deleteSet, deleteExercise, sessionName, submitSession, apiCall, setApiCall, logSoreness, logPerformanceByMuscle, refreshSessionData, weeklySetSummary} = useSession({sessionId, weekId, mesoId})
    
    function calculateSetsLeftForMuscle(muscletrained: string): number |null {
        const muscleSummary = weeklySetSummary.find(muscle => muscle.muscleName === muscletrained);
        const setsLeftForMuscle = muscleSummary ? muscleSummary.setsLeft : null;
        return setsLeftForMuscle;
    }
    
  
    const [currentDropdown, setCurrentDropdown] = useState<number | null>(null);    
    const [isOpen, setOpen]= useState(false)
    const muscle= ["back","chest","legs", "biceps","triceps","forearms","abs","front delts","side delts","rear delts","glutes","calves","traps"]

    const sorenessFeedbackMuscles = Array.from(
        new Set(
            (persistableExercises as any[])
                .filter((exercise) => {
                    return (
                        typeof exercise?.muscletrained === "string" &&
                        exercise.muscletrained.trim() !== "" &&
                        Object.prototype.hasOwnProperty.call(exercise, "soreness")
                    )
                })
                .map((exercise) => exercise.muscletrained)
        )
    )
    
 
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
                            <button
                                className="cursor-pointer font-mono text-[13px] tracking-[0.06em] text-[#f0f0f0] bg-transparent border border-[#2a2a2a] rounded-[8px] px-5 py-[10px] leading-[1.4] text-center transition-all duration-200 hover:border-[#f97316] hover:text-[#f97316] hover:bg-[rgba(249,115,22,0.15)]"
                               
                                onClick={() => {
                                    setShowDimmer(true);
                                }}>
                                Save<br/>Session
                            </button>
                        </div>
                        
                    </div>

                    <div >
                        {weeklySetSummary.length > 0 ? (
                            <div className="mb-8 rounded-[12px] border border-[#1f1f1f] bg-[#0b0b0b] p-5">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <p className="font-spaceMono text-[11px] tracking-[0.16em] text-[#7b7b7b] uppercase">
                                        Weekly Sets Left
                                    </p>
                                    <p className="font-spaceMono text-[10px] text-[#515151] uppercase tracking-[0.08em]">
                                        Current session included
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {weeklySetSummary.map((summary) => {
                                        return (
                                            <div
                                                key={summary.muscleName}
                                                className="rounded-[10px] border border-[#191919] bg-black/40 px-4 py-3"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="font-spaceMono text-sm uppercase">
                                                        {summary.muscleName}
                                                    </span>
                                                    <span className="font-spaceMono text-sm text-[#c8ff00] uppercase">
                                                        {summary.setsLeft} left
                                                    </span>
                                                </div>
                                                <p className="mt-2 font-spaceMono text-[10px] tracking-[0.08em] text-[#7b7b7b] uppercase">
                                                    {summary.completedSets}/{summary.targetSets} weekly sets counted
                                                </p>
                                                <p className="mt-1 font-spaceMono text-[10px] text-[#555] uppercase tracking-[0.08em]">
                                                    Current session: {summary.currentSessionSets} sets
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : null}

                        {
                            addexercise.length === 0? <p>Start adding exercise</p>:addexercise.map((exercise)=>{
                                //@ts-ignore
                                return <Exercisecomponent key={exercise.id} setsLeft={calculateSetsLeftForMuscle(exercise.muscletrained)} logSoreness={logSoreness} muscletrained={exercise.muscletrained} MUSCLE_COLORS={MUSCLE_COLORS} muscle={muscle} currentDropdown={currentDropdown} setCurrentDropdown={setCurrentDropdown} isOpen={isOpen} setOpen={setOpen} exercise_name={exercise.exercise_name} id={exercise.id} exerciseName={exerciseName} addset={addSet} deleteSet={deleteSet} deleteExercise={deleteExercise} set={exercise.set} addsetData={addsetData} Selecttrainedmuscle={Selecttrainedmuscle} apiCall={apiCall} setApiCall={setApiCall} weekId={weekId} mesoId={mesoId} existingSoreness={exercise.soreness}/>
                            })
                        }
                        
                    </div>
                    <div>
                        <button className="cursor-pointer" onClick={()=>{Addexercise()}}>+ ADD EXERCISE </button>
                       
                    </div>
                </div>
            </div>
            {
                showDimmer ? <Dimmer
                    setShowDimmer={setShowDimmer}
                    musclesForPerformance={sorenessFeedbackMuscles}
                    onRatePerformance={logPerformanceByMuscle}
                    onSaveSession={submitSession}
                    onBackToSession={async () => {
                        await refreshSessionData()
                        setShowDimmer(false)
                    }}
                /> : null
            }
        </div>
    )
}
