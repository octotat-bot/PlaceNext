// src/hooks/useWalkthroughGate.js
// Decides whether to show the walkthrough for a given user.
// Uses localStorage (permanent) so once seen, never shown again — even after tab close.

import { useState, useEffect } from 'react';

/**
 * @param {string|undefined} userId
 * @returns {{ shouldShow: boolean, markDone: () => void, resetWalkthrough: () => void }}
 */
export function useWalkthroughGate(userId) {
  const key = userId ? `walkthrough_done_${userId}` : null;

  const [shouldShow, setShouldShow] = useState(() => {
    if (!key) return false;
    return !localStorage.getItem(key);
  });

  // Re-evaluate when userId changes (different user logs in)
  useEffect(() => {
    if (!key) { setShouldShow(false); return; }
    setShouldShow(!localStorage.getItem(key));
  }, [key]);

  const markDone = () => {
    if (!key) return;
    localStorage.setItem(key, '1');
    setShouldShow(false);
  };

  const resetWalkthrough = () => {
    if (!key) return;
    localStorage.removeItem(key);
    setShouldShow(true);
  };

  return { shouldShow, markDone, resetWalkthrough };
}
