import { useEffect, useRef } from 'react';

export default function useDebouncedSave<T>(
    value: T,
    delay: number,
    callback: (val: T) => void
) {
    // setTimeout bisa return number (browser) atau Timeout (Node)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            callback(value);
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [value, delay, callback]);
}
