import { useEffect, useState } from 'react'
import './App.css'
import { useOrientation } from './useOrientation';
import { useMotion } from './useMotion';

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


  useEffect(() => {
    document.body.style.backgroundColor = background;
  }, [background]);

  useOrientation(state, () => {
    setBackground("red");
    setMoved(true);
    setTime(-1);
    setState("ended");
  });

  useMotion(state, () => {
    setBackground("red");
    setMoved(true);
    setTime(-1);
    setState("ended");
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