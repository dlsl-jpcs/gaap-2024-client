import { useEffect, useRef, useState } from "react";

interface DeviceMotionEventiOS extends DeviceMotionEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
}

const requestMotionPermission = (DeviceMotionEvent as unknown as DeviceMotionEventiOS).requestPermission;
const iOSMotion = typeof requestMotionPermission === 'function';


export function useMotion(state: string, onThreshold: () => void) {
    const [motion, setMotion] = useState({
        x: 0,
        y: 0,
        z: 0,
    });

    let callback = useRef(onThreshold);

    useEffect(() => {
        callback.current = onThreshold;
    });

    useEffect(() => {
        const handleMotion = (event: DeviceMotionEvent) => {
            const { x, y, z } = (event as DeviceMotionEvent).acceleration!;
            if (x === null || y === null || z === null) {
                return;
            }

            if (state === "countdown" || state === "idle") {
                setMotion({ x, y, z });
                return;
            }

            const previousMotion = motion;
            const threshold = 5;

            if (
                Math.abs(previousMotion.x - x) > threshold ||
                Math.abs(previousMotion.y - y) > threshold ||
                Math.abs(previousMotion.z - z) > threshold
            ) {
                callback.current();
            }

        }

        if (iOSMotion) {
            requestMotionPermission!().then((response) => {
                if (response === 'granted') {
                    window.addEventListener("devicemotion", handleMotion);
                }
            });
        } else {
            window.addEventListener("devicemotion", handleMotion);
        }

        return () => {
            window.removeEventListener("devicemotion", handleMotion);
        };
    }, [motion, state]);
}