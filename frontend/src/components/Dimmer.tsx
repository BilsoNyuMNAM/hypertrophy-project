import { useEffect, useRef, useState } from "react"
import Performance from "../pages/Performance"
import type { PerformanceSelection } from "../pages/Performance"
import Darkbackground from "./Darkbackground"
type DimmerProps = {
    setShowDimmer: React.Dispatch<React.SetStateAction<boolean>>
    musclesForPerformance: string[]
    onSaveSession: () => void | Promise<void>
    onBackToSession: () => void | Promise<void>
    onRatePerformance?: (muscleName: string, rating: PerformanceSelection) => void
}

export default function Dimmer({ setShowDimmer, musclesForPerformance, onSaveSession, onBackToSession, onRatePerformance }: DimmerProps){
    const [showDarkbackground, setshowDarkbackground] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const hasSavedSession = useRef(false)
    const hasPerformanceFlow = musclesForPerformance.length > 0

    async function saveSessionOnce() {
        if (hasSavedSession.current) return
        hasSavedSession.current = true
        setIsSaving(true)
        try {
            await onSaveSession()
            setSaveError("")
        } catch (error) {
            hasSavedSession.current = false
            setSaveError("Failed to save session. Please try again.")
            throw error
        } finally {
            setIsSaving(false)
        }
    }

    async function handlePerformanceConfirm() {
        try {
            await saveSessionOnce()
            setshowDarkbackground(true)
        } catch (error) {
            return
        }
    }

    useEffect(() => {
        if (hasPerformanceFlow) return

        saveSessionOnce()
            .then(() => {
                setshowDarkbackground(true)
            })
            .catch(() => {})
    }, [hasPerformanceFlow])
    
    return(
        <div>
            {
                !showDarkbackground ?
                    <div
                    onClick={()=>{setShowDimmer(false)}}
                    className=" h-full flex items-end  w-screen bg-black/50 fixed z-10 inset-0 backdrop-blur-xs">
                        <div onClick={(e) => e.stopPropagation()} className="w-full">
                            {
                                hasPerformanceFlow ?
                                    <Performance
                                        muscles={musclesForPerformance}
                                        onConfirm={handlePerformanceConfirm}
                                        onRate={onRatePerformance}
                                        isSaving={isSaving}
                                    /> :
                                    <div className="p-4 bg-[#1C1C1C] rounded-t-[20px] w-full">
                                        <p className="text-white font-spaceMono text-sm">{isSaving ? "Saving session..." : "Preparing session..."}</p>
                                        {
                                            saveError ? <p className="text-red-400 text-xs pt-2 font-spaceMono">{saveError}</p> : null
                                        }
                                        {
                                            saveError ?
                                                <button
                                                    onClick={() => {
                                                        saveSessionOnce().then(() => setshowDarkbackground(true)).catch(() => {})
                                                    }}
                                                    className="mt-3 p-2 border border-[#2a2a2a] rounded-lg text-xs font-spaceMono cursor-pointer"
                                                >
                                                    Retry Save
                                                </button> : null
                                        }
                                    </div>
                            }
                            {
                                hasPerformanceFlow && saveError ? <p className="text-red-400 text-xs px-4 py-2 font-spaceMono">{saveError}</p> : null
                            }
                        </div>
                    </div> : null
            }
            {
                showDarkbackground ? <Darkbackground onBackToSession={onBackToSession}/>:null
            }

        </div>
           )
}
