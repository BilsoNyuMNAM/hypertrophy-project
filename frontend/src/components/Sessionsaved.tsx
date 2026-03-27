export default function Sessionsaved({ onBackToSession }: { onBackToSession: () => void | Promise<void> }){
    return(
        <div className="rounded-lg border border-[#2B292A] bg-[#1D1C1B] p-4 w-full max-w-md">
            <div className="flex justify-center items-center">
                <div className="h-12 w-12 rounded-full border border-[#FA7312] bg-[#372218] flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                        className="check-path"
                        d="M8 16l6 6 10-12"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    </svg>
                </div>
            </div>
            <div className="text-center">
                <span className="font-bebas text-2xl">Session Saved</span>
            </div>
            
            <button
                onClick={onBackToSession}
                className="px-2 py-3 border border-[#2B292A]  cursor-pointer bg-[#141514] rounded-lg font-spaceMono text-gray-400 text-xs"
            >
                BACK TO SESSIONS
            </button>

        </div>
    )
}
