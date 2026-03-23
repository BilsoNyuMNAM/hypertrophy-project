
import { useNavigate } from "react-router-dom"
export default function Addmesobutton(){
    const navigate = useNavigate()
    function Navigateto(){
        navigate("/create-mesocycle")
    }
    return(
         <button className=" bg-[#c8ff00] text-black  font-spaceMono text-[12px] tracking-wide px-5 py-2.5 rounded-full" onClick={Navigateto}>
            <span className="text-lg leading-none">+ Create Mesocycle</span>
         </button>
    )
}