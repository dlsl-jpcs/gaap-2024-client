import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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
  const [started, setStarted] = useState(false);

  const [time, setTime] = useState(-1);
  useEffect(() => {
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
  }, []);



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

  // useEffect(() => {

  //   if (iOS) {
  //     requestPermission!().then((response) => {
  //       if (response === 'granted') {
  //         window.addEventListener("deviceorientation", handleOrientation);
  //       }
  //     });
  //   }


  //   const handleOrientation = (event: DeviceOrientationEvent) => {
  //     const { alpha, beta, gamma } = event!;
  //     if (alpha === null || beta === null || gamma === null) {
  //       return;
  //     }


  //     if (!started) {
  //       setOrientation({
  //         alpha,
  //         beta,
  //         gamma,
  //       });

  //       return;
  //     }


  //     const previousOrientation = orientation;

  //     // if any of the orientation values difference is greater than 20, then the user moved the device

  //     const threshold = 28;

  //     if (
  //       Math.abs(previousOrientation.alpha - alpha) > threshold ||
  //       Math.abs(previousOrientation.beta - beta) > threshold ||
  //       Math.abs(previousOrientation.gamma - gamma) > threshold
  //     ) {
  //       setBackground("red");
  //       setMoved(true);
  //       setTime(-1);
  //       setStarted(false);
  //     }
  //   }


  //   window.addEventListener("deviceorientation", handleOrientation);


  //   return () => {
  //     window.removeEventListener("deviceorientation", handleOrientation);
  //   };
  // }, [orientation, time, started]);

  useEffect(() => {
    if (iOSMotion) {
      requestMotionPermission!().then((response) => {
        if (response === 'granted') {
          window.addEventListener("devicemotion", handleMotion);
        }
      });
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = (event as DeviceMotionEvent).acceleration!;

      if (x === null || y === null || z === null) {
        return;
      }


      if (!started) {
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
        setStarted(false);
      }
    }

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", () => { });
    };
  });

  useEffect(() => {
    if (started && time <= 0 && !moved) {
      setBackground("green");
      setStarted(false);
    }
  }, [time, moved, started]);


  return (
    <>
      {
        moved && (
          <div className="card">
            <h1>You moved!</h1>
          </div>
        )
      }

      {
        false && (
          <div className="card">
            <h1>Device Orientation</h1>
            <p>Alpha: {orientation.alpha}</p>
            <p>Beta: {orientation.beta}</p>
            <p>Gamma: {orientation.gamma}</p>
          </div>
        )
      }

      {
        true && (
          <div className="card">
            <h1>Device Motion</h1>
            <p>X: {motion.x}</p>
            <p>Y: {motion.y}</p>
            <p>Z: {motion.z}</p>
          </div>
        )
      }

      {
        time > 0 && (
          <div className="card">
            <h1>{time}</h1>
            <button onClick={() => {
              setTime(-1);
              setStarted(false);
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
          setStarted(true);
        }}>
          Start test
        </button>
      </div>
      <p className="read-the-docs">
        JPCS Device Motion Test
      </p>


    </>
  )
}

export default App