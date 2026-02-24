

   type Frequency = { [key: string]: number }

   export default function Frequencycard({
       frequency,
       setFrequency
   }: {
       frequency: Frequency[]
       setFrequency: (value: React.SetStateAction<Frequency[]>) => void
   }) {
       const frequencyOptions = [2, 3, 4, 5, 6]

       const handleSelect = (muscleName: string, option: number) => {
           setFrequency(prev =>
               prev.map(muscle =>
                   Object.keys(muscle)[0] === muscleName ? { [muscleName]: option } : muscle
               )
           )
       }

       return (
           <>
               {frequency.map((muscle) => {
                   const muscleName = Object.keys(muscle)[0]
                   const selectedValue = muscle[muscleName]
                   return (
                       <div className="flex gap-3 p-3 justify-between items-center w-full">
                           <div>
                               <span>{muscleName}</span>
                           </div>
                           <div className="pb-3 flex gap-2 items-center justify-center">
                               {frequencyOptions.map((option) => (
                                   <button
                                       className={`w-8 h-8 rounded text-xs font-medium ${
                                           selectedValue === option
                                               ? "bg-blue-500 text-white"
                                               : "bg-gray-200 text-gray-800"
                                       }`}
                                       onClick={() => handleSelect(muscleName, option)}
                                   >
                                       {option}
                                   </button>
                               ))}
                           </div>
                       </div>
                   )
               })}
           </>
       )
   }