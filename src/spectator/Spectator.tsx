import { useEffect, useState } from "react";

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
                    }, 5000);
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
        <>

            {eliminatedList.length > 0 && (
                <>
                    <h1>Eliminated</h1>
                    <ul>
                        {eliminatedList[0]}
                    </ul>
                </>
            )}

            {usersList.length > 0 && (
                <>
                    <h1>Joined</h1>
                    <ul>
                        {usersList.map((u) => (
                            <li key={u.id}>
                                {u.email} - {u.course}
                            </li>
                        ))}
                    </ul>
                </>
            )}

        </>
    );
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
