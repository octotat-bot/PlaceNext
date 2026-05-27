import { cn } from '../../utils/helpers';
import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    glass = false,
    padding = 'md',
    hover = true,
    animate = false,
    delay = 0,
    ...props
}) => {
    const paddingSizes = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const baseClassName = cn(
        glass ? 'card-glass' : 'card',
        paddingSizes[padding],
        hover && !animate ? 'transition-transform hover:-translate-y-1' : '',
        className
    );

    // Only use motion.div when animate is true
    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: delay }}
                whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
                className={baseClassName}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    // Use regular div for non-animated cards
    return (
        <div className={baseClassName} {...props}>
            {children}
        </div>
    );
};

export default Card;
