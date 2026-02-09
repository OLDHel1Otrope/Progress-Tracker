"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { GalaxyCluster } from "./Bodies";
import { StarData, UnplacedItem } from "@/lib/sampleGalaxyData";

type GalaxyProps = {
    unplacedItem: UnplacedItem | null;
    galaxyData: StarData[];
    setNewStarPosition: (position: number[]) => void;
    orbitControlsRef: any
}

export default function Galaxy({ unplacedItem, galaxyData, setNewStarPosition, orbitControlsRef }: GalaxyProps) {
    const [focus, setFocus] = useState<THREE.Vector3 | null>(null);

    const placingStar = useMemo(() => unplacedItem?.type === "star", [unplacedItem?.type]);
    const placingPlanet = useMemo(() => unplacedItem?.type === "planet", [unplacedItem?.type]);

    const transformRef = useRef(null)
    // const orbitControlsRef = useRef(null);

    const celestialGhost = useMemo(() => {
        if (!unplacedItem) return null;
        else if (unplacedItem.type === "star") {
            return <mesh>
                <sphereGeometry args={[unplacedItem.details.size, 16, 16]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" />
            </mesh>
        }
        else if (unplacedItem.type === "planet") {
            return <mesh>
                <sphereGeometry args={[unplacedItem.details.size, 32, 32]} />
                <meshStandardMaterial
                    color="ffffff"
                    roughness={0.6}
                    metalness={0.1} />
            </mesh>
        }
    }, [unplacedItem])

    // escape to remove focus from selected star
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setFocus(null);
        };

        window.addEventListener("keydown", handler);

        return () => window.removeEventListener("keydown", handler);
    }, []);


    return (
        <Canvas camera={{ position: [0, 0, 10], fov: 40, }}
            onPointerMissed={() => setFocus(null)}
        // onScroll={() => setFocus(null)}
        >
            <color attach="background" args={["#05070d"]} />

            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />

            <Stars
                radius={1000}
                depth={100}
                count={0}
                factor={0}
                fade
                speed={1} />

            <GalaxyCluster setFocus={setFocus} starData={galaxyData} />

            <CameraController target={focus} ref={orbitControlsRef} onClearFocus={() => setFocus(null)} />

            <EffectComposer>
                <Bloom
                    intensity={0.2}     // glow strength
                    luminanceThreshold={0.3}
                    luminanceSmoothing={0.2}
                />

                <Vignette
                    offset={0.1}
                    darkness={0.6}
                />
            </EffectComposer>

            {placingStar && (
                <TransformControls
                    ref={transformRef}
                    // object={placingStar}
                    mode="translate"
                    size={0.3}
                    onObjectChange={() => {
                        if (!transformRef.current?.object) return;

                        const pos = transformRef.current.object.position;
                        setNewStarPosition([pos.x, pos.y, pos.z])
                    }}
                    onMouseDown={() => {
                        if (orbitControlsRef.current) {
                            orbitControlsRef.current.enabled = false;
                        }
                    }}
                    onMouseUp={() => {
                        if (orbitControlsRef.current) {
                            orbitControlsRef.current.enabled = true;
                        }
                    }}
                >{celestialGhost}
                </TransformControls>
            )
            }

            {
                placingPlanet && (
                    //render the customizeable ring after selecting the star
                    <></>
                )
            }

        </Canvas >
    );
}

function CameraController({ target, ref, onClearFocus }: {
    target: THREE.Vector3 | null;
    ref: any;
    onClearFocus: () => void
}) {
    const { camera } = useThree();
    const orbitControlsRef = useRef(null); // Separate ref for OrbitControls
    const targetPosition = useRef(new THREE.Vector3());
    const cameraTarget = useRef(new THREE.Vector3());
    const userInteracting = useRef(false);

    useImperativeHandle(ref, () => ({
        get enabled() {
            return orbitControlsRef.current?.enabled ?? true;
        },
        set enabled(value: boolean) {
            if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = value;
            }
        },
        moveUp: () => {
            const upVector = new THREE.Vector3(0, 1, 0);
            camera.position.addScaledVector(upVector, 1);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.target.addScaledVector(upVector, 1);
                orbitControlsRef.current.update();
            }
        },
        moveDown: () => {
            const upVector = new THREE.Vector3(0, 1, 0);
            camera.position.addScaledVector(upVector, -1);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.target.addScaledVector(upVector, -1);
                orbitControlsRef.current.update();
            }
        },
        moveLeft: () => {
            // Move camera left relative to view direction
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            const left = new THREE.Vector3();
            left.crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();

            camera.position.addScaledVector(left, 1);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.target.addScaledVector(left, 1);
                orbitControlsRef.current.update();
            }
        },
        moveRight: () => {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            const right = new THREE.Vector3();
            right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

            camera.position.addScaledVector(right, 1);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.target.addScaledVector(right, 1);
                orbitControlsRef.current.update();
            }
        },
        moveForward: () => {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.addScaledVector(direction, 1);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.target.addScaledVector(direction, 1);
                orbitControlsRef.current.update();
            }
        },
        moveBackward: () => {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.addScaledVector(direction, -1);
            if (orbitControlsRef.current) {
                orbitControlsRef.current.target.addScaledVector(direction, -1);
                orbitControlsRef.current.update();
            }
        },
        rotateLeft: () => {
            if (orbitControlsRef.current) {
                // Rotating around the target
                const offset = new THREE.Vector3();
                offset.copy(camera.position).sub(orbitControlsRef.current.target);

                const angle = 0.1; // rotation amount
                const newOffset = offset.clone();
                newOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

                camera.position.copy(orbitControlsRef.current.target).add(newOffset);
                orbitControlsRef.current.update();
            }
        },
        rotateRight: () => {
            if (orbitControlsRef.current) {
                const offset = new THREE.Vector3();
                offset.copy(camera.position).sub(orbitControlsRef.current.target);

                const angle = -0.1;
                const newOffset = offset.clone();
                newOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

                camera.position.copy(orbitControlsRef.current.target).add(newOffset);
                orbitControlsRef.current.update();
            }
        },
        zoomIn: () => {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.addScaledVector(direction, 1);
            if (orbitControlsRef.current) orbitControlsRef.current.update();
        },
        zoomOut: () => {
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            camera.position.addScaledVector(direction, -1);
            if (orbitControlsRef.current) orbitControlsRef.current.update();
        },
    }));

    useFrame(() => {
        if (!target || !orbitControlsRef.current) return;

        const focus = new THREE.Vector3(...target);

        targetPosition.current.set(
            focus.x,
            focus.y + 3,
            focus.z + 6
        );

        camera.position.lerp(targetPosition.current, 0.08);
        cameraTarget.current.lerp(focus, 0.08);
        orbitControlsRef.current.target.copy(cameraTarget.current);
        orbitControlsRef.current.update();
    });

    return (
        <OrbitControls
            ref={orbitControlsRef} 
            enableRotate
            enablePan={true}
            enableZoom={true}
            enableDamping
            dampingFactor={0.1}
            // if the user interacts, remove it from the target
            onStart={() => {
                userInteracting.current = true;
                if (target) {
                    onClearFocus();
                }
            }}
            onEnd={() => {
                userInteracting.current = false;
            }}
        />
    );
}