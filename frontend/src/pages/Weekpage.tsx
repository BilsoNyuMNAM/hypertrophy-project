import { useNavigate, useParams,useSearchParams } from "react-router-dom"
import { useState, useEffect} from "react"
import Sessioncard from "../components/Sessioncard"
function Createsessionpage({weekId, setDisplaySession}:{weekId:string, setDisplaySession:any}){
    const navigate = useNavigate()
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
    const [sessionName, setSessionName] = useState([])
    const [done, setDone] = useState(false)
    let letter = done? "Completed":"Mark as complete"
    // const [totalSession, setTotalSession] = useState(0);

    const [searchParams] = useSearchParams()
    const mesoId = searchParams.get("mesoId") || ""

    const sessionDisplay = sessionName.length == 0?<p>No session to display </p>: sessionName.map((session, index)=>{
        return(
            //@ts-ignore
            <Sessioncard id={session.id} sessionName={session.session_name} number={index+1} weekId={weekId || ""} mesoId={mesoId}/>
        )
    })
    //fetch to get all the session for the specific week
    function getAllSession(){
        const url = `http://localhost:8787/api/v1/mesoCycle/session/all/${weekId}`
        fetch(url)
        .then((res)=>{
            res.json().then((data)=>{
                console.log("All session of the week is fetched", data)
                const resultpart = data.result.sessions
                console.log("result part of the data", resultpart)
                setSessionName(resultpart)
                setDone(data.result.weekStatus.completed)
                // setTotalSession(data.totalSessions)
            })
        })
    }
    useEffect(()=>{
        getAllSession()

    },[])
    async function updateBoolean(booleanValue:boolean){
        const url = `http://localhost:8787/api/v1/mesoCycle/session/booleanUpdate/${weekId}`
        const result = await fetch(url,{
            method:"PATCH",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                booleanStatus: booleanValue
            })
        })
        if(result.status === 200){
            console.log("boolean value updated successfully")
        }
        else{
            console.log("failed to update the boolean value")
        }
    }


    return(
        <div className="h-screen w-full bg-black text-white overflow-y-auto">
            <div className="w-full h-screen max-w-5xl mx-auto mt-7 ">
                <div className="px-8 py-6">
                    <div className={`${displaySession?"fixed":""}  z-20 mb-10 `}>
                        <button onClick={()=>{navigate(-1)}}className="cursor-pointer font-spaceMono">← Back to Week</button>
                    </div>
                    {displaySession? <Createsessionpage weekId={weekId} setDisplaySession={setDisplaySession}/>:
                    <div>
                        <div>
                            <div>
                                <span className="font-spaceMono text-sm">WEEK 1</span>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-10 pr-4">
                                    <h1 className="text-4xl font-spaceMono font-bold">SESSION PLAN</h1>
                                    <div className="flex gap-2 items-center border rounded-lg px-4 py-2">
                                        <div onClick={() => setDone(!done)} className={`${done?" flex items-center justify-center bg-white":"border"} rounded-full h-5 w-5`}>
                                            {done ? <><span className="text-black">✓</span></>:null}
                                        </div>
                                        <button onClick={() => {
                                            setDone(!done),
                                            updateBoolean(!done)
                                        }}
                                    className={`${done? " text-gray-400 line-through" :"bg-black  text-white"} font-spaceMono text-xs tracking-wide px-2 py-1 rounded-lg `}
                                    >{letter}</button>
                                    </div>
                                    
                                </div>
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