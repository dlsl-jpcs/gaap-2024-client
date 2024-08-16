import { useEffect, useState } from "react";
import Game from "../rlgl/Game";

export function App() {
  const [background, setBackground] = useState("transparent");

  const [errors, setErrors] = useState<string[]>([]);

  const hostname = "localhost";
  const url = "wss://" + hostname + ":3000/rlgl";
  const [websocket, setWebSocket] = useState<WebSocket>(new WebSocket(url));
  useEffect(() => {

    websocket.onopen = () => {
      console.log("WebSocket connected");
    };

    websocket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);

      const data = JSON.parse(event.data);
      if (data.type === "color") {
        setBackground(data.color);
      }

    };

    websocket.onerror = (event) => {
      console.error("WebSocket error observed:", event);
      setErrors([...errors, event.toString()]);
    };

    websocket.onclose = () => {
      console.log("WebSocket closed");

      // reconnect
      console.log("Reconnecting in 5 seconds...");
      setTimeout(() => {
        setWebSocket(new WebSocket(url));
      }, 5000);
    };
  }, [websocket]);

  useEffect(() => {
    document.body.style.backgroundColor = background;
  }, [background]);

  return (
    <>
      {(errors.length > 0) && (
        <div>
          <h2>Errors</h2>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}



      <button onClick={
        () => {
          websocket.close();
        }
      }>
        Disconnect
      </button>

      <Game></Game>
    </>
  )
}