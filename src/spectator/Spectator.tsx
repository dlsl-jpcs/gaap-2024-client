import { useEffect, useState } from "react";
import "./spectator.css";
import JPCS from "../assets/jpcs_logo.png";
import leftYear from "../assets/left-year.png";
import rightYear from "../assets/right-year.png";
import topYear from "../assets/top-year.png";
import TextTransition, { presets } from "react-text-transition";
import { useSpotify } from "./hooks/useSpotify";
import { Scopes } from "@spotify/web-api-ts-sdk";
import { GameState } from "../rlgl/GameState";


// constants
const BASE_PICTURE_URL = "https://mydcampus.dlsl.edu.ph/photo_id/";
const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
const url = `wss://${hostname}`;


/**
 * The Spectator screen, primararily for displaying in the SENTRUM
 * 
 */
export function Spectator() {
    const sdk = useSpotify(
        import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        import.meta.env.VITE_REDIRECT_TARGET,
        Scopes.all
    );

    const [eliminatedList, setEliminatedList] = useState<number[]>([]);
    const [usersList, setUsersList] = useState<
        { id: number; email: string; course: string; audioUrl: string }[]
    >([]);

    const [state, setState] = useState(GameState.idle);
    const [websocket, setWebSocket] = useState<WebSocket | null>(null);
    const [spectatorId] = useSpectatorId();
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);


    // when a new user joins, the handleJoin function is called
    // and as a side effect of that function, a user is added to the list and
    // an audio is set. causing this effect to run
    useEffect(() => {
        if (!audio) return;

        audio.play();
        audio.volume = 0;
        const fadeStep = 0.05;

        const fadeInterval = setInterval(() => {
            if (audio.volume + fadeStep >= 1) {
                clearInterval(fadeInterval);
                return;
            }
            audio.volume += fadeStep;
        }, 100);

        return () => {
            clearInterval(fadeInterval);
            audio.pause();
        };
    }, [audio]);

    useEffect(() => {
        // shouldn't be possible, but just in case :D
        if (!sdk) return;

        const setupWebsocket = (ws: WebSocket) => {
            ws.onopen = () => console.log("WebSocket connected as spectator");

            ws.onmessage = (event) => {
                console.log("WebSocket message received:", event.data);
                const data = JSON.parse(event.data);

                if (data.type === "eliminated") {
                    handleElimination(data.id);
                } else if (data.type === "join") {
                    handleJoin(data);
                } else if (data.type === "game_state") {
                    const newState = data.state === "red" ? GameState.redLight : GameState.greenLight;
                    setState(newState);
                } else if (data.type === "sync") {
                    const newState = data.gameState === "red" ? GameState.redLight : GameState.greenLight;
                    setState(newState);
                }
            };

            ws.onerror = (event) => console.error("WebSocket error:", event);

            ws.onclose = () => {
                console.log("WebSocket closed, reconnecting in 2 seconds...");
                setTimeout(() => reconnectWebSocket(), 2000);
            };
        };

        const handleElimination = (id: number) => {
            setEliminatedList((prev) =>
                prev.includes(id) ? prev : [...prev, id]
            );
            setTimeout(
                () =>
                    setEliminatedList((prev) =>
                        prev.filter((i) => i !== id)
                    ),
                2000
            );
        };


        /**
         * Handle the join event from the websocket,
         * adding the user to the list of users and playing the audio
         * 
         * also sets a timeout to remove the user from the list
         * and additionally fade out the audio
         */
        const handleJoin = (data: any) => {
            if (state !== GameState.idle) {
                return;
            }
            const { id, email, course } = data;

            sdk.tracks
                .get("1uwg7BqqCx60EUA24WPB6c")
                .then((track) => track.preview_url)
                .then((url) => {
                    const timeout = 15000;

                    setUsersList((prev) =>
                        prev.find((u) => u.id === id)
                            ? prev
                            : [...prev, { id, email, course, audioUrl: url ?? "" }]
                    );

                    if (url) {
                        const newAudio = new Audio(url);
                        setAudio(newAudio);
                        setTimeout(() => fadeOutAudio(newAudio), timeout - 2000);
                    }

                    setTimeout(() => removeUser(id), timeout);
                });
        };

        const removeUser = (id: number) => {
            setUsersList((prev) => prev.filter((u) => u.id !== id));
            setAudio((prev) => {
                prev?.pause();
                return null;
            });
        };

        const fadeOutAudio = (audio: HTMLAudioElement) => {
            const fadeStep = 0.05;
            const fadeInterval = setInterval(() => {
                if (audio.volume - fadeStep <= 0) {
                    clearInterval(fadeInterval);
                    return;
                }
                audio.volume -= fadeStep;
            }, 100);
        };

        const reconnectWebSocket = () => {
            const socket = new WebSocket(`${url}?userId=${spectatorId}&spectator=true`);
            setupWebsocket(socket);
            setWebSocket(socket);
        };

        const socket = new WebSocket(`${url}?userId=${spectatorId}&spectator=true`);
        setupWebsocket(socket);
        setWebSocket(socket);

        return () => {
            websocket?.close();
        };
    }, [sdk]);

    if (!sdk) return <div>Loading...</div>;

    return (
        <div className="spectator">
            <img src={leftYear} alt="" className="left-year" />
            <img src={rightYear} alt="" className="right-year" />
            <img src={topYear} alt="" className="top-year" />

            {state === GameState.idle ? <WelcomeMessage user={usersList[0]} /> : <State state={state}></State>}

            <div className="gaap-footer">
                <h2>GAAP 2024</h2>
            </div>
        </div>
    );
}

function State(
    props: {
        state: GameState;
    }
) {

    useEffect(() => {
        if (props.state === GameState.redLight) {
            document.body.style.backgroundColor = "#E91229";
        }

        if (props.state === GameState.greenLight) {
            document.body.style.backgroundColor = "#CFF469";
        }
    }, [props.state]);

    const text = props.state === GameState.redLight ? "RED LIGHT" : "GREEN LIGHT";

    return <>
        <h1>{text}</h1>
    </>
}


function WelcomeMessage({ user }: { user: { id: number; email: string; course: string } | null }) {
    const title = user ? getNameFromEmail(user.email) : "General Assembly";
    return (
        <>
            <img src={JPCS} alt="" />
            <h1 className="spech1">
                <TextTransition springConfig={presets.stiff}>{title}</TextTransition>
            </h1>
        </>
    );
}


function getNameFromEmail(email: string) {
    return email.split("@")[0]
        .split("_")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

/**
 * Makes sure that the spectator has a unique ID
 * 
 * As spectators are treated as users, they still need to have an ID
 */
function useSpectatorId() {
    return useState(() => {
        const storedId = localStorage.getItem("spectatorId");
        if (storedId) {
            return parseInt(storedId);
        }

        const newSpectatorId = Math.floor(Math.random() * 1_000_000);
        localStorage.setItem("spectatorId", newSpectatorId.toString());
        return newSpectatorId;
    });
}