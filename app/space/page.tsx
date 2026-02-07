"use client";
import Galaxy from "@/components/internalComponents/galaxyComponents/Galaxy";
import { useState } from "react";
import PlacementDock from "@/components/internalComponents/galaxyComponents/PlacementDock";
import { GalaxyNavigator } from "@/components/internalComponents/galaxyComponents/GlaxyNavigator";

export default function SpacePage() {
    const [unplacedStars, setUnplacedStars] = useState<any[]>([
        { size: 0.05728905311847514 },
    ]);

    const [unplacedPlanets, setUnplacedPlanets] = useState<any[]>([{size: 0.010376034127708883}]);
    const [placingStar, setPlacingStar] = useState<any | null>(null);
    const [placingPlanet, setPlacingPlanet] = useState<any | null>(null);

    return (
        <div className="w-full h-screen relative">
            <Galaxy
                unplacedStars={unplacedStars}
                setUnplacedStars={setUnplacedStars}
                placingStar={placingStar}
                setPlacingStar={setPlacingStar}
                placingPlanet={placingPlanet}
                setPlacingPlanet={setPlacingPlanet}
            />
            <PlacementDock
                stars={unplacedStars}
                setPlacingStar={setPlacingStar}
                planets={unplacedPlanets}
                setPlacingPlanet={setPlacingPlanet}
            />

        </div>
    );
}
