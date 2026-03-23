// import { useState } from "react"
// import { useNavigate,useParams } from "react-router-dom"
// import VolumeGraph from "./VolumeGraph"
// type week = {
//     "id": string,
//     "week_name": string,
//     "meso_cycle_id": string
// }

// export default function VolumeOverview({weekName, id}:{weekName: week[] | null, id:string}){
//     const navigate = useNavigate()
//     const [weeknumber, setWeeknumber] = useState(1)
//     const [weekvolume, setWeekvolume] = useState(null)
//     const [weekid, setWeekid] = useState(null) 
//     async function getWeekvolume(){
//         const result = await fetch(`http://localhost:8787/api/v1/mesoCycle/volume/${weeknumber}`)
//         const jsonified = await result.json()
//         console.log("volume data received :",jsonified) 
//         setWeekvolume(jsonified.volume) 
//         /*
//         {
//             "volume":[
//             {
//             "starting_volume": , 
//             "muscle_name": ,
//             "volume_completed": 
//             }, {}, {}, {}]
//         }
        
//         */
//     }
//     return(
//        <div>
//             <div className="mb-7">
//                 {
//                 //@ts-ignore
//                 weekName==null? "Loading...": weekName.length==0? "No weeks found": <div className="flex gap-3">
                
//                 <div className={`border rounded-lg  font-dmSans cursor-pointer` } data-weekId = {weekName[0].id} onClick={()=>{setWeeknumber(1) ; getWeekvolume(); setWeekid(weekName[0].id)}}>
//                     <div className="font-mono text-xs tracking-wider px-7 py-3.5  border-neutral-800 bg-transparent text-neutral-500 cursor-pointer rounded relative overflow-hidden transition-all duration-200 hover:text-neutral-200 hover:border-neutral-500">
//                         <div className="text-gray-400 font-spaceMono">{weekName[0].week_name}</div> 
//                     </div>
//                 </div>
//                 <div className={`border rounded-lg  font-dmSans cursor-pointer` } data-weekId = {weekName[1].id} onClick={()=>{setWeeknumber(2) ; getWeekvolume(); setWeekid(weekName[1].id)}}>
//                     <div className="font-mono text-xs tracking-wider px-7 py-3.5  border-neutral-800 bg-transparent text-neutral-500 cursor-pointer rounded relative overflow-hidden transition-all duration-200 hover:text-neutral-200 hover:border-neutral-500">
//                         <div className="text-gray-400 font-spaceMono">{weekName[1].week_name}</div> 
//                     </div>
//                 </div>
//                 <div className={`border rounded-lg  font-dmSans cursor-pointer` } data-weekId = {weekName[2].id} onClick={()=>{setWeeknumber(3) ; getWeekvolume(); setWeekid(weekName[2].id)}}>
//                     <div className="font-mono text-xs tracking-wider px-7 py-3.5  border-neutral-800 bg-transparent text-neutral-500 cursor-pointer rounded relative overflow-hidden transition-all duration-200 hover:text-neutral-200 hover:border-neutral-500">
//                         <div className=" text-gray-400 font-spaceMono">{weekName[2].week_name}</div> 
//                     </div>
//                 </div>
//                 <div className={`border rounded-lg  font-dmSans cursor-pointer`} data-weekId = {weekName[3].id} onClick={()=>{setWeeknumber(4) ; getWeekvolume(); setWeekid(weekName[3].id)}}>
//                     <div className="font-mono text-xs tracking-wider px-7 py-3  border-neutral-800 bg-transparent text-neutral-500 cursor-pointer rounded relative overflow-hidden transition-all duration-200 hover:text-neutral-200 hover:border-neutral-500">
//                         <div className=" text-gray-400 font-spaceMono">{weekName[3].week_name}</div> 
//                     </div>
//                 </div>
//                 </div>
//                 }
//             </div>
//             <div>       
//                 <div className="mb-4 flex align-center justify-between">
//                     <p className="text-[#fff] text-base font-semibold">Week {weeknumber} - Volume Overview</p>
//                     <div className="font-spaceMono text-xs flex align-center">
//                         {/* <button className="cursor-pointer" data-weekId={weekid} onClick={()=>{navigate(`/mesocycle/week/${weekid}/?mesoId=${id}`)}}>GO TO WEEK {weeknumber} </button> */}
//                         <button
//                             data-weekId={weekid} onClick={()=>{navigate(`/mesocycle/week/${weekid}/?mesoId=${id}`)}}
//                             className="flex items-center gap-2 text-xs tracking-widest transition-all hover:gap-3"
//                             style={{ fontFamily: "'JetBrains Mono', monospace", color: '#c8ff00' }}>
//                             GO TO WEEK {weeknumber}
//                             <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                                 <path d="M3 7h8M8 4l3 3-3 3" stroke="#c8ff00" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
//                             </svg>
//                         </button>
//                     </div>
//                 </div>
//                 <div className="border rounded-lg border-[#3C3F40] bg-[#090B0D] ">
//                     <VolumeGraph weekvolume={weekvolume}/>
//                 </div>
//             </div>
                         
