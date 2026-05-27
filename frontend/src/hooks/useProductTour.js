import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useProductTour(steps = []) {
    const { user } = useAuth();
    const storageKey = user ? `tour_complete_${user._id}` : null;
    const [active, setActive] = useState(false);
    const [step, setStep] = useState(0);

    const complete = useCallback(() => {
        if (storageKey) localStorage.setItem(storageKey, 'true');
        setActive(false);
        setStep(0);
    }, [storageKey]);

    useEffect(() => {
        if (!storageKey) return;
        const timer = setTimeout(() => {
            if (!localStorage.getItem(storageKey)) setActive(true);
        }, 600);
        
        const handleRestart = () => {
            if (storageKey) localStorage.removeItem(storageKey);
            setStep(0);
            setActive(true);
        };

        window.addEventListener('restart_product_tour', handleRestart);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('restart_product_tour', handleRestart);
        };
    }, [storageKey]);

    const next = useCallback(() => {
        if (step < steps.length - 1) setStep(s => s + 1);
        else complete();
    }, [step, steps.length, complete]);

    const back = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

    const restart = useCallback(() => {
        // Trigger the custom event so the global instance picks it up
        window.dispatchEvent(new Event('restart_product_tour'));
    }, []);

    return { active, step, currentStep: steps[step], next, back, complete, restart };
}
