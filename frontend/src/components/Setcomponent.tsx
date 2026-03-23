

export default function SetComponent({ setdata, addsetData, exerciseid}: { exerciseid:number, setdata: Set, addsetData: (e:any, exerciseid:number, id:number)=>void }) {

    return (
        <div className="flex gap-6 items-center" >
            <div className="flex items-center w-full border-b border-[#2a2a2a] py-3 px-4 gap-8">
    
            <div className="w-16 flex-shrink-0">
                <span className="text-[13px] text-[#ccc] font-spaceMono">
                    Set <span className="font-bold text-white">{setdata.id}</span>
                </span>
            </div>

            <div className="flex-1">
                <input
                    onChange={(e) => addsetData(e, exerciseid, setdata.id)}
                    name="reps"
                    placeholder="reps"
                    value={setdata.reps}
                    className="bg-transparent text-white font-spaceMono text-[13px] w-full outline-none placeholder:text-[#555]"
                />
            </div>

            <div className="flex-1">
                <input
                    onChange={(e) => {
                        addsetData(e, exerciseid, setdata.id);
                        
                    }}
                    name="weight"
                    placeholder="weight"
                    value={setdata.weight}
                    className="bg-transparent text-white font-spaceMono text-[13px] w-full outline-none placeholder:text-[#555]"
                />
            </div>

            <div className="flex-1">
                <input
                    onChange={(e) => addsetData(e, exerciseid, setdata.id)}
                    data-setid={setdata.id}
                    name="rir"
                    placeholder="rir"
                    value={setdata.rir}
                    className="bg-transparent text-white font-spaceMono text-[13px] w-full outline-none placeholder:text-[#555]"
                />
            </div>

            <div   className="flex-shrink-0">
                <button data-setid={setdata.id} className="bg-transparent border-none text-neutral-500 cursor-pointer text-sm font-mono text-right transition-colors duration-150 hover:text-red-400">
                    Delete
                </button>
            </div>

        </div>
            
        </div>
    )
}