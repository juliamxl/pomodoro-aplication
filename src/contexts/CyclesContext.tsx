import { Children, ReactNode, createContext, useEffect, useReducer, useState } from "react";
import { ActionTypes, Cycle, cyclesReducer } from "../reducers/cycles/reducer";
import { interruptCurrentCycleAction, markCurrentCycleAsFinishedAction } from "../reducers/cycles/actions";
import { differenceInSeconds } from "date-fns";

interface CreateCycleData {
    task: string,
    minutesAmount: number
}



interface CyclesContextType {
    cycles: Cycle[];
    activeCycle: Cycle | undefined;
    activeCycleId: string | null;
    amountSecondsPassed: number;
    markCurrentCycleAsFinished: () => void;
    setSecondsPassed: (seconds: number) => void;
    createNewCycle: (data: CreateCycleData) => void
    interruptCurrentCycle: () => void
}

interface CyclesContextProviderProps {
    children: ReactNode;
}

interface CyclesContextProvider {
    cycles: Cycle[]
    activeCycleId: string | null
}


export const CyclesContext = createContext({} as CyclesContextType)



export function CyclesContextProvider({
    children
}: CyclesContextProviderProps) {
    const [cyclesState, dispatch] = useReducer(cyclesReducer,
    
        {
            cycles: [],
            activeCycleId: null
        }, (initialState) => {
            const storageStateAsJSON = localStorage.getItem('@ignite-timer:cycles-state-1.0.0');

            if(storageStateAsJSON){
                return JSON.parse(storageStateAsJSON)
            }

            return initialState
        }
    )   

    useEffect(() => {
        const stateJSON = JSON.stringify(cyclesState)

        localStorage.setItem('@ignite-timer:cycles-state-1.0.0', stateJSON)
    }, [cyclesState])

    const { cycles, activeCycleId } = cyclesState;
    const activeCycle = cycles.find((cycle) => cycle.id == activeCycleId)

    const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
        if (activeCycle){
            return differenceInSeconds(new Date(), new Date(activeCycle.startDate))
        }
        return 0
    })

    function markCurrentCycleAsFinished() {
        dispatch(markCurrentCycleAsFinishedAction())

        // setCycles((state) =>
        //     state.map((cycle) => {
        //         if (cycle.id === activeCycleId) {
        //             return { ...cycle, finishedDate: new Date() }  // Alterei para finishedDate
        //         } else {
        //             return cycle;
        //         }
        //     })
        // );
        // setActiveCycleId(null);
    }

    function setSecondsPassed(seconds: number) {
        setAmountSecondsPassed(seconds)
    }

    function createNewCycle(data: CreateCycleData) {
        const id = String(new Date().getTime())

        const newCycle: Cycle = {
            id,
            task: data.task,
            minutesAmount: data.minutesAmount,
            startDate: new Date()
        }

        dispatch({
            type: ActionTypes.ADD_NEW_CYCLE,
            payload: {
                newCycle
            }

        })

        // setCycles((state) => [...state, newCycle])
        setAmountSecondsPassed(0)


    }

    function interruptCurrentCycle() {
        dispatch(interruptCurrentCycleAction())


        // setCycles((state) => 
        //     state.map((cycle) => {
        //         console.log(cycle.id, activeCycleId)
        //         if(cycle.id === activeCycleId){
        //             return {...cycle, interruptedDate: new Date()}
        //         }else {
        //             return cycle
        //         }
        //     })
        // );
        // setActiveCycleId(null);
    }

    return (
        <CyclesContext.Provider
            value={{
                cycles,
                activeCycle,
                activeCycleId,
                markCurrentCycleAsFinished,
                amountSecondsPassed,
                setSecondsPassed,
                createNewCycle,
                interruptCurrentCycle
            }}
        >
            {children}
        </CyclesContext.Provider>
    )
}
