import { useNavigate } from "react-router-dom"

export default function Sessioncard({
    id,
    sessionName,
    number,
    weekId,
    mesoId,
    onDeleteSession,
}:{
    id:number,
    sessionName:string,
    number:number,
    weekId:string,
    mesoId:string,
    onDeleteSession:(sessionId:number, sessionName:string)=>void | Promise<void>
}){
    const navigate = useNavigate()
    const sessionId = id
    console.log("Sesion data received in session card", sessionName, id, number)
    return(
        <div className="p-3   rounded-lg bg-[#0D1117] mb-3 " data-sessionid={id} onClick={()=>{
            console.log(id)
        }}>
            <div className="flex justify-between items-center bg-[#0D1117]">
                <div className="flex gap-2 items-center">
                    <div className="border rounded-full p-5 bg-white text-black w-8 h-8 flex items-center justify-center">
                        {number}
                    </div>
                    <div>
                        <span className="font-spaceMono">{sessionName.toUpperCase()}</span>
                        <p className="text-gray-400 text-xs ">Session {number} </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="cursor-pointer border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[10px] tracking-[0.12em] text-[#9ca3af] transition-colors duration-150 hover:text-red-400 hover:border-red-400"
                        onClick={(event)=>{
                            event.stopPropagation()
                            onDeleteSession(sessionId, sessionName)
                        }}
                    >
                        DELETE
                    </button>
                    <button className="cursor-pointer" onClick={()=>{navigate(`/mesocycle/week/session/${sessionId}`, { state: { weekId, mesoId } })}}>→</button>
                </div>
            </div>
        </div>
    )
}
