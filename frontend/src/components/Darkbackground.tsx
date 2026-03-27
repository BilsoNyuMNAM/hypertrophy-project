import Sessionsaved from "./Sessionsaved"
export default function Darkbackground({ onBackToSession }: { onBackToSession: () => void | Promise<void> }){
    return(
        <div className="h-screen w-screen bg-black fixed z-20 inset-0 flex items-center justify-center">
            <Sessionsaved onBackToSession={onBackToSession}/>
        </div>
    )
}
