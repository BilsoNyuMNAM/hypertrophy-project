
// type week = {
//     "id": string,
//     "week_name": string,
//     "meso_cycle_id": string
// }

export default function Weekcard({week_name}:{week_name:string}){
    console.log("data received on weekcard", week_name)
    return(
        <div className="border rounded-r-lg border-[rgb(36,36,36)] font-dmSans cursor-pointer">
            <div className="p-4">
                <div className="text-[rgb(204,204,204)]  font-semibold">{week_name}</div>
                <div>
                    <div>
                        <p>Back</p>
                        <progress max={10} value={3}/>
                    </div>
                    <div>
                        <p>Chest</p>
                        <progress max={10} value={7}/>
                    </div>
                    <div>
                        <p>Legs</p>
                        <progress max={10} value={2}/>
                    </div>
                </div>
                <div>No of session completed </div>
            </div>
        </div>
    )
}