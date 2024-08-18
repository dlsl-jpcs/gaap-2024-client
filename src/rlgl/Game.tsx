import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import './Game.css';
import { useMotion as useMotionDetector } from './hooks/useMotion';
import { useOrientation as useOrientationDetector } from './hooks/useOrientation';

type MoveData = {
    type: string | "orientation" | "motion";
    difference: number;
    previous?: number;
    debug?: string;
}

export enum GameState {
    idle,
    countdown,
    started,
    ended,
    eliminated
}

function Game(
    props: {
        state: GameState;
        ws: WebSocket
    }
) {
    const [moved, setMoved] = useState<MoveData | null>(null);

    useOrientationDetector(props.state, (prev, diff, debugData) => {
        props.ws.send(JSON.stringify({
            type: "moved",
            cause: "orientation",
            difference: diff,
            previous: prev,
            debug: debugData
        }));
    });

    useMotionDetector(props.state, (difference) => {
        props.ws.send(JSON.stringify({
            type: "moved",
            cause: "motion",
        }));
    });



    return (
        <>
            {
                props.state === GameState.started && (
                    <div className="card">
                        <h1>RED LIGHT</h1>
                    </div>
                )
            }

            {
                props.state === GameState.ended && moved && (
                    <div className="card">
                        <h1>Failed</h1>
                    </div>
                )
            }

            {
                props.state === GameState.ended && !moved && (
                    <div className="card">
                        <h1>Passed</h1>
                    </div>
                )
            }



            <p className="read-the-docs">
                JPCS Device Motion Test
            </p>
        </>
    )
}

export default Game;
