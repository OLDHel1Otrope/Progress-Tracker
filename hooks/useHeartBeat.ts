import { useEffect, useRef } from "react";

export function useHeartbeat(callback: () => void, active: boolean, delay = 5 * 60 * 1000) {
    const saved = useRef(callback);
    useEffect(() => { saved.current = callback; });

    useEffect(() => {
        if (!active) return;
        const id = setInterval(() => saved.current(), delay);
        return () => clearInterval(id);
    }, [active, delay]);
}