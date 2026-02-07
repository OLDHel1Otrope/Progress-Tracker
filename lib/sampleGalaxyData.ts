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
                orbitSeed: 0.5000075780067951,
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
    }
]

export const galaxyCenter = (stars: typeof starData) => stars.reduce((sum, star) => sum.map((coord, i) => coord + star.position[i]), [0, 0, 0]).map(coord => coord / stars.length);