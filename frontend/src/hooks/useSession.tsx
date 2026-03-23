import { useState, useEffect } from "react"

export function useSession({sessionId, weekId, mesoId}:{sessionId:string, weekId:string, mesoId:string}){
    const [sessionName, setSessionName] = useState("")
    const [addexercise, setAddexercise] = useState([])
    const [apiCall, setApiCall] = useState(new Set());
        const MUSCLE_COLORS = {
        "legs": "#4ade80", "glutes": "#4ade80",
        "calves": "#4ade80", "abductors": "#4ade80", "chest": "#60a5fa",
        "traps": "#a78bfa", "rear delts": "#a78bfa", "front delts": "#a78bfa","side delts": "#f59e0b", "biceps": "#f59e0b", "triceps": "#f87171","forearms": "#f87171", "abs": "#f87171"};
    useEffect(()=>{
        getSessionname()
    },[])

    function getSessionname(){
        const url = `http://localhost:8787/api/v1/mesoCycle/session/${sessionId}`
        fetch(url)
        .then((res)=>{
            res.json().then((data)=>{
                setSessionName(data.session_name)
                console.log("session data", data.eachexercise)
                setAddexercise(data.eachexercise)
                const result = data.eachexercise.map((exercise, index)=>{
                    
                    return {
                        ...exercise, 
                        id: index+1, 
                        set: exercise.set.map((set, index)=>
                        {
                            return{
                                ...set, id: index+1
                            }
                        }),
                        // Preserve soreness and performance feedback from backend
                        ...(exercise.soreness && { soreness: exercise.soreness }),
                        ...(exercise.performance && { performance: exercise.performance })
                    }
                })
                setAddexercise(result)
            })
        })
    }

    function Addexercise(){
        //@ts-ignore
        setAddexercise([...addexercise, {
            "id":addexercise.length +1, 
            "exercise_name":"",
            "muscletrained":"",
            "set":[]
             
        }])
    }

    async function Selecttrainedmuscle(id?:number, musclename?:string){
        if (!musclename) {
            const newaddexercise = addexercise.map(exercise => {
                //@ts-ignore
                if (exercise.id === id) {
                    const { soreness, performance, ...rest } = exercise as any;
                    return { ...rest, muscletrained: "" };
                }
                return exercise;
            });
            setAddexercise(newaddexercise);
            return;
        }

        const isMultiple = addexercise.some((ex: any) => ex.id !== id && ex.muscletrained === musclename);

        let showFeedback = false;
        if (!isMultiple) {
            try {
                const url = `http://localhost:8787/api/v1/mesoCycle/frequency/muscle?muscleName=${encodeURIComponent(musclename)}&weekId=${weekId}&mesoId=${mesoId}`;
                const result = await fetch(url);
                const data = await result.json();
                showFeedback = data.showSorenessFeedback;
            } catch (e) {
                console.error(e);
            }
        }

        const newaddexercise = addexercise.map(exercise => {
            //@ts-ignore
            if (exercise.id === id) {
                if (showFeedback) {
                    return { ...exercise, muscletrained: musclename, soreness: null, performance: null };
                } else {
                    const { soreness, performance, ...rest } = exercise as any;
                    return { ...rest, muscletrained: musclename };
                }
            }
            return exercise;
        });
        setAddexercise(newaddexercise);
    }

    function submitSession(){
        const url = `http://localhost:8787/api/v1/mesoCycle/session/add/set/${sessionId}`
        fetch(url,{
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sessionData:addexercise
            })
        })
    }


    function exerciseName(e:any, id?:number){
        const {name, value} = e.target
        
        const result = addexercise.map(exercise => {
            if(exercise.id === id){
                return{
                    ...exercise, [name]: value
                }
             }
             return exercise

        }   
        )

        setAddexercise(result)
    }
    
    
    function addsetData(e: any, exerciseid: number, id:number) {
        const { name, value } = e.target;
        
        const result :any = addexercise.map(exercise => //{"id", "exercisename", "sets":[{}, {}, {}]}
            //@ts-ignore
            exercise.id === exerciseid //How to do you access the keys of an object ??
            ? {
                //@ts-ignore
                ...exercise,   //expand the exercise object 
                //@ts-ignore
                set: exercise.set.map(set =>  //How do you go through an array of object ?? here ===> set = {"id", "reps", "weight", "rir"}
                    set.id === id ? { ...set, [name]: value } : set
                )
                }
            : exercise
        );
        setAddexercise(result);
    
    }

    function addSet(exerciseid: number) {
        console.log("exerciseid", exerciseid)
        const exerciseId = Number(exerciseid)
        //@ts-ignore
        setAddexercise(addexercise.map(exercise => { //{"id", "exercisename", "sets":[{}, {}, {}]}
        //@ts-ignore
            if (exercise.id === exerciseId) {
                //@ts-ignore
                return {
                    //@ts-ignore
                    ...exercise,
                    // to create a copy we use "..." so if sets = [{}, {}, {}] then copy = ...sets
                    //since we are adding a new objec that means it will start with "{}"
                    set: [...exercise.set, { //How to you add new object to an array of object according to react ?
                        id: exercise.set.length + 1,
                        reps: "",
                        weight: "",
                        rir: ""
                    }]
                }
            }
        return exercise
    }))
    }
    


    function logSoreness(id: number, sorenessData: any) {
        setAddexercise(addexercise.map(exercise => {
            //@ts-ignore
            if (exercise.id === id) {
                return { ...exercise, soreness: { soreness_score: sorenessData.level, description: sorenessData.label } };
            }
            return exercise;
        }));
    }

    return {MUSCLE_COLORS, Addexercise,submitSession,  Selecttrainedmuscle, exerciseName, addsetData, addSet, sessionName, addexercise, apiCall, setApiCall, logSoreness}
    

}

