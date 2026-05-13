import { useEffect, useState } from "react";
import Addmesobutton from "../components/Addmeso";
import Mesocycle from "../components/Mesocycle";

type MesocycleRow = {
    id: number
    name: string
    completed: number
    total_session: number
    _count: {
        week: number
    }
}

function Allmesocycle(){
    const [mesocycle, setMesocycle] = useState<MesocycleRow[]>([]);
    const [deletingId, setDeletingId] = useState<number | null>(null)
    async function fetchMesocycle(){
        console.log("fetching function has been trigerred")
        const reponse = await  fetch("http://localhost:8787/api/v1/mesoCycle/all") // promise is returned
        const data = await reponse.json();
        return data;
    }
    useEffect(()=>{
        const mesoCycleData = async ()=>{
            const result = await fetchMesocycle();
            console.log(result.data) // [{}, {}, {}] each {} represents a mesocycle with its detail 
            setMesocycle(result.data);
        }
        mesoCycleData();
    },[])

    async function handleDeleteMesocycle(mesocycleId: number) {
        if (deletingId !== null) return
        setDeletingId(mesocycleId)

        try {
            const response = await fetch(`http://localhost:8787/api/v1/mesoCycle/${mesocycleId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                console.error("Failed to delete mesocycle")
                return
            }

            setMesocycle((prev) => prev.filter((item) => item.id !== mesocycleId))
        } catch (error) {
            console.error("Failed to delete mesocycle", error)
        } finally {
            setDeletingId(null)
        }
    }
    // return(
    //     <div className="px-4 py-6 w-full h-screen bg-black text-white">
    //         <div className="w-full min-h-screen  max-w-5xl mx-auto"> 
    //             <div className="pb-4 border-b-2 border-black flex justify-between ali">
    //                 <div>
    //                     <h1 className="text-5xl font-bold text-white " style={{ fontFamily: "Bebas Neue" }}>MESOCYCLES</h1>
    //                     <p className="text-gray-400">Manage your training blocks and progress</p>
    //                 </div>
                    
    //                 <div>
    //                    <Addmesobutton/>
    //                 </div>
    //             </div >
    //             <div className="grid grid-cols-2 gap-4">
    //                 <Mesocycle mesocycle={mesocycle}/>
    //             </div>
    //         </div>  
    //     </div>
    // )
    return (
    <div className="px-10 w-full min-h-screen bg-[#0a0a0a] text-white">
        <div className="w-full max-w-5xl mx-auto">

            
            <div className="flex justify-between items-center py-7 border-b border-[#161616]">
                <h1
                    className="text-[15px] font-bold tracking-[0.25em] uppercase text-white"
                    style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                >
                    Mesocycles
                </h1>
                <Addmesobutton />
            </div>

           
            <div className="pt-14 pb-12">
                <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-[#555] mb-5">
                    Training
                </p>
                <h2
                    className="text-[88px] leading-[0.88] font-bold"
                    style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                >
                    <span className="text-white block">Your</span>
                    <span className="text-[#2a2a2a] block">Mesocycles</span>
                </h2>
            </div>

            <div className="flex flex-col">
                <Mesocycle
                    mesocycle={mesocycle}
                    onDelete={handleDeleteMesocycle}
                    deletingId={deletingId}
                />
            </div>

        </div>
    </div>
)
}


export default Allmesocycle;
