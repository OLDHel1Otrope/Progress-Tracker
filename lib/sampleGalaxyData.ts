export interface StarData {
    id: string;
    name?: string;
    description?: string;
    position: [number, number, number];
    planets: number;
    size: number;
    children?: PlanetData[];
}

export interface PlanetData {
    id: string;
    name?: string;
    description?: string;
    orbitRadius: number;
    orbitSpeed: number;
    orbitPhase: number;
    orbitInclination: number;
    size: number;
}

type StarLoose = Partial<Omit<StarData, "id" | "size">> & {
    id: string;
    size: number;
};

type PlanetLoose = Partial<Omit<PlanetData, "id" | "size">> & {
    id: string;
    size: number;
    parentId: string;
};

export type UnplacedItem =
  | {
      type: "star";
      details: StarLoose;
    }
  | {
      type: "planet";
      details: PlanetLoose;
    };



export const starData = [
    {
        position: [
            -7.396237507558592,
            -1.5757458288763608,
            -4.754057602773434
        ],
        planets: 6,
        size: 0.05728905311847514,
        children: [
            {
                orbitRadius: 1.5,
                orbitSpeed: 0.5000243896696279,
                orbitPhase: 0.2357216257844697,
                orbitInclination: 0.06979758987807583,
                size: 0.010376034127708883
            },
            {
                orbitRadius: 2.7,
                orbitSpeed: 0.5000075780067951,
                orbitPhase: 4.687535554648099,
                orbitInclination: 0.14435685112853291,
                size: 0.010525955045595928
            },
            {
                orbitRadius: 3.9,
                orbitSpeed: 0.5008106387511827,
                orbitPhase: 5.801135393445374,
                orbitInclination: -0.10934394970105099,
                size: 0.01057343112726715
            },
            {
                orbitRadius: 3.5,
                orbitSpeed: 0.5002248287522659,
                orbitPhase: 4.036581955091213,
                orbitInclination: -0.1784331484049298,
                size: 0.01093003207770837
            }
        ]
    },
    {
        position: [
            5.234891234567891,
            3.8765432109876543,
            -8.912345678901234
        ],
        planets: 3,
        size: 0.08234567890123456,
        children: [
            {
                orbitRadius: 2.1,
                orbitSpeed: 0.5003456789012345,
                orbitPhase: 1.2345678901234567,
                orbitInclination: 0.08765432109876543,
                size: 0.012345678901234567
            },
            // {
            //     orbitRadius: 4.5,
            //     orbitSpeed: 0.5001234567890123,
            //     orbitPhase: 3.456789012345678,
            //     orbitInclination: -0.12345678901234567,
            //     size: 0.009876543210987654
            // },
            // {
            //     orbitRadius: 6.8,
            //     orbitSpeed: 0.5006789012345678,
            //     orbitPhase: 2.3456789012345678,
            //     orbitInclination: 0.15678901234567890,
            //     size: 0.011234567890123456
            // }
        ]
    },
    // {
    //     position: [
    //         -2.123456789012345,
    //         6.543210987654321,
    //         3.234567890123456
    //     ],
    //     planets: 8,
    //     size: 0.09876543210987654,
    //     children: [
    //         {
    //             orbitRadius: 1.2,
    //             orbitSpeed: 0.5004567890123456,
    //             orbitPhase: 0.9876543210987654,
    //             orbitInclination: 0.04567890123456789,
    //             size: 0.008765432109876543
    //         },
    //         {
    //             orbitRadius: 2.4,
    //             orbitSpeed: 0.5002345678901234,
    //             orbitPhase: 5.123456789012345,
    //             orbitInclination: 0.09876543210987654,
    //             size: 0.010987654321098765
    //         },
    //         {
    //             orbitRadius: 3.6,
    //             orbitSpeed: 0.5007890123456789,
    //             orbitPhase: 4.234567890123456,
    //             orbitInclination: -0.08765432109876543,
    //             size: 0.009234567890123456
    //         },
    //         {
    //             orbitRadius: 5.1,
    //             orbitSpeed: 0.5001876543210987,
    //             orbitPhase: 3.876543210987654,
    //             orbitInclination: 0.13456789012345678,
    //             size: 0.011876543210987654
    //         },
    //         {
    //             orbitRadius: 6.9,
    //             orbitSpeed: 0.5005432109876543,
    //             orbitPhase: 1.456789012345678,
    //             orbitInclination: -0.16789012345678901,
    //             size: 0.010345678901234567
    //         },
    //         {
    //             orbitRadius: 8.3,
    //             orbitSpeed: 0.5003210987654321,
    //             orbitPhase: 2.987654321098765,
    //             orbitInclination: 0.11234567890123456,
    //             size: 0.012987654321098765
    //         }
    //     ]
    // },
    // {
    //     position: [
    //         8.765432109876543,
    //         -4.321098765432109,
    //         -1.876543210987654
    //     ],
    //     planets: 5,
    //     size: 0.06543210987654321,
    //     children: [
    //         {
    //             orbitRadius: 1.8,
    //             orbitSpeed: 0.5002987654321098,
    //             orbitPhase: 0.5432109876543210,
    //             orbitInclination: 0.07654321098765432,
    //             size: 0.009543210987654321
    //         },
    //         {
    //             orbitRadius: 3.2,
    //             orbitSpeed: 0.5005678901234567,
    //             orbitPhase: 4.321098765432109,
    //             orbitInclination: 0.12987654321098765,
    //             size: 0.011098765432109876
    //         },
    //         {
    //             orbitRadius: 4.7,
    //             orbitSpeed: 0.5001543210987654,
    //             orbitPhase: 3.654321098765432,
    //             orbitInclination: -0.09543210987654321,
    //             size: 0.010654321098765432
    //         },
    //         {
    //             orbitRadius: 6.1,
    //             orbitSpeed: 0.5004321098765432,
    //             orbitPhase: 2.109876543210987,
    //             orbitInclination: -0.14321098765432109,
    //             size: 0.012109876543210987
    //         },
    //         {
    //             orbitRadius: 7.8,
    //             orbitSpeed: 0.5006543210987654,
    //             orbitPhase: 5.876543210987654,
    //             orbitInclination: 0.10987654321098765,
    //             size: 0.009876543210987654
    //         }
    //     ]
    // },
    // {
    //     position: [
    //         -9.876543210987654,
    //         2.345678901234567,
    //         7.654321098765432
    //     ],
    //     planets: 4,
    //     size: 0.07234567890123456,
    //     children: [
    //         {
    //             orbitRadius: 2.3,
    //             orbitSpeed: 0.5003765432109876,
    //             orbitPhase: 1.765432109876543,
    //             orbitInclination: 0.05432109876543210,
    //             size: 0.011654321098765432
    //         },
    //         {
    //             orbitRadius: 3.8,
    //             orbitSpeed: 0.5001987654321098,
    //             orbitPhase: 4.987654321098765,
    //             orbitInclination: -0.11654321098765432,
    //             size: 0.010234567890123456
    //         },
    //         {
    //             orbitRadius: 5.4,
    //             orbitSpeed: 0.5007654321098765,
    //             orbitPhase: 2.654321098765432,
    //             orbitInclination: 0.14987654321098765,
    //             size: 0.009654321098765432
    //         },
    //         {
    //             orbitRadius: 7.2,
    //             orbitSpeed: 0.5002654321098765,
    //             orbitPhase: 3.321098765432109,
    //             orbitInclination: -0.13210987654321098,
    //             size: 0.012654321098765432
    //         }
    //     ]
    // },
    // {
    //     position: [
    //         3.456789012345678,
    //         -7.890123456789012,
    //         -5.432109876543210
    //     ],
    //     planets: 7,
    //     size: 0.08765432109876543,
    //     children: [
    //         {
    //             orbitRadius: 1.4,
    //             orbitSpeed: 0.5004987654321098,
    //             orbitPhase: 0.8765432109876543,
    //             orbitInclination: 0.06543210987654321,
    //             size: 0.008987654321098765
    //         },
    //         {
    //             orbitRadius: 2.9,
    //             orbitSpeed: 0.5002876543210987,
    //             orbitPhase: 5.234567890123456,
    //             orbitInclination: 0.10654321098765432,
    //             size: 0.010876543210987654
    //         },
    //         {
    //             orbitRadius: 4.2,
    //             orbitSpeed: 0.5006321098765432,
    //             orbitPhase: 3.765432109876543,
    //             orbitInclination: -0.12654321098765432,
    //             size: 0.011543210987654321
    //         },
    //         {
    //             orbitRadius: 5.6,
    //             orbitSpeed: 0.5001654321098765,
    //             orbitPhase: 2.543210987654321,
    //             orbitInclination: 0.15432109876543210,
    //             size: 0.009321098765432109
    //         },
    //         {
    //             orbitRadius: 7.1,
    //             orbitSpeed: 0.5005210987654321,
    //             orbitPhase: 4.654321098765432,
    //             orbitInclination: -0.08210987654321098,
    //             size: 0.012321098765432109
    //         },
    //         {
    //             orbitRadius: 8.7,
    //             orbitSpeed: 0.5003543210987654,
    //             orbitPhase: 1.987654321098765,
    //             orbitInclination: 0.11876543210987654,
    //             size: 0.010765432109876543
    //         },
    //         {
    //             orbitRadius: 9.9,
    //             orbitSpeed: 0.5007321098765432,
    //             orbitPhase: 5.543210987654321,
    //             orbitInclination: -0.16543210987654321,
    //             size: 0.009109876543210987
    //         }
    //     ]
    // }
];

export const galaxyCenter = (stars: typeof starData) => stars.reduce((sum, star) => sum.map((coord, i) => coord + star.position[i]), [0, 0, 0]).map(coord => coord / stars.length);