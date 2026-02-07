"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { starData } from "@/lib/sampleGalaxyData";
import { TransformControls } from "@react-three/drei";


type Vector3 = [number, number, number];

type Star = {
    size: number;
    description?: string;
}

type GalaxyProps = {
    unplacedStars: any[];
    setUnplacedStars: (stars: any[]) => void;
    placingStar: THREE.Mesh | null;
    setPlacingStar: (star: THREE.Mesh | null) => void;
    placingPlanet: THREE.Mesh | null;
    setPlacingPlanet: (planet: THREE.Mesh | null) => void;
}

export default function Galaxy({ unplacedStars, setUnplacedStars, placingStar, setPlacingStar, placingPlanet, setPlacingPlanet }: GalaxyProps) {
    const [focus, setFocus] = useState<Vector3 | null>(null);
    const [stars, setStars] = useState<any[]>(starData);
    const [isPlacing, setIsPlacing] = useState(false);

    // const isPlacing = useMemo(() => !!placingStar || !!placingPlanet, [placingStar, placingPlanet]);
    const [ghostStar, setGhostStar] = useState<THREE.Mesh | null>(null);
    const [placingStarSize] = useState(0.08);


    //this function generates a star mesh into the placingStar state, which will then be moved to the galaxy when confirmed
    function startPlacingStar() {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 16, 16),
            new THREE.MeshStandardMaterial({
                color: "#ffffff",
                transparent: true,
                opacity: 0.6,
            })
        );

        mesh.position.set(0, 0, 0);

        setPlacingStar(mesh);
        setIsPlacing(true);
    }

    //funcion to confirm the star placement
    function confirmPlacement() {
        if (!placingStar) return;

        const pos = placingStar.position;

        setStars(prev => [...prev, {
            x: pos.x,
            y: pos.y,
            z: pos.z,
        }]);
        setPlacingStar(null);
        setIsPlacing(false);
    }


    // why is this running
    useEffect(() => {
        if (!placingStar) return;

        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(placingStar?.size, 16, 16),
            new THREE.MeshStandardMaterial({
                color: "#fff",
                transparent: true,
                opacity: 0.6,
                emissive: "#ffffff",
                emissiveIntensity: 0.5,
            })
        );

        mesh.position.set(0, 0, 0);

        setGhostStar(mesh);
    }, [placingStar, placingStarSize]);




    // escape to remove focus
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

            {/* <Stars
                radius={1000}
                depth={100}
                count={5000}
                factor={0}
                fade
                speed={1}
            /> */}

            <GalaxyCluster setFocus={setFocus} starData={stars} />

            <CameraController target={focus} isPlacing={!!placingStar} />

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
                    object={placingStar}
                    mode="translate"
                />
            )}
            {placingStar && <primitive object={placingStar} />}

            {isPlacing && (
                <div className="fixed bottom-24 left-5 z-50 flex gap-2">
                    <button
                        onClick={confirmPlacement}
                        className="px-4 py-2 rounded-md bg-green-600/80"
                    >
                        Confirm
                    </button>

                    <button
                        onClick={() => setIsPlacing(false)}
                        className="px-4 py-2 rounded-md bg-red-600/80"
                    >
                        Cancel
                    </button>
                </div>
            )}

        </Canvas>
    );
}

function GalaxyCluster({ setFocus, starData }: { setFocus: (pos: Vector3) => void; starData: any[] }) {
    return (
        <>
            {starData.map((star, i) => (
                <StarSystem key={i} {...star} setFocus={setFocus} />
            ))}
        </>
    );
}


function StarSystem({
    position,
    size,
    setFocus,
    children
}: {
    position: Vector3;
    size: number;
    setFocus: (pos: Vector3) => void;
    children?: any[];
}) {
    return (
        <group position={position}>
            <Star size={size} onClick={setFocus} />
            {children && children.map((planet: any, i: number) => (
                <PlanetOrbit
                    key={i}
                    orbitRadius={planet.orbitRadius || 1.5 + i * 1.2}
                    orbitSpeed={planet.orbitSpeed || 0.5 + Math.random() * 0.001}
                    orbitPhase={planet.orbitPhase || Math.random() * Math.PI * 2}
                    orbitInclination={planet.orbitInclination || (Math.random() - 0.5) * 0.5}
                    size={planet.size || 0.01 + Math.random() * 0.001}
                />
            ))
            }
        </group>
    );
}

