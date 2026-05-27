import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the input value.
 * The debounced value only updates after the specified delay.
 * @param {*} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 */
export const useDebouncedValue = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};
