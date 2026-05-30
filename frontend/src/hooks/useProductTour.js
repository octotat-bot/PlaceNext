// src/hooks/useProductTour.js
// Manages the tour step state.
// AppShell decides WHEN to mount ProductTour (via useWalkthroughGate).
// Once mounted, this hook auto-starts the tour after a short delay,
// and calls onDone/onSkip when the user finishes or skips.
// Storage writes (marking walkthrough done) happen in AppShell via useWalkthroughGate.

import { useState, useEffect, useCallback } from 'react';

export function useProductTour(steps = [], { onDone, onSkip } = {}) {
    const [active, setActive] = useState(false);
    const [step, setStep] = useState(0);

    // Auto-start once mounted — wait for DOM elements to be painted
    useEffect(() => {
        if (!steps.length) return;
        const timer = setTimeout(() => setActive(true), 1200);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const complete = useCallback(() => {
        setActive(false);
        setStep(0);
        if (onDone) onDone();
    }, [onDone]);

    const skip = useCallback(() => {
        setActive(false);
        setStep(0);
        if (onSkip) onSkip();
    }, [onSkip]);

    const next = useCallback(() => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        } else {
            complete();
        }
    }, [step, steps.length, complete]);

    const back = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

    return { active, step, currentStep: steps[step], next, back, complete, skip };
}
