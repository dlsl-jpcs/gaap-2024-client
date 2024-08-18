import { useEffect, useRef, useState } from "react";
import Game, { GameState } from "../rlgl/Game";
import { requestOrientationPermissioniOS } from "../rlgl/hooks/useOrientation";

export function App() {
  const [background, setBackground] = useState("transparent");
  const [state, setState] = useState(GameState.idle);

  const [userCount, setUserCount] = useState(0);




  const [userId, _] = useState(() => {
    if (localStorage.getItem("userId") === "0") {
      localStorage.removeItem("userId");
    }
    if (localStorage.getItem("userId")) {
      return parseInt(localStorage.getItem("userId")!);
    } else {
      const newUserId = Math.floor(Math.random() * 1000000);
      localStorage.setItem("userId", newUserId.toString());
      return newUserId;
    }
  });


  const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
  const url = "wss://" + hostname;
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {

    function setupWebsocket(websocket: WebSocket) {
      websocket.onopen = () => {
        console.log("WebSocket connected");
      };

      websocket.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);

        const data = JSON.parse(event.data);
        if (data.type === "color") {
          setBackground(data.color);
        }

        if (data.type === "users") {
          setUserCount(data.count);
          return;
        }

        if (data.type === 'sync') {
          if (data.gameState === "red") {
            setState(GameState.started);
            setBackground("red");
          } else if (data.gameState === "green") {
            setState(GameState.idle);
            setBackground("green");
          }
          if (data.eliminated === true) {
            setState(GameState.eliminated);
            setBackground("orange");
          } else {
            setState(GameState.idle);
            setBackground("transparent");
          }
        }

        if (data.type === "eliminated") {
          setState(GameState.eliminated);
          setBackground("orange");
        }

        else if (data.type === "game_state") {
          const stringState: string = data.state;

          if (stringState === "idle") {
            setState(GameState.idle);
          } else if (stringState === "started") {
            setState(GameState.started);
            // vibrate
            window.navigator.vibrate(200);
          }
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
          const socket = new WebSocket(url + "?userId=" + userId);
          setupWebsocket(socket);
          setWebSocket(socket);
        }, 2000);
      };
    }

    const socket = new WebSocket(url + "?userId=" + userId);

    setupWebsocket(socket);

    setWebSocket(socket);

    return () => {
      websocket?.close();
    };
  }, []);

  useEffect(() => {
    if (state === GameState.idle) {
      setBackground("transparent");
    }

    if (state === GameState.started) {
      setBackground("red");
    }


  }, [state]);

  useEffect(() => {
    if (background) {
      document.body.style.backgroundColor = background;
    }
  }, [background]);

  return (
    <>


      {
        state === GameState.idle && (
          <div className="card">
            <h1>Waiting</h1>

          </div>
        )
      }


      {
        userCount && (
          <p>{userCount} user(s) connected</p>
        )
      }



      {
        state === GameState.eliminated && (
          <div className="card">
            <h1>Eliminated</h1>
          </div>
        ) || websocket && <Game state={state} ws={websocket} />
      }
    </>
  )
}