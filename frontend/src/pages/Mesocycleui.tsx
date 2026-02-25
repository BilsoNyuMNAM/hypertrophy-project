import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import VolumeOverview from "../components/Volumeoverview"
export default function Mesocycleui(){
    const {id} = useParams()
    const [mesoName, setMesoname] = useState("name")
    const [weekName, setWeekname] = useState(null)
    useEffect(()=>{
        const result = async()=>{
            const response = await fetch(`http://localhost:8787/api/v1/mesoCycle/${id}`)
            return response 
        }

        const fetchedData = async ()=>{
            const jsm = await result()
            const jsonifieddata = await jsm.json() // "result":{"name":{}, "weekname":[{}, {}, {}]}
            console.log("data from mesocycleui", jsonifieddata)
             console.log("weekname value:", jsonifieddata.result.weekname) //[{},{},{}]
            setMesoname(jsonifieddata.result.name.name)
            setWeekname(jsonifieddata.result.weekname)
        }

        fetchedData()   
    },[])
    console.log("id hook", id)
    const navigate = useNavigate()

    return(
        <div className="w-full h-screen bg-black text-white overflow-y-auto">
            <div className="w-full h-screen max-w-5xl mx-auto mt-7 ">
                <div className="px-8 py-6">
                    <button onClick={() => navigate(-1)} className="mb-10">← Back to Mesocycles</button>
                    <div>
                        <div className="font-spaceMono color-[ #444] text-gray-400 font-thin text-xs">MESOCYCLE </div>
                        <div><span className="font-bebas text-5xl">{mesoName}</span></div>
                    </div>
                </div>
                <div>
                    <div className="px-8 py-6">
                        <svg width="100%" viewBox="0 0 800 80" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.04" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                    </defs>


                    <path
                        d="M 80 80 L 80 55 C 112 52, 176 47, 240 42 C 304 37, 336 34, 400 30 C 464 25, 496 11, 560 18 C 624 25, 688 55, 720 65 L 720 80 Z"
                        fill="url(#curveGradient)"
                    />


                    <path
                        d="M 80 55 C 112 52, 176 47, 240 42 C 304 37, 336 34, 400 30 C 464 25, 496 11, 560 18 C 624 25, 688 55, 720 65"
                        fill="none"
                        stroke="#333"
                        strokeWidth="1.5"
                    />


                    <text x="560" y="10" textAnchor="middle" fill="#444" fontSize="9"
                        fontFamily="monospace" letterSpacing="2">PEAK</text>



                    <circle cx="80" cy="55" r="5" fill="white" filter="url(#glow)" />

                    <circle cx="240" cy="42" r="4" fill="none" stroke="#333" strokeWidth="1.5" />

                    <circle cx="400" cy="30" r="4" fill="none" stroke="#333" strokeWidth="1.5" />

                    <circle cx="560" cy="18" r="4" fill="none" stroke="#333" strokeWidth="1.5" />
                    
                    <circle cx="720" cy="65" r="4" fill="none" stroke="#333" strokeWidth="1.5" />


                    <text x="80"  y="78" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">W1</text>
                    <text x="240" y="78" textAnchor="middle" fill="#333" fontSize="10" fontFamily="monospace">W2</text>
                    <text x="400" y="78" textAnchor="middle" fill="#333" fontSize="10" fontFamily="monospace">W3</text>
                    <text x="560" y="78" textAnchor="middle" fill="#333" fontSize="10" fontFamily="monospace">W4</text>
                    <text x="720" y="78" textAnchor="middle" fill="#333" fontSize="10" fontFamily="monospace">W5</text>


                    <defs>
                        <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                        </filter>
                    </defs>
                        </svg>
                    </div>
                    <div className="px-8 py-6">
                        <VolumeOverview weekName={weekName}/>
                    </div>
                    
                </div>
            </div>
            
        </div>
    )
}