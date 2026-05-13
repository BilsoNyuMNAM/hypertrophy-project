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
    // showDarkbackground is ONLY set to true after a successful backend response
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
            // Only show Sessionsaved after backend confirms
            setshowDarkbackground(true)
        } catch (error) {
            return
        }
    }

    useEffect(() => {
        if (hasPerformanceFlow) return
        // No performance flow: auto-save, but only show Sessionsaved after backend responds
        saveSessionOnce()
            .then(() => {
                setshowDarkbackground(true)
            })
            .catch(() => {})
    }, [hasPerformanceFlow])

    // Once backend has confirmed, show Sessionsaved fullscreen
    if (showDarkbackground) {
        return <Darkbackground onBackToSession={onBackToSession} />
    }

    return (
        <div
            onClick={() => { if (!isSaving) setShowDimmer(false) }}
            className="h-full flex items-end w-screen bg-black/50 fixed z-10 inset-0 backdrop-blur-xs"
        >
            <div onClick={(e) => e.stopPropagation()} className="w-full">
                {
                    hasPerformanceFlow ? (
                        <>
                            <Performance
                                muscles={musclesForPerformance}
                                onConfirm={handlePerformanceConfirm}
                                onRate={onRatePerformance}
                                isSaving={isSaving}
                            />
                            {
                                saveError
                                    ? <p className="text-red-400 text-xs px-4 py-2 font-spaceMono">{saveError}</p>
                                    : null
                            }
                        </>
                    ) : (
                        // No performance flow: show a loading state while waiting for backend
                        <div className="p-6 bg-[#1C1C1C] rounded-t-[20px] w-full flex flex-col items-center gap-4">
                            {
                                isSaving ? (
                                    <>
                                        <div className="h-8 w-8 rounded-full border-2 border-[#f97316] border-t-transparent animate-spin" />
                                        <p className="text-white font-spaceMono text-sm">Saving session...</p>
                                    </>
                                ) : saveError ? (
                                    <>
                                        <p className="text-red-400 text-xs font-spaceMono">{saveError}</p>
                                        <button
                                            onClick={() => {
                                                hasSavedSession.current = false
                                                saveSessionOnce()
                                                    .then(() => setshowDarkbackground(true))
                                                    .catch(() => {})
                                            }}
                                            className="mt-1 px-4 py-2 border border-[#2a2a2a] rounded-lg text-xs font-spaceMono cursor-pointer hover:border-[#f97316] hover:text-[#f97316] transition-colors"
                                        >
                                            Retry Save
                                        </button>
                                    </>
                                ) : (
                                    // Brief initialising state before useEffect kicks in
                                    <>
                                        <div className="h-8 w-8 rounded-full border-2 border-[#f97316] border-t-transparent animate-spin" />
                                        <p className="text-white font-spaceMono text-sm">Preparing session...</p>
                                    </>
                                )
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}
