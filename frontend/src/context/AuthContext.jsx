import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Initialize from sessionStorage immediately
    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!sessionStorage.getItem('token');
    });

    const checkAuth = useCallback(async () => {
        const token = sessionStorage.getItem('token');
        if (token) {
            try {
                setAuthToken(token);
                const { data } = await authAPI.getMe();
                setUser(data.user);
                setProfile(data.profile);
                setIsAuthenticated(true);
                // Update stored user data
                sessionStorage.setItem('user', JSON.stringify(data.user));
            } catch (error) {
                console.error('Auth check failed:', error);
                // Only clear if it's an auth error (401)
                if (error.response?.status === 401) {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    setAuthToken(null);
                    setUser(null);
                    setProfile(null);
                    setIsAuthenticated(false);
                }
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Set token from sessionStorage on mount
        const token = sessionStorage.getItem('token');
        if (token) {
            setAuthToken(token);
        }
        // Auth check on mount - async setState is intentional here
        checkAuth(); // eslint-disable-line react-hooks/set-state-in-effect
    }, [checkAuth]);

    const login = async (identifier, password) => {
        // Determine if identifier is email or phone
        const isPhone = /^[6-9]\d{9}$/.test(identifier);
        const payload = { password };

        if (isPhone) {
            payload.phone = identifier;
        } else {
            payload.email = identifier;
        }

        const { data } = await authAPI.login(payload);
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        setAuthToken(data.token);
        setUser(data.user);
        setProfile(data.profile);
        setIsAuthenticated(true);
        return data;
    };

    const register = async (email, password, role = 'student', name = null, phone = null, companyName = null) => {
        const payload = { email, password, role };

        // Add common fields
        if (name) payload.name = name;

        // Role-specific fields
        if (role === 'student' && phone) {
            payload.phone = phone;
        }
        if (role === 'recruiter' && companyName) {
            payload.companyName = companyName;
        }

        const { data } = await authAPI.register(payload);

        // For recruiters with pending status, don't set auth state (they can't login yet)
        if (data.requiresApproval) {
            return data;
        }

        // For students (and any auto-approved role), set auth state
        if (data.token) {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            setAuthToken(data.token);
            setUser(data.user);
            setIsAuthenticated(true);
        }

        return data;
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setAuthToken(null);
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
    };

    const updateProfile = (newProfile) => {
        setProfile(newProfile);
    };

    const updateOnboardingStatus = (status) => {
        if (user) {
            const updatedUser = { ...user, hasCompletedOnboarding: status };
            setUser(updatedUser);
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        profile,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        updateOnboardingStatus,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
