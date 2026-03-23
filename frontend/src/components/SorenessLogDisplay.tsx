export default function SorenessLogDisplay({ level, label }: { level: number; label: string }) {
  return (
    <div className="mt-2 p-4 border border-[rgb(201,106,0)] rounded-lg">
      <p>
        <span className="font-bold text-[rgb(245,160,48)]">Soreness logged:</span>{" "}
        Score-{level} {label}
      </p>
    </div>
  );
}
