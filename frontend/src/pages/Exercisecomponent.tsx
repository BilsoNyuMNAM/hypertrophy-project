
import { useState, useEffect } from "react"
import SetComponent from "../components/Setcomponent"
import Feedback from "../components/Feeback"
export default function Exercisecomponent({muscletrained, Selecttrainedmuscle, MUSCLE_COLORS, muscle, currentDropdown, setCurrentDropdown, isOpen,setOpen, exercise_name, exerciseName, addset, deleteSet, deleteExercise, set, id, addsetData, apiCall, setApiCall, weekId, mesoId, logSoreness, existingSoreness}:{muscletrained:string , Selecttrainedmuscle:any, MUSCLE_COLORS:any , muscle:string[], currentDropdown:number | null ,setCurrentDropdown: React.Dispatch<React.SetStateAction<number | null>>, isOpen:boolean ,setOpen: React.Dispatch<React.SetStateAction<boolean>>,  exercise_name:string, exerciseName:(e:any, id:number)=>void, addset:(exerciseid:number)=>void, deleteSet:(exerciseId:number, setId:number)=>void, deleteExercise:(exerciseId:number)=>void, set:any, id:number, addsetData:(e:any, exerciseid:number, id:number)=>void, apiCall:Set<unknown>, setApiCall:React.Dispatch<React.SetStateAction<Set<unknown>>>, weekId:string, mesoId:string, logSoreness:any, existingSoreness?:any}){
    const [selected, setSelected] = useState(muscletrained)
    const [showSorenessFeedback, setSorenessFeedback] = useState(false);
    const [sorenessLog, setSorenessLog] = useState<any>(null);
    
    // Initialize sorenessLog from existing soreness data when component mounts or existingSoreness changes
    useEffect(() => {
        if (existingSoreness) {
            setSorenessLog({
                level: existingSoreness.soreness_score,
                label: existingSoreness.description
            });
        }
    }, [existingSoreness]);

    useEffect(() => {
        setSelected(muscletrained)
    }, [muscletrained])
    
    async function Displayfeedback(muscleName: string){
        setSorenessFeedback(false)   
            const url=`http://localhost:8787/api/v1/mesoCycle/frequency/muscle?muscleName=${encodeURIComponent(muscleName)}&weekId=${weekId}&mesoId=${mesoId}`
            let result = await fetch(url)
            const data = await result.json()
            setSorenessFeedback(data.showSorenessFeedback)
            setApiCall(prev => new Set(prev).add(muscleName))
    }
    
    const empty = <div className="mb-3">
            <div className="border border-[#222] rounded-[10px]   bg-[#0c0c0c]"> 
                    <div className="p-5 ">
                        <div className=" border-gray-400 flex items-center gap-3">
                            <input placeholder="exercise name" onChange={(e)=>{exerciseName(e, id)}} value={exercise_name} name="exercise_name" className="outline-none h-5  font-bold tracking-[0.12em] w-full text-xs  uppercase font-spaceMono appearance-none border-none"></input>
                            <button onClick={() => deleteExercise(id)} className="border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[10px] tracking-[0.12em] text-[#9ca3af] transition-colors duration-150 hover:text-red-400 hover:border-red-400 cursor-pointer">
                                DELETE EXERCISE
                            </button>
                        </div>
                        <div className="relative  text-[10px] pb-3 mt-1 tracking-[0.12em] text-[#555] uppercase font-spaceMono  select-none">
                            
                            <span  onClick={()=>{setOpen(!isOpen); setCurrentDropdown(id)}}  >Muscle trained</span>
                            
                            {
                                selected == ""? null :  <button className="ml-2 text-[10px] border rounded-lg  font-spaceMono tracking-[0.06em] py-[4px] px-[10px] rounded-[3px] cursor-pointer transition duration-150  border  text-gray-[400]" style={{ borderColor: MUSCLE_COLORS[selected] }}>{selected}</button>
                            }
                            {
                                sorenessLog?<div className="mt-2 p-4 border  border-[rgb(201,106,0)] rounded-lg">
                                {/* @ts-ignore */}
                                <p><span className="font-bold text-[rgb(245,160,48)] ">Soreness logged:</span> Score-{sorenessLog.level} {sorenessLog.label} </p>
                                </div>: null
                            }
                            
                            {
                                isOpen&& id== currentDropdown
                                ? <div className=" absolute z-10  bg-[#0c0c0c] border border-[#222] rounded-[5px] p-3 flex  gap-3 flex-wrap">
                                    {muscle.map(musclename=>{
                                        return <button onClick={() => {
                                            if (selected !== musclename && apiCall.has(musclename) === false) {
                                                Displayfeedback(musclename)
                                            }
                                            selected==musclename? setSelected(""):setSelected(musclename); 
                                            selected==musclename? Selecttrainedmuscle(id, ""):Selecttrainedmuscle(id, musclename)
                                        
                                        }} className="text-[10px] border rounded-lg  font-spaceMono tracking-[0.06em] py-[10px] px-[10px] rounded-[3px] cursor-pointer transition duration-150  border  text-gray-[400]"
                                            style={{ borderColor: selected === musclename ? MUSCLE_COLORS[musclename] : "#222" }}
                                        >{musclename}</button>
                                    })}
                                    <div className="basis-full ">
                                        {
                                            showSorenessFeedback?<Feedback sorenessLog={sorenessLog} musclename={selected} setSorenessLog={(data: any) => { setSorenessLog(data); logSoreness(id, data); }}/>:null
                                        }
                                    </div>
                                    
                                </div> : null
                            }
                        </div>
                        
                            <div className="min-h-30 border border-[#222] rounded-[10px] py-5 px-6  bg-[#0c0c0c]">
                            <div>
                                {set.length ===0?
                                <div  className="w-full flex justify-center items-center h-full">
                                    <p>Add your first set</p>  
                                </div>
                                : set.map((s:any)=>{return <SetComponent key={s.id} exerciseid={id} setdata={s} addsetData={addsetData} deleteSet={deleteSet}/>})}
                            </div>
                            <div className="flex justify-center mt-3">
                                <button  className="cursor-pointer text-xs font-spaceMono" onClick={()=>{addset(id)}}>+ ADD SET </button>
                            </div>
                        </div>
                    </div>  
            </div>
    </div>

    return(
        <>
            {empty}
        </>
    )
}
