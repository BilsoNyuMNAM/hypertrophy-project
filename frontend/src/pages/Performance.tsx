import { useMemo, useState } from "react"

const PERFORMANCE_OPTIONS = [
    {
        score: 1,
        label: "Exceed targets easily"
    },
    {
        score: 2,
        label: "Hit targets as planned"
    },
    {
        score: 3,
        label: "Struggled to hit targets"
    },
    {
        score: 4,
        label: "Couldn't match previous week"
    }
] as const

const RATING_THEME: Record<number, { color: string; background: string; shadow: string }> = {
    1: { color: "#22c55e", background: "rgba(34,197,94,0.13)", shadow: "rgba(34,197,94,0.42)" },
    2: { color: "#eab308", background: "rgba(234,179,8,0.14)", shadow: "rgba(234,179,8,0.40)" },
    3: { color: "#f97316", background: "rgba(249,115,22,0.14)", shadow: "rgba(249,115,22,0.42)" },
    4: { color: "#ef4444", background: "rgba(239,68,68,0.14)", shadow: "rgba(239,68,68,0.42)" }
}

export type PerformanceSelection = {
    score: number
    label: string
}

type PerformanceProps = {
    muscles?: string[]
    onConfirm?: () => void | Promise<void>
    onRate?: (muscleName: string, rating: PerformanceSelection) => void
    isSaving?: boolean
}

export default function Performance({ muscles = [], onConfirm, onRate, isSaving = false }: PerformanceProps) {
    const [selectedRatings, setSelectedRatings] = useState<Record<string, PerformanceSelection>>({})
    const musclesToRate = useMemo(() => muscles.filter(Boolean), [muscles])
    const ratedCount = musclesToRate.reduce((count, muscle) => (selectedRatings[muscle] ? count + 1 : count), 0)
    const allRated = musclesToRate.length > 0 && ratedCount === musclesToRate.length

    function handleRatingSelect(muscleName: string, rating: PerformanceSelection) {
        setSelectedRatings((prev) => ({ ...prev, [muscleName]: rating }))
        onRate?.(muscleName, rating)
    }

    if (musclesToRate.length === 0) {
        return (
            <div className="p-4 bg-[#1C1C1C] rounded-t-[20px] w-full">
                <div className="flex flex-col gap-1 mb-2">
                    <span className="text-white font-bold font-bebas">Session Complete</span>
                    <span className="text-gray-400 font-spaceMono text-xs">No soreness feedback muscle needs performance rating.</span>
                </div>
                <div className="p-4 bg-[#f97316] rounded-lg mt-3 text-center">
                    <button
                        onClick={onConfirm}
                        className="font-spaceMono text-sm cursor-pointer"
                    >
                        {isSaving ? "SAVING SESSION..." : "CONFIRM AND SAVE SESSION"}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 bg-[#1C1C1C] rounded-t-[20px] w-full max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-1 mb-3">
                <span className="text-white font-bold font-bebas">Session Complete</span>
                <span className="text-gray-400 font-spaceMono text-xs">
                    Rate performance for every muscle that showed soreness feedback.
                </span>
            </div>

            <div className="flex flex-col gap-4">
                {
                    musclesToRate.map((muscleName) => {
                        const selected = selectedRatings[muscleName]
                        const selectedTheme = selected ? RATING_THEME[selected.score] : null

                        return (
                            <div key={muscleName} className="border border-[#2a2a2a] rounded-xl p-3">
                                <p className="text-[rgb(245,160,48)] font-bold mb-3 text-sm font-spaceMono">
                                    {muscleName.toUpperCase()}-PERFORMANCE
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-spaceMono">
                                    {
                                        PERFORMANCE_OPTIONS.map(({ score, label }) => {
                                            const isSelected = selected?.score === score
                                            const theme = RATING_THEME[score]

                                            return (
                                                <button
                                                    key={`${muscleName}-${score}`}
                                                    onClick={() => handleRatingSelect(muscleName, { score, label })}
                                                    className="relative border cursor-pointer rounded-lg py-3 px-4 flex flex-col items-start text-left transition-all duration-200"
                                                    style={{
                                                        color: isSelected ? "#f8fafc" : "#9ca3af",
                                                        borderColor: isSelected ? theme.color : "rgb(58,58,60)",
                                                        background: isSelected ? theme.background : "rgb(28,28,30)",
                                                        boxShadow: isSelected ? `0 0 0 1px ${theme.color}, 0 0 20px ${theme.shadow}` : "none"
                                                    }}
                                                >
                                                    {
                                                        isSelected ?
                                                            <span
                                                                className="performance-check-badge absolute -top-2 -right-2 h-5 w-5 rounded-full text-[11px] flex items-center justify-center font-bold"
                                                                style={{ background: theme.color, color: "#0f172a" }}
                                                            >
                                                                ✓
                                                            </span> : null
                                                    }
                                                    <span className="font-bold">{score}</span>
                                                    <span>{label}</span>
                                                </button>
                                            )
                                        })
                                    }
                                </div>

                                {
                                    selected && selectedTheme ?
                                        <div
                                            className="performance-rating-summary mt-2 rounded-lg px-3 py-2 text-xs font-spaceMono border"
                                            style={{ borderColor: selectedTheme.color, background: selectedTheme.background }}
                                        >
                                            <span className="font-bold">Score {selected.score}</span> • <span>{selected.label}</span>
                                        </div> : null
                                }
                            </div>
                        )
                    })
                }
            </div>

            <div className="mt-4">
                <p className="text-[11px] text-gray-400 font-spaceMono mb-2">
                    {ratedCount}/{musclesToRate.length} muscles rated
                </p>
                <div className="p-4 bg-[#f97316] rounded-lg text-center">
                    <button
                        onClick={onConfirm}
                        disabled={!allRated || isSaving}
                        className="font-spaceMono text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? "SAVING SESSION..." : "CONFIRM AND SAVE SESSION"}
                    </button>
                </div>
            </div>
        </div>
    )
}
