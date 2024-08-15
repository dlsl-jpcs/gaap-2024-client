import { useEffect, useState } from 'react'
import './App.css'

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const requestOrientationPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;
const iOS = typeof requestOrientationPermission === 'function';

const requestMotionPermission = (DeviceMotionEvent as unknown as DeviceOrientationEventiOS).requestPermission;
const iOSMotion = typeof requestMotionPermission === 'function';

function App() {

  const [background, setBackground] = useState("transparent");

  const [state, setState] = useState<string | "started" | "idle" | "ended">("idle");




  const [time, setTime] = useState(-1);
  const [countdownTime, setCountdownTime] = useState(3);

  useEffect(() => {
    if (state !== "started") {
      return;
    }

    let timer = setInterval(() => {
      setTime((time) => {
        if (time === 0) {
          clearInterval(timer);
          return 0;
        } else return time - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [state]);

  useEffect(() => {
    if (state !== "countdown") {
      return;
    }

    const timer = setInterval(() => {
      setCountdownTime((time) => {
        console.log(time);

        if (time === 1) {
          clearInterval(timer);

          setTime(10);
          setState("started");
          return 0;
        }


        return time - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [state, countdownTime]);


  const [moved, setMoved] = useState(false);

  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [motion, setMotion] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    document.body.style.backgroundColor = background;
  }, [background]);

  useEffect(() => {

    if (iOS) {
      requestOrientationPermission!().then((response) => {
        if (response === 'granted') {
          window.addEventListener("deviceorientation", handleOrientation);
        }
      });
    }


    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha, beta, gamma } = event!;
      if (alpha === null || beta === null || gamma === null) {
        return;
      }


      if (state === "countdown" || state === "idle") {
        setOrientation({
          alpha,
          beta,
          gamma,
        });

        return;
      }




      const previousOrientation = orientation;

      // if any of the orientation values difference is greater than 20, then the user moved the device

      const threshold = 28;

      if (
        Math.abs(previousOrientation.alpha - alpha) > threshold ||
        Math.abs(previousOrientation.beta - beta) > threshold ||
        Math.abs(previousOrientation.gamma - gamma) > threshold
      ) {
        setBackground("red");
        setMoved(true);
        setTime(-1);
        setState("ended");
      }
    }


    window.addEventListener("deviceorientation", handleOrientation);


    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [orientation, time, state]);

  useEffect(() => {
    if (iOSMotion) {
      requestMotionPermission!().then((response) => {
        if (response === 'granted') {
          window.addEventListener("devicemotion", handleMotion);
        }
      });

      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = (event as DeviceMotionEvent).acceleration!;

      if (x === null || y === null || z === null) {
        return;
      }


      if (state === "countdown" || state === "idle") {
        setMotion({
          x,
          y,
          z,
        });

        return;
      }

      const previousMotion = motion;

      // if any of the orientation values difference is greater than 20, then the user moved the device

      const threshold = 5;

      if (
        Math.abs(previousMotion.x - x) > threshold ||
        Math.abs(previousMotion.y - y) > threshold ||
        Math.abs(previousMotion.z - z) > threshold
      ) {
        setBackground("red");
        setMoved(true);
        setTime(-1);
        setState("ended");
      }
    }

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", () => { });
    };
  });

  useEffect(() => {
    if (state === "started" && time <= 0 && !moved) {
      setBackground("green");
      setState("idle");
    }
  }, [time, moved, state]);


  return (
    <>

      {
        state === "started" && (
          <div className="card">
            <h1>Ongoing</h1>
          </div>
        )
      }

      {
        state === "ended" && moved && (
          <div className="card">
            <h1>You moved!</h1>
          </div>
        )
      }

      {
        state === "ended" && !moved && (
          <div className="card">
            <h1>Passed</h1>
          </div>
        )
      }

      {
        state === "countdown" && (
          <div className="card">
            <h1>{countdownTime}</h1>
          </div>
        )
      }

      {
        state === "started" && time > 0 && (
          <div className="card">
            <h1>{time}</h1>
            <button onClick={() => {
              setTime(-1);
              setCountdownTime(3);
              setState("ended");
              setBackground("transparent");

            }}>
              Stop Timer
            </button>
          </div>
        )
      }



      <div className="card">
        <button onClick={() => {
          setTime(10);
          setMoved(false);
          setBackground("transparent");
          setCountdownTime(3);
          setState("countdown");
        }}>
          {state === "idle" ? "Start" : "Restart"}
        </button>
      </div>
      <p className="read-the-docs">
        JPCS Device Motion Test
      </p>


    </>
  )
}

export default App