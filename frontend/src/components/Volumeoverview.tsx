import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import VolumeGraph from "./VolumeGraph"

type Week = {
    id: number | string
    week_name: string
    mesocycleId?: number
    unlocked?: boolean
    startingVolumeCount?: number
}

type WeekSelection = {
    weekId: string
    weekNumber: number
    isFinalWeek: boolean
}

export default function VolumeOverview({
    weekName,
    id,
    onWeekChange,
}: {
    weekName: Week[] | null
    id: string
    onWeekChange?: (selection: WeekSelection) => void
}) {
    const navigate = useNavigate()
    const [weeknumber, setWeeknumber] = useState(1)
    const [weekvolume, setWeekvolume] = useState(null)
    const [weekid, setWeekid] = useState<string | null>(null)

    const sortedWeeks = useMemo(() => {
        if (!weekName || weekName.length === 0) return []

        return [...weekName].sort((a, b) => {
            const numA = parseInt(a.week_name.replace(/\D/g, ""), 10) || 0
            const numB = parseInt(b.week_name.replace(/\D/g, ""), 10) || 0
            return numA - numB
        })
    }, [weekName])

    async function getWeekvolume(wid: string) {
        const result = await fetch(`http://localhost:8787/api/v1/mesoCycle/volume/${wid}`)
        const jsonified = await result.json()
        setWeekvolume(jsonified.volume)
    }

    function selectWeek(week: Week, index: number) {
        const resolvedWeekId = String(week.id)
        const weekNum = index + 1
        const isFinal = weekNum === sortedWeeks.length

        setWeeknumber(weekNum)
        setWeekid(resolvedWeekId)
        getWeekvolume(resolvedWeekId)
        onWeekChange?.({
            weekId: resolvedWeekId,
            weekNumber: weekNum,
            isFinalWeek: isFinal,
        })
    }

    useEffect(() => {
        if (sortedWeeks.length === 0) return

        const highestUnlockedIndex = sortedWeeks.reduce((latest, week, index) => {
            return week.unlocked ? index : latest
        }, -1)

        const defaultIndex = highestUnlockedIndex >= 0 ? highestUnlockedIndex : 0
        selectWeek(sortedWeeks[defaultIndex], defaultIndex)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedWeeks.length])

    function handleWeekSelect(week: Week, index: number) {
        if (!week.unlocked) return
        selectWeek(week, index)
    }

    return (
        <div>
            <div className="mb-7">
                {weekName == null ? (
                    "Loading..."
                ) : weekName.length === 0 ? (
                    "No weeks found"
                ) : (
                    <div className="flex gap-3">
                        {sortedWeeks.map((week, index) => {
                            const isActive = weeknumber === index + 1
                            const isLocked = !week.unlocked

                            return (
                                <div
                                    key={week.id}
                                    data-weekId={week.id}
                                    onClick={() => handleWeekSelect(week, index)}
                                    className={`
                                        group relative overflow-hidden rounded-lg
                                        border transition-all duration-200
                                        font-spaceMono text-xs tracking-wider px-7 py-3.5
                                        ${isLocked
                                            ? "border-neutral-800/50 text-neutral-600 cursor-not-allowed opacity-60"
                                            : isActive
                                                ? "border-[#c8ff00] text-white bg-[rgba(200,255,0,0.08)] cursor-pointer"
                                                : "border-neutral-800 text-neutral-500 hover:text-neutral-200 hover:border-neutral-500 cursor-pointer"
                                        }
                                    `}
                                >
                                    {isLocked && (
                                        <div className="
                                            absolute -top-10 left-1/2 -translate-x-1/2
                                            px-3 py-1.5 rounded-md
                                            bg-neutral-800 border border-neutral-700
                                            text-neutral-400 text-[10px] tracking-wide
                                            opacity-0 group-hover:opacity-100
                                            transition-opacity duration-200
                                            pointer-events-none whitespace-nowrap
                                            z-10
                                        ">
                                            Complete previous week to unlock
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-800 border-r border-b border-neutral-700 rotate-45" />
                                        </div>
                                    )}

                                    <span
                                        className={`
                                            absolute bottom-0 left-0 h-[2px] bg-[#c8ff00]
                                            transition-all duration-200
                                            ${isActive && !isLocked ? "w-full" : "w-0"}
                                        `}
                                    />

                                    <span className="flex items-center gap-2">
                                        {week.week_name}
                                        {isLocked && (
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="text-neutral-600"
                                            >
                                                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                                                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-white text-base font-semibold">
                        Week {weeknumber} - Volume Overview
                    </p>
                    <button
                        data-weekId={weekid}
                        disabled={!weekid}
                        onClick={() => navigate(`/mesocycle/week/${weekid}/?mesoId=${id}`)}
                        className="flex items-center gap-2 text-xs tracking-widest transition-all duration-200 hover:gap-3 text-[#c8ff00] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                        GO TO WEEK {weeknumber}
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7h8M8 4l3 3-3 3" stroke="#c8ff00" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="border rounded-lg border-[#3C3F40] bg-[#090B0D]">
                    <VolumeGraph weekvolume={weekvolume} />
                </div>
            </div>
        </div>
    )
}
