
type muscle = string
type volume ={
    [key:string]:number
}
export default function Volumecard({muscleGroup, volume, setVolume}:{muscleGroup:muscle[], volume:volume, setVolume:React.Dispatch<SetStateAction<volume>>}){
   
    return(
        <>
            {muscleGroup.map((muscle)=>{
                return(
                    <div className="flex justify-between items-center py-2">
                        <span>{muscle}</span>
                        <div className="flex  gap-3 items-center">
                            <button onClick={()=>{setVolume({...volume, [muscle]:Math.max(6, volume[muscle]-1)})}}>-</button>
                            <span>{volume[muscle]}</span>
                            <button onClick={()=>{setVolume({...volume, [muscle]:Math.min(20, volume[muscle]+1)})}}>+</button>
                        </div>
                    </div>      
                )
           })}
        
        </>
              
    )
}