function PlanetOrbit({
    orbitRadius,
    orbitSpeed,
    orbitPhase,
    orbitInclination,
    size,
}: {
    orbitRadius: number;
    orbitSpeed: number;
    orbitPhase: number;
    orbitInclination: number;
    size: number;
}) {
    const planetRef = useRef<THREE.Mesh>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        const angle = orbitPhase + t * orbitSpeed;

        // Flat orbit (XZ plane only)
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;

        planetRef.current.position.set(x, 0, z);
    });

    return (
        // Rotate whole orbit system
        <group rotation={[orbitInclination, 0, 0]}>
            {/* Orbit ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry
                    args={[orbitRadius - 0.001, orbitRadius + 0.0001, 128]}
                />
                <meshBasicMaterial
                    color="white"
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Planet */}
            <mesh ref={planetRef}>
                <Planet size={size} />
                <meshStandardMaterial
                    color={randomPlanetColor()}
                    roughness={0.6}
                    metalness={0.1}
                />
            </mesh>
        </group>
    );
}

function randomPlanetColor() {
    const colors = [
        "#ffffff",
    ];

    return colors[Math.floor(Math.random() * colors.length)];
}

function Star({
    onClick,
    size = 0.1,
}: {
    onClick: (pos: Vector3) => void;
    size?: number;
}) {
    const [showDescription, setShowDescription] = useState(false);

    return (
        <mesh
            onClick={(e) => {
                e.stopPropagation();

                const p = e.object.getWorldPosition(new THREE.Vector3());
                onClick([p.x, p.y, p.z]);
            }}
            onPointerEnter={(e) => {
                e.stopPropagation();
                setShowDescription(true);
            }} onPointerLeave={(e) => {
                e.stopPropagation();
                setShowDescription(false);
            }}
        >
            <sphereGeometry args={[size, 16, 16]} />
            {/* <Planet size={size}/> */}
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" />

            <Html
                position={[0.3, 0.2, 0]}
                center
                distanceFactor={6}
                occlude
            >
                <div className="w-10 rounded text-[1] text-white flex items-center gap-1 px-2 py-1">
                    {showDescription && `${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 1000)}`}
                </div>
            </Html>
        </mesh>
    );
}

function Planet({ size }: { size: number }) {
    const [showDescription, setShowDescription] = useState(false);
    return (
        <mesh onPointerEnter={(e) => {
            e.stopPropagation();
            setShowDescription(true);
        }} onPointerLeave={(e) => {
            e.stopPropagation();
            setShowDescription(false);
        }}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
                color={randomPlanetColor()}
                roughness={0.6}
                metalness={0.1} />
            <Html
                position={[0, 0.2, 0]}
                center
                distanceFactor={4}
                occlude
            >
                <div className={`w-8 rounded  text-[0.8] flex items-center gap-1 px-1 py-0.5 `}>

                    {showDescription && `P-${Math.floor(Math.random() * 100)}`}
                </div>
            </Html>

        </mesh>
    );
}

function CameraController({ target, isPlacing }: { target: Vector3 | null; isPlacing: boolean }) {
    const { camera } = useThree();
    const controls = useRef<any>(null);

    const camTarget = useRef(new THREE.Vector3());

    useFrame(() => {
        if (!target || !controls.current) return;

        const focus = new THREE.Vector3(...target);

        // Where camera should be
        camTarget.current.set(
            focus.x,
            focus.y + 3,
            focus.z + 6
        );

        // Move camera
        camera.position.lerp(camTarget.current, 0.08);

        // Look at target
        controls.current.target.lerp(focus, 0.08);

        controls.current.update();
    });

    return (
        <OrbitControls
            enabled={!isPlacing}
            ref={controls}
            enableRotate
            enablePan={true}
            enableZoom={true}
            enableDamping
            dampingFactor={0.1}
        />
    );
}