import { useNavigate } from "react-router-dom"


type mesocycle = {
    id:number,
    name:string,
    completed:number,
    total_session:number,
    _count:{
        week:number
    }
}
function Mesocycle({
    mesocycle,
    onDelete,
    deletingId,
}:{
    mesocycle:mesocycle[]|any
    onDelete?: (mesocycleId: number) => void
    deletingId?: number | null
}){
    const navigate = useNavigate()
    function Redirect(e:any){
        const mesoId = e.currentTarget.getAttribute("data-meso-id")
        
        navigate(`/mesocycle/display/${mesoId}`)
        console.log("mesoId",mesoId)
    }
    console.log("mesocyle array of object received: ",mesocycle)
    return(
        <>
            { mesocycle.length ==0 ? <div>Loading...</div> :
                mesocycle.map((item:mesocycle)=>{
                    // return(
                    //     <div className="px-2  cursor-pointer bg-[#0d1117] border border-[#1e2530] rounded-2xl py-4" data-meso-id= {item.id} onClick={(e)=>Redirect(e)}>
                    //         <div>
                    //             <div>
                    //                 <div className="text-xl font-semibold">{item.name}</div>
                    //                 <div className="text-xs font-mono">Started: 2024-01-01</div>
                    //             </div>
                    //             <div className="flex gap-2 pt-2">
                    //                 <div className="font-medium font-light">0 sessions</div>
                    //                 <div className="font-medium font-light">{item._count.week} weeks</div>
                    //             </div>
                    //         </div>
                    //     </div>
                    // )
                    return (
                                <div
                                    className="flex items-center justify-between py-7 border-t border-[#161616] cursor-pointer group"
                                    data-meso-id={item.id}
                                    onClick={(e) => Redirect(e)}
                                >
                        
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="text-[26px] font-bold text-[#e8e8e8] group-hover:text-[#c8ff00] transition-colors"
                                            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                                        >
                                            {item.name}
                                        </span>
                                        
                                </div>

                                
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-[1px] bg-[#1e1e1e] relative">
                                        <div className="absolute left-0 top-0 h-full bg-[#c8ff00]" style={{ width: `${(item.completed / item._count.week) * 100}%` }} />
                                    </div>
                                    <span className="text-[11px] text-[#3a3a3a] tracking-wide">
                                        {item.completed} / {item._count.week}
                                    </span>
                                </div>
                            </div>

                            
                            <div className="flex items-center gap-9">
                                <div className="text-right">
                                    <div
                                        className="text-[40px] font-bold leading-none text-[#2a2a2a]"
                                        style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                                    >
                                        {item.total_session}
                                    </div>
                                    <div className="text-[9px] tracking-[0.2em] uppercase text-[#3a3a3a] mt-1">
                                        Sessions
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div
                                        className="text-[40px] font-bold leading-none text-white"
                                        style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                                    >
                                        {item._count.week}
                                    </div>
                                    <div className="text-[9px] tracking-[0.2em] uppercase text-[#3a3a3a] mt-1">
                                        Weeks
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete?.(item.id)
                                    }}
                                    disabled={deletingId === item.id}
                                    className="rounded border border-red-400/60 px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                                >
                                    {deletingId === item.id ? "Deleting" : "Delete"}
                                </button>

                                <div className="text-[#282828] group-hover:text-[#c8ff00] transition-colors">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )
                    
                })
                
            }
        </>
        
        
    )
}

export default Mesocycle;