//        </div>
//     )
// }

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import VolumeGraph from "./VolumeGraph"

type Week = {
    id: string
    week_name: string
    meso_cycle_id: string
}

export default function VolumeOverview({ weekName, id }: { weekName: Week[] | null, id: string }) {
    const navigate = useNavigate()
    const [weeknumber, setWeeknumber] = useState(1)
    const [weekvolume, setWeekvolume] = useState(null)
    const [weekid, setWeekid] = useState<string | null>(null)

    async function getWeekvolume(num: number, wid: string) {
        const result = await fetch(`http://localhost:8787/api/v1/mesoCycle/volume/${wid}`)
        const jsonified = await result.json()
        console.log("volume data received:", jsonified)
        setWeekvolume(jsonified.volume)
    }

    function handleWeekSelect(week: Week, index: number) {
        const weekNum = index + 1
        setWeeknumber(weekNum)
        setWeekid(week.id)
        getWeekvolume(weekNum, week.id)
    }

    return (
        <div>
            <div className="mb-7">
                {weekName == null ? (
                    "Loading..."
                ) : weekName.length === 0 ? (
                    "No weeks found"
                ) : (
                    <div className="flex gap-3">
                        {weekName.map((week, index) => {
                            const isActive = weeknumber === index + 1

                            return (
                                <div
                                    key={week.id}
                                    data-weekId={week.id}
                                    onClick={() => handleWeekSelect(week, index)}
                                    className={`
                                        relative overflow-hidden rounded-lg cursor-pointer
                                        border transition-all duration-200
                                        font-spaceMono text-xs tracking-wider px-7 py-3.5
                                        ${isActive
                                            ? 'border-[#c8ff00] text-white bg-[rgba(200,255,0,0.08)]'
                                            : 'border-neutral-800 text-neutral-500 hover:text-neutral-200 hover:border-neutral-500'
                                        }
                                    `}
                                >
                                    <span
                                        className={`
                                            absolute bottom-0 left-0 h-[2px] bg-[#c8ff00]
                                            transition-all duration-200
                                            ${isActive ? 'w-full' : 'w-0'}
                                        `}
                                    />
                                    {week.week_name}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-white text-base font-semibold">
                        Week {weeknumber} - Volume Overview
                    </p>
                    <button
                        data-weekId={weekid}
                        onClick={() => navigate(`/mesocycle/week/${weekid}/?mesoId=${id}`)}
                        className="flex items-center gap-2 text-xs tracking-widest transition-all duration-200 hover:gap-3 text-[#c8ff00]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                        GO TO WEEK {weeknumber}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7h8M8 4l3 3-3 3" stroke="#c8ff00" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="border rounded-lg border-[#3C3F40] bg-[#090B0D]">
                    <VolumeGraph weekvolume={weekvolume} />
                </div>
            </div>
        </div>
    )
}