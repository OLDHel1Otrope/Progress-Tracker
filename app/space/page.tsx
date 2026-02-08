"use client";
import Galaxy from "@/components/internalComponents/galaxyComponents/Galaxy";
import { useCallback, useState } from "react";
import PlacementDock from "@/components/internalComponents/galaxyComponents/PlacementDock";
import { GalaxyMenu } from "@/components/internalComponents/galaxyComponents/GalaxyList";
import { Vector3 } from "three";
import { starData, UnplacedItem } from "@/lib/sampleGalaxyData";
import * as THREE from "three";

export default function SpacePage() {
    const [stars, setStars] = useState<any[]>(starData);
    const [newStarPosition, setNewStarPosition] = useState<number[]>([0, 0, 0])

    const [unplacedStars, setUnplacedStars] = useState<any[]>([
        { size: 0.05728905311847514, id: "star-1" },
    ]);

    const [unplacedPlanets, setUnplacedPlanets] = useState<any[]>([{ size: 0.010376034127708883, id: "planet-1" }]);
    const [unplacedItem, setUnplacedItem] = useState<UnplacedItem | null>(null);

    const confirmPlacement = useCallback(() => {
        if (!unplacedItem) return;
        else if (unplacedItem.type === "star") {
            setStars(prev => [...prev, {
                ...unplacedItem.details,
                position: newStarPosition
            }]);
        } else if (unplacedItem.type === "planet") {
            setStars(prev =>
                prev.map(star =>
                    star.id === unplacedItem.details.parentId
                        ? {
                            ...star,
                            children: [
                                ...(star.children ?? []),
                                {
                                    ...unplacedItem.details,
                                },
                            ],
                        }
                        : star
                )
            );
        }
        setUnplacedStars(prev => prev.filter(star => star.id != unplacedItem.details.id))
        setUnplacedItem(null);
    }, [unplacedItem, newStarPosition]);


    return (
        <div className="w-full h-screen relative">
            <Galaxy
                galaxyData={stars}
                unplacedItem={unplacedItem}
                setNewStarPosition={setNewStarPosition}
                cameraProps={{}}
            />
            <GalaxyMenu />
            <PlacementDock
                stars={unplacedStars}
                planets={unplacedPlanets}
                unplacedItem={unplacedItem}
                confirmPlacement={confirmPlacement}
                newStarPosition={newStarPosition}
                setUnplacedItem={setUnplacedItem}
            />
        </div>
    );
}
