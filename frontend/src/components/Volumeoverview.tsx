import { useState } from "react"
import VolumeGraph from "./VolumeGraph"
type week = {
    "id": string,
    "week_name": string,
    "meso_cycle_id": string
}

export default function VolumeOverview({weekName}:{weekName: week[] | null}){
    const [weeknumber, setWeeknumber] = useState(1)
    const [weekvolume, setWeekvolume] = useState(null)
    async function getWeekvolume(){
        const result = await fetch(`http://localhost:8787/api/v1/mesoCycle/volume/${weeknumber}`)
        const jsonified = await result.json()
        console.log("volume data received :",jsonified) 
        setWeekvolume(jsonified.result)
        /*
        {
            "result":[{"muscle_name":  , "startingvolume":[{"set":8}]} , {}, {}]
        }
        
        */
    }
    return(
       <div>
            <div className="mb-7">
                {
                //@ts-ignore
                weekName==null? "Loading...": weekName.length==0? "No weeks found": <div className="flex gap-3">
                
                <div className={`border rounded-lg  font-dmSans cursor-pointer` } data-weekId = {weekName[0].id} onClick={()=>{setWeeknumber(1) ; getWeekvolume()}}>
                    <div className="p-4">
                        <div className=" text-gray-400 font-spaceMono">{weekName[0].week_name}</div> 
                    </div>
                </div>
                <div className={`border rounded-lg  font-dmSans cursor-pointer` } data-weekId = {weekName[1].id} onClick={()=>{setWeeknumber(2)}}>
                    <div className="p-4">
                        <div className="text-gray-400 font-spaceMono">{weekName[1].week_name}</div> 
                    </div>
                </div>
                <div className={`border rounded-lg  font-dmSans cursor-pointer` } data-weekId = {weekName[2].id} onClick={()=>{setWeeknumber(3)}}>
                    <div className="p-4">
                        <div className=" text-gray-400 font-spaceMono">{weekName[2].week_name}</div> 
                    </div>
                </div>
                <div className={`border rounded-lg  font-dmSans cursor-pointer`} data-weekId = {weekName[3].id} onClick={()=>{setWeeknumber(4)}}>
                    <div className="p-4">
                        <div className=" text-gray-400 font-spaceMono">{weekName[3].week_name}</div> 
                    </div>
                </div>
                </div>
                }
            </div>
            <div>       
                <div className="mb-4">
                    <p className="text-[#fff] text-base font-semibold">Week {weeknumber} - Volume Overview</p>
                </div>
                <div className="border rounded-lg border-[#3C3F40] bg-[#090B0D] w-full">
                    <VolumeGraph weekvolume={weekvolume}/>
                </div>
            </div>
                         
       </div>
    )
}