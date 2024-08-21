import { PropsWithChildren, useEffect, useState } from "react";
import { orientationPermissionsRequired, requestOrientationPermissioniOS, useOrientation } from "../rlgl/hooks/useOrientation";
import { GameState } from '../rlgl/GameState';
import { App } from "../home/App";

type PermissionState = "granted" | "denied" | "waiting"

export function Permissions(
    props: PropsWithChildren
) {
    const orientation = useOrientation(GameState.idle, () => { });

    const [permissionState, setPermissionState] = useState<PermissionState>("waiting");


    useEffect(() => {
        if (!orientationPermissionsRequired()) {
            setPermissionState("granted");
            return;
        }

        if (orientation.alpha !== 0 && orientation.beta !== 0 && orientation.gamma !== 0) {
            setPermissionState("granted");
        } else {
            setPermissionState("denied");
        }
    }, [orientation]);




    return (
        <>
            {permissionState === "granted" && (
                props.children
            )}


            {permissionState === "waiting" && (
                <h1>
                    Loading
                </h1>
            )}



            {permissionState === "denied" && (
                <>
                    <h1>Motion Permissions Required</h1>

                    <button onClick={() => {
                        requestOrientationPermissioniOS().then((result) => {
                            if (result === "granted") {
                                setPermissionState("granted");
                            } else {
                                setPermissionState("denied");
                            }
                        });
                    }}>
                        Proceed
                    </button>
                </>
            )}
        </>
    );
}

export default Permissions;