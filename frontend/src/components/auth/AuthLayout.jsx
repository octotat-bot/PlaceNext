import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';

/* Route order — controls slide direction */
const ROUTE_ORDER = {
    '/login':           0,
    '/register':        1,
    '/forgot-password': 2,
    '/reset-password':  3,
};
const getOrder = (path) => ROUTE_ORDER[path] ?? 0;

/* Easing: fast-out, slow-in — feels like a native panel swipe */
const EASE = [0.32, 0.72, 0, 1];
const DURATION = 0.42;

const slideVariants = {
    /* Incoming page starts fully off-screen to the right (or left) */
    enter: (dir) => ({
        x: dir >= 0 ? '100%' : '-100%',
    }),
    /* Settles at origin */
    center: {
        x: '0%',
        transition: { duration: DURATION, ease: EASE },
    },
    /* Outgoing page slides away at 30% distance — creates depth / parallax */
    exit: (dir) => ({
        x: dir >= 0 ? '-30%' : '30%',
        transition: { duration: DURATION, ease: EASE },
    }),
};

const AuthLayout = () => {
    const location = useLocation();

    /* Only recompute direction when the path actually changes */
    const prevPathRef = useRef(location.pathname);
    const directionRef = useRef(0);

    if (prevPathRef.current !== location.pathname) {
        const prevOrder = getOrder(prevPathRef.current);
        const nextOrder = getOrder(location.pathname);
        directionRef.current = nextOrder - prevOrder;
        prevPathRef.current = location.pathname;
    }

    return (
        /*
         * height: 100vh (not minHeight) so that position:absolute children
         * don't collapse the container during the transition.
         */
        <div style={{
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--color-background-tertiary)',
        }}>
            {/* Subtle gold accent bar — always visible on auth pages */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, #e8a045 35%, #e8a045 65%, transparent 100%)',
                opacity: 0.3,
                zIndex: 9999,
                pointerEvents: 'none',
            }} />

            <AnimatePresence initial={false} custom={directionRef.current} mode="sync">
                <motion.div
                    key={location.pathname}
                    custom={directionRef.current}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{
                        position: 'absolute',
                        inset: 0,           /* top/right/bottom/left: 0 */
                        overflowY: 'auto',  /* each page scrolls independently */
                        willChange: 'transform',
                    }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AuthLayout;
