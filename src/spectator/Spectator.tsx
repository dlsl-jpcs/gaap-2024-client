import { useEffect, useState } from "react";

import "./spectator.css";
import JPCS from "../assets/jpcs_logo.png";
import leftYear from "../assets/left-year.png";
import rightYear from "../assets/right-year.png"
import topYear from "../assets/top-year.png";
import TextTransition, { presets } from "react-text-transition";

const BASE_PICTURE_URL = "https://mydcampus.dlsl.edu.ph/photo_id/"

export function Spectator() {

    const [eliminatedList, setEliminatedList] = useState<number[]>([]);

    const [usersList, setUsersList] = useState<{ id: number, email: string, course: string }[]>([]);


    const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
    const url = "wss://" + hostname;
    const [websocket, setWebSocket] = useState<WebSocket | null>(null);

    const [spectatorId, _] = useSpectatorId();


    useEffect(() => {

        function setupWebsocket(websocket: WebSocket) {
            websocket.onopen = () => {
                console.log("WebSocket connected as spectator");
            };

            websocket.onmessage = (event) => {
                console.log("WebSocket message received:", event.data);

                const data = JSON.parse(event.data);

                if (data.type === "eliminated") {
                    const id = data.id;

                    setEliminatedList((prev) => {
                        if (prev.includes(id)) {
                            return prev;
                        }
                        return [...prev, id];
                    });

                    setTimeout(() => {
                        setEliminatedList((prev) => {
                            return prev.filter((i) => i !== id);
                        });
                    }, 2000);
                } else if (data.type === "join") {
                    const email = data.email;
                    const course = data.course;


                    setUsersList((prev) => {
                        if (prev.find((u) => u.id === data.id)) {
                            return prev;
                        }
                        return [...prev, { id: data.id, email, course }];
                    });

                    setTimeout(() => {
                        setUsersList((prev) => {
                            return prev.filter((u) => u.id !== data.id);
                        });
                    }, 5000);
                }
            };

            websocket.onerror = (event) => {
                console.error("WebSocket error observed:", event);
            };

            websocket.onclose = () => {
                console.log("WebSocket closed");


                // reconnect
                console.log("Reconnecting in 2 seconds...");
                setTimeout(() => {
                    console.log("Reconnecting...");
                    const socket = new WebSocket(url + "?userId=" + spectatorId + "&spectator=true");
                    setupWebsocket(socket);
                    setWebSocket(socket);
                }, 2000);
            };
        }

        const socket = new WebSocket(url + "?userId=" + spectatorId + "&spectator=true");

        setupWebsocket(socket);

        setWebSocket(socket);

        return () => {
            websocket?.close();
        };
    }, []);


    return (
        <div className="spectator">
            <img src={leftYear} alt="" className="left-year" />
            <img src={rightYear} alt="" className="right-year" />
            <img src={topYear} alt="" className="top-year" />

            <WelcomeMessage user={usersList[0]} />



            <div className="gaap-footer">
                <h2>GAAP 2024</h2>
            </div>
        </div>
    );
}




function WelcomeMessage(
    props: {
        user: { id: number; email: string; course: string } | null;
    }
) {
    const title = props.user ? getNameFromEmail(props.user.email) : "General Assembly";
    return (
        <>
            <img src={JPCS} alt="" />

            {props.user && (
                <img src={BASE_PICTURE_URL + props.user?.id + ".JPG"} alt="" className="profile-picture" />
            )}


            <h1 className="spech1">
                <TextTransition
                    springConfig={presets.stiff}
                >
                    {title}
                </TextTransition>
            </h1>
        </>
    )
}


function getNameFromEmail(email: string) {
    const emailPart = email.split("@")[0];
    // split by _
    const parts = emailPart.split("_");
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}


function useSpectatorId() {
    return useState(() => {
        if (localStorage.getItem("spectatorId") === "0") {
            localStorage.removeItem("spectatorId");
        }
        if (localStorage.getItem("spectatorId")) {
            return parseInt(localStorage.getItem("spectatorId")!);
        } else {
            const newSpectatorId = Math.floor(Math.random() * 1000000);
            localStorage.setItem("spectatorId", newSpectatorId.toString());
            return newSpectatorId;
        }
    });
}
