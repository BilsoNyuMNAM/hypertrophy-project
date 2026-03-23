const sorenessOptions = [
  { level: 1, label: "No Soreness" },
  { level: 2, label: "Healed Well" },
  { level: 3, label: "Just in time" },
  { level: 4, label: "Still sore" },
];
type SorenessData = { level: number; label: string } | null;
type setter = React.Dispatch<React.SetStateAction<SorenessData>>
export default function Feedback({ musclename, setSorenessLog, sorenessLog }: { musclename: string; setSorenessLog: setter; sorenessLog: SorenessData }) {
    console.log("Feedback component:", sorenessLog)
  return (
    <div>
      <div className="p-5 border-2 border-[rgb(201,106,0)] rounded-xl bg-[rgba(180,80,0,0.18)]">
        <div className="text-[rgb(245,160,48)]">
          <p>2nd {musclename} Session this week</p>
        </div>
        <div className="text-white mb-3">
          <p>Trained on Day 1. Rate your soreness going into this session:</p>
        </div>
        <div className="flex gap-2">
          {sorenessOptions.map(({ level, label }) => (
            <button
              key={level}
              onClick={() => setSorenessLog({ level, label })}
              className="border cursor-pointer rounded-lg py-3 px-4 flex flex-col border-[rgb(58,58,60)] bg-[rgb(28,28,30)]"
            >
              <span>{level}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}