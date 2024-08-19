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
    // waiting for game to start
    idle,

    // unused, but could be used to show a countdown later
    countdown,

    // red light, clients will be listening for motion and orientation
    redLight,

    // green light, client's will not be listening for motion and orientation
    greenLight,

    // this client is eliminated and should not be listening for motion and orientation
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
                props.state === GameState.redLight && (
                    <div className="card">
                        <h1>RED LIGHT</h1>
                    </div>
                )
            }

            {
                props.state === GameState.greenLight && moved && (
                    <div className="card">
                        <h1>Failed</h1>
                    </div>
                )
            }

            {
                props.state === GameState.greenLight && !moved && (
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
