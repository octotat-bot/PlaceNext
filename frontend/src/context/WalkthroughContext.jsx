// src/context/WalkthroughContext.jsx
// Exposes resetWalkthrough() to any Settings page without prop drilling.

import { createContext, useContext } from 'react';

export const WalkthroughContext = createContext({ resetWalkthrough: () => {} });

export const useWalkthroughReset = () => useContext(WalkthroughContext);
