"use client";

import { ChevronsRight, Cross, Snail, Soup } from "lucide-react";
import Image from "next/image";

interface CenteredGridProps {
    images: string[];
}

export default function CenteredGrid({ images }: CenteredGridProps) {
    return (
        <div
            className="
        h-[95vh]
        w-full
        flex
        items-center
        justify-center
        bg-stone-1000
      "
        >
            {/* Grid Container */}
            <div
                className="
          grid
          grid-cols-3
          gap-6
          place-items-center
          max-w-6xl
          p-6
        "
            >
                {images.map((src, index) => (
                    <div
                        key={index}
                        className="
    relative
    w-80
    h-48
    rounded-xl
    bg-stone-800/30
    shadow-lg
    hover:scale-105
    transition-transform
    border border-stone-700/30
    backdrop-blur-lg
    overflow-hidden
  "
                    >
                        {/* Image */}
                        <Image
                            src={src}
                            alt={`Image ${index}`}
                            fill
                            className="object-cover"
                        />

                        {/* Inset Shadow Overlay */}
                        <div
                            className="
      pointer-events-none
      absolute inset-0
      rounded-none
      shadow-[inset_0_0_20px_rgba(0,0,0,0.7)]
    "
                        />
                    </div>

                ))}
                <div
                    key={"s"}
                    className="
              w-80
              h-48
              rounded-xl
              overflow-hidden
              bg-stone-900/30
              shadow-lg
              hover:scale-105
              hover:bg-stone-700/50
              transition-transform
              border border-stone-700/30 backdrop-blur-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]
              flex flex-col items-center justify-center
            "
                >
                    <Soup size={116} strokeWidth={1.5} />
                </div>
                <div
                    key={"t"}
                    className="
              w-80
              h-48
              rounded-xl
              overflow-hidden
              bg-stone-900/30
              shadow-lg
              hover:scale-105
              hover:bg-stone-700/50
              transition-transform
              border border-stone-700/30 backdrop-blur-lg shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]
              flex flex-row items-center justify-center
            "
                >
                    <ChevronsRight size={90} strokeWidth={1.5}/>
                    <Snail size={90} strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}
