import { useEffect, useRef, useState } from "react";
import Game from "../rlgl/Game";
import { GameState } from '../rlgl/GameState';
import { requestOrientationPermissioniOS } from "../rlgl/hooks/useOrientation";
import { UserProfile } from "../profile/profile";

export function App(
  props: {
    profile: UserProfile
  }
) {
  const [background, setBackground] = useState("transparent");
  const [state, setState] = useState(GameState.idle);

  const [userCount, setUserCount] = useState(0);


  const userId = props.profile.studentId;



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
            setState(GameState.redLight);
          } else if (data.gameState === "green") {
            setState(GameState.greenLight);
          } else {
            setState(GameState.idle);
          }

          if (data.eliminated === true) {
            setState(GameState.eliminated);
            setBackground("orange");
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
          } else if (stringState === "red") {
            setState(GameState.redLight);
          } else if (stringState === "green") {
            setState(GameState.greenLight);
          }
        }
      };

      websocket.onerror = (event) => {
        console.error("WebSocket error observed:", event);
      };

      websocket.onclose = () => {
        console.log("WebSocket closed");

        setState(GameState.idle);

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
    } else if (state === GameState.redLight) {
      setBackground("red");
    } else if (state === GameState.greenLight) {
      setBackground("green");
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