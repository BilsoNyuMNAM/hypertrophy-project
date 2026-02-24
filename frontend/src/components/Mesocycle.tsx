import { useNavigate } from "react-router-dom"

type Item = {
    id: number;
    name:string,
    _count:{
        week:number;
    }
}
function Mesocycle({mesocycle}:{mesocycle:any}){
    const navigate = useNavigate()
    function Redirect(e:any){
        const mesoId = e.currentTarget.getAttribute("data-meso-id")
        
        navigate(`/mesocycle/display/${mesoId}`)
        console.log("mesoId",mesoId)
    }
    console.log("data being received",mesocycle)
    return(
        <>
            { mesocycle === "initial data" ? <div>Loading...</div> :
                mesocycle.map((item:Item)=>{
                    return(
                        <div className="px-2  cursor-pointer bg-[#0d1117] border border-[#1e2530] rounded-2xl py-4" data-meso-id= {item.id} onClick={(e)=>Redirect(e)}>
                            <div>
                                <div>
                                    <div className="text-xl font-semibold">{item.name}</div>
                                    <div className="text-xs font-mono">Started: 2024-01-01</div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <div className="font-medium font-light">0 sessions</div>
                                    <div className="font-medium font-light">{item._count.week} weeks</div>
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