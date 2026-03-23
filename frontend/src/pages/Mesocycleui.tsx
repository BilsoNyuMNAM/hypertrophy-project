import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import VolumeOverview from "../components/Volumeoverview"
export default function Mesocycleui(){
    const {id} = useParams()
    
    const [mesoName, setMesoname] = useState("name")
    const [weekName, setWeekname] = useState([])
    const [totalSession, settotalSession] = useState(0)
    // const [selectedWeek, setSelectedWeek] = useState(1)
    useEffect(()=>{
        const result = async()=>{
            const response = await fetch(`http://localhost:8787/api/v1/mesoCycle/${id}`)
            return response 
        }

        const fetchedData = async ()=>{
            const jsm = await result()
            const jsonifieddata = await jsm.json() // "result":{"name":{}, "weekname":[{}, {}, {}]}
            setMesoname(jsonifieddata.result.name.name)
            setWeekname(jsonifieddata.result.weekname)
            settotalSession(jsonifieddata.result.totalsession)
        }

        fetchedData()   
    },[])
    
    const navigate = useNavigate()

    // return(
    //     <div className="w-full h-screen bg-black text-white overflow-y-auto">
    //         <div className="w-full h-screen max-w-5xl mx-auto mt-7 ">
    //             <div className="px-8 py-6">
    //                 <button onClick={() => navigate(-1)} className="mb-10">← Back to Mesocycles</button>
    //                 <div>
    //                     <div className="font-spaceMono color-[ #444] text-gray-400 font-thin text-xs">MESOCYCLE </div>
    //                     <div><span className="font-bebas text-5xl">{mesoName}</span></div>
    //                 </div>
    //             </div>
    //             <div>
    //                 <div className="px-8 py-6">
    //                     <svg width="100%" viewBox="0 0 800 80" xmlns="http://www.w3.org/2000/svg">
    //                 <defs>
    //                     <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
    //                     <stop offset="0%" stopColor="white" stopOpacity="0.04" />
    //                     <stop offset="100%" stopColor="white" stopOpacity="0" />
    //                     </linearGradient>
    //                 </defs>


    //                 <path
    //                     d="M 80 80 L 80 55 C 112 52, 176 47, 240 42 C 304 37, 336 34, 400 30 C 464 25, 496 11, 560 18 C 624 25, 688 55, 720 65 L 720 80 Z"
    //                     fill="url(#curveGradient)"
    //                 />


    //                 <path
    //                     d="M 80 55 C 112 52, 176 47, 240 42 C 304 37, 336 34, 400 30 C 464 25, 496 11, 560 18 C 624 25, 688 55, 720 65"
    //                     fill="none"
    //                     stroke="#333"
    //                     strokeWidth="1.5"
    //                 />


    //                 <text x="560" y="10" textAnchor="middle" fill="#444" fontSize="9"
    //                     fontFamily="monospace" letterSpacing="2">PEAK</text>



    //                 <circle cx="80" cy="55" r="5" fill="white" filter="url(#glow)" />

    //                 <circle cx="240" cy="42" r="4" fill="none" stroke="#333" strokeWidth="1.5" />

    //                 <circle cx="400" cy="30" r="4" fill="none" stroke="#333" strokeWidth="1.5" />

    //                 <circle cx="560" cy="18" r="4" fill="none" stroke="#333" strokeWidth="1.5" />
                    
    //                 <circle cx="720" cy="65" r="4" fill="none" stroke="#333" strokeWidth="1.5" />


    //                 <text x="80"  y="78" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">W1</text>
    //                 <text x="240" y="78" textAnchor="middle" fill="#333" fontSize="10" fontFamily="monospace">W2</text>
    //                 <text x="400" y="78" textAnchor="middle" fill="#333" fontSize="10" fontFamily="monospace">W3</text>
    //                 <text x="560" y="78" textAnchor="middle" fill="#333" fontSize="10" fontFamily="monospace">W4</text>
    //                 <text x="720" y="78" textAnchor="middle" fill="#333" fontSize="10" fontFamily="monospace">W5</text>


    //                 <defs>
    //                     <filter id="glow">
    //                     <feGaussianBlur stdDeviation="2.5" result="blur" />
    //                     <feMerge>
    //                         <feMergeNode in="blur" />
    //                         <feMergeNode in="SourceGraphic" />
    //                     </feMerge>
    //                     </filter>
    //                 </defs>
    //                     </svg>
    //                 </div>
    //                 <div className="px-8 py-6">
    //                     <VolumeOverview weekName={weekName} id={id}/>
    //                 </div>
                    
    //             </div>
    //         </div>
            
    //     </div>
    // )
    return (
    <div className="w-full min-h-screen bg-black text-white overflow-y-auto" style={{ fontFamily: "'Barlow', sans-serif" }}>
        <div className="w-full max-w-5xl mx-auto">

            <nav className="flex items-center justify-between px-12 py-7 border-b border-white/10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs tracking-widest text-gray-600 hover:text-gray-300 transition-colors"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    MESOCYCLES
                </button>
                
            </nav>

           
            <div className="px-12 pt-12">
                <div className="text-xs tracking-widest text-gray-600 mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    MESOCYCLE
                </div>
                <div className="font-bebas text-7xl leading-none text-white uppercase tracking-tight">
                    {mesoName}
                </div>

                
                <div className="flex items-center gap-8 mt-7">
                    {/* <div className="flex flex-col gap-1">
                        <span className="font-bebas text-4xl leading-none" style={{ color: '#c8ff00' }}>0</span>
                        <span className="text-xs tracking-widest text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>SESSIONS</span>
                    </div> */}
                    <div className="w-px h-9 bg-white/10" />
                    <div className="flex flex-col gap-1">
                        <div className="font-extrabold text-5xl text-[#c8ff00]">
                            {totalSession}
                        </div>
                        <span className="text-xs tracking-widest text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}> SESSIONS</span>
                    </div>

                    <div className="w-px h-9 bg-white/10" />
                    <div className="flex flex-col gap-1">
                        <div className="font-extrabold text-5xl text-white">
                            {weekName?.length == 0 ? "0" : weekName?.length} 
                        </div>
                        <span className="text-xs tracking-widest text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}> WEEKS</span>
                    </div>
                </div>
            </div>

            
            <div className="mx-12 my-10 h-px bg-white/10" />

           
            <div className="px-12">
                <div className="text-xs tracking-widest text-gray-600 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    VOLUME PROGRESSION
                </div>
                <svg width="100%" viewBox="0 0 800 90" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#c8ff00" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
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

                    
                    <circle cx="80" cy="55" r="7" fill="#c8ff00" filter="url(#glow)" />

                   
                    <circle cx="240" cy="42" r="4" fill="#111" stroke="#333" strokeWidth="1.5" />
                    <circle cx="400" cy="30" r="4" fill="#111" stroke="#333" strokeWidth="1.5" />
                    <circle cx="560" cy="18" r="4" fill="#111" stroke="#333" strokeWidth="1.5" />
                    <circle cx="720" cy="65" r="4" fill="#111" stroke="#333" strokeWidth="1.5" />

                    
                    <text x="80"  y="86" textAnchor="middle" fill="#c8ff00" fontSize="10" fontFamily="monospace">W1</text>
                    <text x="240" y="86" textAnchor="middle" fill="#333"    fontSize="10" fontFamily="monospace">W2</text>
                    <text x="400" y="86" textAnchor="middle" fill="#333"    fontSize="10" fontFamily="monospace">W3</text>
                    <text x="560" y="86" textAnchor="middle" fill="#333"    fontSize="10" fontFamily="monospace">W4</text>
                    <text x="720" y="86" textAnchor="middle" fill="#333"    fontSize="10" fontFamily="monospace">W5</text>
                </svg>
            </div>
            <div className="px-12 mt-10 pb-16">
                    <VolumeOverview weekName={weekName} id={id} />
            </div>

        </div>
    </div>
);

}