

type weekvolume = {
    "starting_volume": number,
    "muscle_name": string,
    "volume_completed": number
}

function Progressbar({weekvolume}:{weekvolume: weekvolume | null}){
    return(
        <div className="flex justify-between items-center gap-2 p-3 border-b border-gray-700">
            <div className="w-25 shrink-0 flex items-center gap-2">
                <div className="h-2 w-2  rounded-full bg-lime-400 ">
                </div>
                <span className="font-spaceMono text-xs text-[#646464]">{(weekvolume?.muscle_name)?.toUpperCase()}</span>
            </div>

            <div className={`h-1 flex-1 bg-white shrink-1  rounded-lg`} style={{width: weekvolume?.starting_volume}}>
                <div className="h-full  bg-[#c8ff00] rounded-lg" style={{width: (weekvolume?.volume_completed/weekvolume?.starting_volume)*100+"%"}}></div>
            </div> 

            <div className="flex items-center gap-1 justify-center w-20 shrink-0">
                <span className="font-spaceMono text-xs ">{weekvolume?.volume_completed}/{weekvolume?.starting_volume}</span>
                <span className="font-spaceMono text-xs text-gray-400 ">sets</span>
            </div>
        </div>
    )
}

export default function VolumeGraph({weekvolume}:{weekvolume: weekvolume[] | null}){
    console.log("weekvolume received in graph component :", weekvolume)
    return(
        <div className="p-4 w-full">
            <div className="flex justify-between border-b pb-3 border-[#3C3F40] text-[#3C3F40] font-spaceMono text-xs">
                <span>MUSCLE</span>
                <span className="pr-5">VOLUME</span>
            </div>
            <div className="mt-4">
                {
                    weekvolume == null ? (
                    <p>Click on any week to check their volume overview</p>
                    ) : (
                    weekvolume.map((weekvol) => {
                       return <Progressbar weekvolume={weekvol}/>
                    })
                    )
                }
            
            </div>
        </div>
    )
}