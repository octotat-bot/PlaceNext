import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ variant = 'icon' }) => {
    const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme, isDark } = useTheme();

    // Simple icon toggle
    if (variant === 'icon') {
        return (
            <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                <motion.div
                    key={theme}
                    initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                >
                    {isDark ? (
                        <Sun className="w-5 h-5 text-[var(--text)]" />
                    ) : (
                        <Moon className="w-5 h-5 text-[var(--text)]" />
                    )}
                </motion.div>
            </button>
        );
    }

    // Dropdown with options
    if (variant === 'dropdown') {
        return (
            <div className="flex items-center gap-1 p-1 bg-[var(--surface-hover)] rounded-xl">
                <button
                    onClick={setLightTheme}
                    className={`p-2 rounded-lg transition-all ${theme === 'light'
                            ? 'bg-white shadow text-[var(--text)]'
                            : 'text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                    title="Light mode"
                >
                    <Sun className="w-4 h-4" />
                </button>
                <button
                    onClick={setDarkTheme}
                    className={`p-2 rounded-lg transition-all ${theme === 'dark'
                            ? 'bg-[var(--surface)] shadow text-[var(--text)]'
                            : 'text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                    title="Dark mode"
                >
                    <Moon className="w-4 h-4" />
                </button>
                <button
                    onClick={setSystemTheme}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] transition-all"
                    title="Use system preference"
                >
                    <Monitor className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return null;
};

export default ThemeToggle;
