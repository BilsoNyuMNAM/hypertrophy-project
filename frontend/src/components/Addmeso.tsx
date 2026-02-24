
import { useNavigate } from "react-router-dom"
export default function Addmesobutton(){
    const navigate = useNavigate()
    function Navigateto(){
        navigate("/create-mesocycle")
    }
    return(
         <button className="px-4 py-2.5 border-2 rounded-lg cursor-pointer"onClick={Navigateto}>+ Create Mesocycle</button>
    )
}