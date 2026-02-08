"use client"

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { Vector3 } from "three";


function randomPlanetColor() {
    const colors = [
        "#ffffff",
    ];

    return colors[Math.floor(Math.random() * colors.length)];
}

export function Planet({ size }: { size: number }) {
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


export function Star({
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
                onClick(p);
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
            </mesh>
        </group>
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

export function GalaxyCluster({ setFocus, starData }: { setFocus: (pos: Vector3) => void; starData: any[] }) {
    return (
        <>
            {starData.map((star, i) => (
                <StarSystem key={i} {...star} setFocus={setFocus} />
            ))}
        </>
    );
}