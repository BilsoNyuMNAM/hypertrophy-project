import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import VolumeOverview from "../components/Volumeoverview"

type WeekData = {
    id: number
    week_name: string
    mesocycleId: number
    unlocked: boolean
    startingVolumeCount: number
}

export default function Mesocycleui(){
    const {id} = useParams()
    const navigate = useNavigate()
    const{data} = useQuery({
        queryKey:['mesoCycledata', id], //the cache box  //react use it to cache and find data later //imagine id as differnt slot in a boz
        //['mesoCycledata', id] means — "cache this data under the name mesoCycledata, but separately for each unique id"
        queryFn: async function(){
            const result = await fetch(`http://localhost:8787/api/v1/mesoCycle/${id}`)
            return await result.json();
        }
    })
    
  
    const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
    const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null)
    const [selectedWeekIsFinal, setSelectedWeekIsFinal] = useState(false)
    const [isCalculating, setIsCalculating] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const [calculateMessage, setCalculateMessage] = useState("")
    const [calculateErrors, setCalculateErrors] = useState<string[]>([])


    async function handleCalculateNextWeek() {
        if (!selectedWeekId || selectedWeekIsFinal || isCalculating) return

        setIsCalculating(true)
        setCalculateMessage("")
        setCalculateErrors([])

        try {
            const response = await fetch(
                `http://localhost:8787/api/v1/mesoCycle/week/calculate-next/${selectedWeekId}`,
                {
                    method: "POST",
                }
            )
            const data = await response.json()

            if (!response.ok) {
                const errors = Array.isArray(data.errors)
                    ? data.errors.map((error: { message?: string }) => error.message || "Incomplete data found")
                    : []

                setCalculateErrors(errors)
                setCalculateMessage(data.message || "Unable to calculate next week volume.")
                return
            }

            setCalculateMessage("Next week volume calculated and unlocked successfully.")
            await fetchMesocycleData()
        } catch (error) {
            setCalculateMessage("Failed to calculate next week volume.")
        } finally {
            setIsCalculating(false)
        }
    }

    async function handleResetFromSelectedWeek() {
        if (!selectedWeekId || isResetting || selectedWeekNumber === 1) return

        setIsResetting(true)
        setCalculateMessage("")
        setCalculateErrors([])

        try {
            const response = await fetch(
                `http://localhost:8787/api/v1/mesoCycle/week/reset-from/${selectedWeekId}`,
                {
                    method: "POST",
                }
            )
            const data = await response.json()

            if (!response.ok) {
                setCalculateMessage(data.message || "Unable to reset from selected week.")
                return
            }

            setCalculateMessage("Reset complete. Selected week and following weeks are now locked.")
            await fetchMesocycleData()
        } catch (error) {
            setCalculateMessage("Failed to reset from selected week.")
        } finally {
            setIsResetting(false)
        }
    }
    
    

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
                    {data?.result.name.name || "Mesocycle Name"}
                </div>

                
                <div className="flex items-center gap-8 mt-7">
                    {/* <div className="flex flex-col gap-1">
                        <span className="font-bebas text-4xl leading-none" style={{ color: '#c8ff00' }}>0</span>
                        <span className="text-xs tracking-widest text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>SESSIONS</span>
                    </div> */}
                    <div className="w-px h-9 bg-white/10" />
                    <div className="flex flex-col gap-1">
                        <div className="font-extrabold text-5xl text-[#c8ff00]">
                            {data?.result.totalsession || 0}
                        </div>
                        <span className="text-xs tracking-widest text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}> SESSIONS</span>
                    </div>

                    <div className="w-px h-9 bg-white/10" />
                    <div className="flex flex-col gap-1">
                        <div className="font-extrabold text-5xl text-white">
                            {data?.result.weekname?.length == 0 ? "0" : data?.result.weekname?.length}
                        </div>
                        <span className="text-xs tracking-widest text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}> WEEKS</span>
                    </div>
                </div>
            </div>

            
            <div className="mx-12 my-10 h-px bg-white/10" />

           
            
            <div className="px-12 mt-10 pb-16">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleCalculateNextWeek}
                            disabled={selectedWeekIsFinal || isCalculating || !selectedWeekId}
                            className="inline-flex items-center justify-center rounded-md border border-[#c8ff00] px-4 py-2 text-xs tracking-widest text-[#c8ff00] transition-colors hover:bg-[#c8ff00] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#c8ff00]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {selectedWeekIsFinal
                                ? "MESOCYCLE COMPLETE"
                                : isCalculating
                                    ? "CALCULATING..."
                                    : "CALCULATE VOLUME FOR NEXT WEEK"}
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFromSelectedWeek}
                            disabled={isResetting || !selectedWeekId || selectedWeekNumber === 1}
                            className="inline-flex items-center justify-center rounded-md border border-red-400/70 px-4 py-2 text-xs tracking-widest text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {isResetting ? "RESETTING..." : "RESET FROM SELECTED WEEK"}
                        </button>
                    </div>
                    {calculateMessage ? (
                        <div className="mb-4 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-300">
                            {calculateMessage}
                        </div>
                    ) : null}
                    {calculateErrors.length > 0 ? (
                        <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                            {calculateErrors.map((error, index) => (
                                <div key={`${error}-${index}`}>{error}</div>
                            ))}
                        </div>
                    ) : null}
                    <VolumeOverview
                        weekName={data?.result.weekname || []}
                        id={id || ""}
                        onWeekChange={({ weekId, weekNumber, isFinalWeek }) => {
                            setSelectedWeekId(weekId)
                            setSelectedWeekNumber(weekNumber)
                            setSelectedWeekIsFinal(isFinalWeek)
                            setCalculateMessage("")
                            setCalculateErrors([])
                        }}
                    />
            </div>

        </div>
    </div>
);

}
