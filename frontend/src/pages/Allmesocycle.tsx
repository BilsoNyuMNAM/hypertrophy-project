import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Addmesobutton from "../components/Addmeso";
import Mesocycle from "../components/Mesocycle";
function Allmesocycle(){
    const [mesocycle, setMesocycle] = useState("initial data");
    async function fetchMesocycle(){
        const reponse = await  fetch("http://localhost:8787/api/v1/mesoCycle/all") // promise is returned
        const data = await reponse.json();
        return data;
    }
    useEffect(()=>{
        const mesoCycleData = async ()=>{
            const result = await fetchMesocycle();
            console.log(result.result) // [{}, {}, {}]
            setMesocycle(result.result);
        }
        mesoCycleData();
    },[])
    return(
        <div className="px-4 py-6 w-full h-screen bg-black text-white">
            <div className="w-full min-h-screen  max-w-5xl mx-auto"> 
                <div className="pb-4 border-b-2 border-black flex justify-between ali">
                    <div>
                        <h1 className="text-5xl font-bold text-white " style={{ fontFamily: "Bebas Neue" }}>MESOCYCLES</h1>
                        <p className="text-gray-400">Manage your training blocks and progress</p>
                    </div>
                    
                    <div>
                       <Addmesobutton/>
                    </div>
                </div >
                <div className="grid grid-cols-2 gap-4">
                    <Mesocycle mesocycle={mesocycle}/>
                </div>
            </div>  
        </div>
    )
}


export default Allmesocycle;