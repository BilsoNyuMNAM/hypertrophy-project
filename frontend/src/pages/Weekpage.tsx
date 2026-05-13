import { useNavigate, useParams,useSearchParams } from "react-router-dom"
import { useState, useEffect} from "react"
import Sessioncard from "../components/Sessioncard"
import { useQuery } from "@tanstack/react-query"
type SessionListItem = {
    id: number
    session_name: string
}

function Createsessionpage({weekId, setDisplaySession}:{weekId:string, setDisplaySession:any}){
    const [searchParams] = useSearchParams()
    const mesoId = searchParams.get("mesoId")
    const [sessionName, setSessionName] = useState("");
    function handlechange(e:any){
        const {value} = e.target
        setSessionName(value)
    }
    function Submit(){
        console.log("inside the submit function")
        const url = `http://localhost:8787/api/v1/mesoCycle/session/create/${weekId}?sessionId=${mesoId}`
        console.log(url)
        fetch(url,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                session_name: sessionName
            })
        })
        .then((res)=>{
            console.log("response from the server", res)
             if(res.status === 201){
                setDisplaySession(false)
                
             }
        })
       
       
    }
    return(
        <div className=" fixed z-10 h-screen w-full text-white bg-black   inset-0">
            <div className="p-3 h-screen w-full flex justify-center items-center mx-auto">
                <div className="w-full max-w-md flex flex-col items-center">
                    <div> 
                        <h1 className="text-5xl font-spaceMono">CREATE SESSION</h1>
                    </div>
                    <div className="mt-2 mb-10"> 
                            <p className="text-gray-400">Name you session to get started</p>
                    </div>
                    <div className="w-full px-20 mb-10">
                        <input type="text" onChange={(e)=>{handlechange(e)}} name="session" value={sessionName} placeholder="Session name" className="border rounded-lg p-2 w-full"/>
                    </div>
                    <div className="w-full">
                        <button onClick={Submit}className="cursor-pointer bg-white text-black tracking-wide w-full px-10 py-3 border font-thin rounded-lg">CREATE SESSION</button>
                    </div>
            </div>  
            </div>
        </div>
    )
}


export default function Weekpage(){
    const navigate = useNavigate()
    const {weekId} = useParams()
    const [displaySession, setDisplaySession] = useState(false)
    const [weekStatus, setWeekStatus] = useState<{
        unlocked: boolean
        nextWeekUnlocked: boolean
        isFinalWeek: boolean
    } | null>(null)
    const [loadError, setLoadError] = useState("")
    

    const [searchParams] = useSearchParams()
    const mesoId = searchParams.get("mesoId") || ""
    const {data, refetch} = useQuery({
        queryKey: ["sessions", weekId],
        queryFn: async function(){
            const response = await fetch(`http://localhost:8787/api/v1/mesoCycle/session/all/${weekId}`)
            return await response.json()
        }
    })

    const sessionDisplay = data?.result.sessions.length == 0?<p>No session to display </p>: data?.result.sessions.map((session, index)=>{
        return(
            <Sessioncard
                key={session.id}
                id={session.id}
                sessionName={session.session_name}
                number={index+1}
                weekId={weekId || ""}
                mesoId={mesoId}
                onDeleteSession={deleteSession}
            />
        )
    })

    async function deleteSession(sessionId: number, currentSessionName: string) {
        const deleteConfirmed = window.confirm(
            `Delete ${currentSessionName}? This removes the session from the current week.`
        )

        if (!deleteConfirmed) {
            return
        }

        const response = await fetch(
            `http://localhost:8787/api/v1/mesoCycle/session/${sessionId}`,
            {
                method: "DELETE",
            }
        )
        const data = await response.json()

        if (!response.ok) {
            setLoadError(data.message || "Unable to delete session")
            return
        }

        setLoadError("")
        refetch();
    }

    
    return(
        <div className="h-screen w-full bg-black text-white overflow-y-auto">
            <div className="w-full h-screen max-w-5xl mx-auto mt-7 ">
                <div className="px-8 py-6">
                    <div className={`${displaySession?"fixed":""}  z-20 mb-10 `}>
                        <button onClick={()=>{navigate(-1)}}className="cursor-pointer font-spaceMono">← Back to Week</button>
                    </div>
                    {displaySession? <Createsessionpage weekId={weekId || ""} setDisplaySession={setDisplaySession}/>:
                    <div>
                        <div>
                            <div>
                                <span className="font-spaceMono text-sm">WEEK 1</span>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-10 pr-4">
                                    <h1 className="text-4xl font-spaceMono font-bold">SESSION PLAN</h1>
                                    <div className="flex gap-2 items-center border rounded-lg px-4 py-2 text-xs font-spaceMono text-gray-300">
                                        {weekStatus?.isFinalWeek
                                            ? "FINAL WEEK"
                                            : weekStatus?.nextWeekUnlocked
                                                ? "NEXT WEEK UNLOCKED"
                                                : "NEXT WEEK LOCKED"}
                                    </div>
                                    
                                </div>
                                {loadError ? (
                                    <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                                        {loadError}
                                    </div>
                                ) : null}
                                <div>
                                    <div className="p-4">
                                        <div className="mb-10">
                                                {sessionDisplay}
                                        </div>
                                        <div className="flex align-center justify-center ">
                                            <button className="cursor-pointer font-spaceMono" onClick={() => setDisplaySession(true)}>+ Add Session</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div></div>
                    </div>}
                    </div>
            </div>
        </div>
    )
}
