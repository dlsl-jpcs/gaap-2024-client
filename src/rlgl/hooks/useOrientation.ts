import { useEffect, useRef, useState } from 'react';

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
}

const requestOrientationPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;
const iOS = typeof requestOrientationPermission === 'function';

export function useOrientation(state: string, onThreshold: () => void) {
    const [orientation, setOrientation] = useState({
        alpha: 0,
        beta: 0,
        gamma: 0,
    });

    const callback = useRef(onThreshold);
    useEffect(() => {
        callback.current = onThreshold;
    });

    useEffect(() => {

        const handleOrientation = (event: DeviceOrientationEvent) => {
            const { alpha, beta, gamma } = event!;
            if (alpha === null || beta === null || gamma === null) {
                return;
            }

            if (state === "countdown" || state === "idle") {
                setOrientation({ alpha, beta, gamma });
                return;
            }

            const previousOrientation = orientation;
            const threshold = 1.5;

            if (
                Math.abs(previousOrientation.alpha - alpha) > threshold ||
                Math.abs(previousOrientation.beta - beta) > threshold ||
                Math.abs(previousOrientation.gamma - gamma) > threshold
            ) {
                callback.current();
            }
        };

        if (iOS) {
            requestOrientationPermission!().then((response) => {
                if (response === 'granted') {
                    window.addEventListener("deviceorientation", handleOrientation);
                }
            });
        } else {
            window.addEventListener("deviceorientation", handleOrientation);
        }

        return () => {
            window.removeEventListener("deviceorientation", handleOrientation);
        };
    }, [state, orientation]);

    return orientation;
}