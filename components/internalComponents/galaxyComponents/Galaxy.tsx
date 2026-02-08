"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { GalaxyCluster } from "./Bodies";
import { StarData, UnplacedItem } from "@/lib/sampleGalaxyData";


type Star = {
    size: number;
    description?: string;
}


type GalaxyProps = {
    unplacedItem: UnplacedItem | null;
    cameraProps: {}
    galaxyData: StarData[];
    setNewStarPosition: (position: number[]) => void
}


export default function Galaxy({ unplacedItem, galaxyData, setNewStarPosition }: GalaxyProps) {
    const [focus, setFocus] = useState<THREE.Vector3 | null>(null);

    const placingStar = useMemo(() => unplacedItem?.type === "star", [unplacedItem?.type]);
    const placingPlanet = useMemo(() => unplacedItem?.type === "planet", [unplacedItem?.type]);

    const transformRef = useRef(null)
    const orbitControlsRef = useRef(null);

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
            onPointerMissed={() => setFocus(null)}>
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

            <CameraController target={focus} ref={orbitControlsRef} />

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



function CameraController({ target, ref }: { target: THREE.Vector3 | null; ref: any }) {
    const { camera } = useThree();
    const targetPosition = useRef(new THREE.Vector3());
    const cameraTarget = useRef(new THREE.Vector3());

    useFrame(() => {
        if (!target || !ref.current) return;

        const focus = new THREE.Vector3(...target);

        targetPosition.current.set(
            focus.x,
            focus.y + 3,
            focus.z + 6
        );

        camera.position.lerp(targetPosition.current, 0.08);

        cameraTarget.current.lerp(focus, 0.08);
        ref.current.target.copy(cameraTarget.current);

        ref.current.update();
    });

    return (
        <OrbitControls
            ref={ref}
            enableRotate
            enablePan={true}
            enableZoom={true}
            enableDamping
            dampingFactor={0.1}
        />
    );
}