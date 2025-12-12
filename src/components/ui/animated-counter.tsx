import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
    from?: number;
    to: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
    decimals?: number;
}

export const AnimatedCounter = ({
    from = 0,
    to,
    duration = 2,
    suffix = "",
    prefix = "",
    className = "",
    decimals = 0,
}: AnimatedCounterProps) => {
    const [count, setCount] = useState(from);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / (duration * 1000), 1);

            // Easing function (ease-out-cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = from + (to - from) * easeOut;

            setCount(currentValue);

            if (now < endTime) {
                requestAnimationFrame(updateCount);
            } else {
                setCount(to);
            }
        };

        requestAnimationFrame(updateCount);
    }, [isInView, from, to, duration]);

    const formattedCount = decimals > 0
        ? count.toFixed(decimals)
        : Math.round(count).toLocaleString();

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
        >
            {prefix}{formattedCount}{suffix}
        </motion.span>
    );
};

// Stats card with icon and counter
interface StatCardProps {
    icon: React.ReactNode;
    value: number;
    label: string;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export const StatCard = ({
    icon,
    value,
    label,
    suffix = "",
    prefix = "",
    className = "",
}: StatCardProps) => {
    return (
        <motion.div
            className={`flex flex-col items-center p-6 rounded-2xl glass ${className}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <div className="text-primary mb-3 p-3 rounded-xl bg-primary/10">
                {icon}
            </div>
            <AnimatedCounter
                to={value}
                suffix={suffix}
                prefix={prefix}
                className="text-4xl font-bold text-foreground"
            />
            <span className="text-muted-foreground text-sm mt-2">{label}</span>
        </motion.div>
    );
};

export default AnimatedCounter;
