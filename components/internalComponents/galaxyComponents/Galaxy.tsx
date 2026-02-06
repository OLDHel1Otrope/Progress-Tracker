"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";


type Vector3 = [number, number, number];

export default function Galaxy() {
    const [focus, setFocus] = useState<Vector3 | null>(null);

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

            <GalaxyCluster count={1} setFocus={setFocus} />

            <CameraController target={focus} />

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
        </Canvas>
    );
}

function GalaxyCluster({ count, setFocus }: { count: number; setFocus: (pos: Vector3) => void }) {
    const stars = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            position: randomVec3(20),
            planets: Math.floor(Math.random() * 8) + 1,
            size: Math.random() * 0.01 + 0.05,
        }));
    }, [count]);

    return (
        <>
            {stars.map((star, i) => (
                <StarSystem key={i} {...star} setFocus={setFocus} />
            ))}
        </>
    );
}


function StarSystem({
    position,
    planets,
    size,
    setFocus,
}: {
    position: Vector3;
    planets: number;
    size: number;
    setFocus: (pos: Vector3) => void;
}) {
    return (
        <group position={position}>
            {/* Star */}
            <Star size={size} onClick={setFocus} />


            {/* Planets */}
            {Array.from({ length: planets }).map((_, i) => (
                <PlanetOrbit
                    orbitRadius={1.5 + i * 1.2}
                    orbitSpeed={0.5 + Math.random() * 0.001}
                    orbitPhase={Math.random() * Math.PI * 2}
                    orbitInclination={(Math.random() - 0.5) * 0.5}
                    size={0.01 + Math.random() * 0.001}
                />
            ))}
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
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    color={randomPlanetColor()}
                    roughness={0.6}
                    metalness={0.1}
                />
            </mesh>
        </group>
    );
}



function randomVec3(range: number): Vector3 {
    return [
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range * 0.4,
        (Math.random() - 0.5) * range,
    ];
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



function CameraController({ target }: { target: Vector3 | null }) {
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
            ref={controls}
            enableRotate
            enablePan={true}
            enableZoom={true}
            enableDamping
            dampingFactor={0.1}
        />
    );
}