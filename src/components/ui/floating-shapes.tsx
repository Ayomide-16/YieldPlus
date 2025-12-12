import { motion } from "framer-motion";
import { useMemo } from "react";

interface FloatingShapesProps {
    count?: number;
    className?: string;
}

type ShapeType = "circle" | "hexagon" | "leaf" | "diamond" | "ring";

interface Shape {
    id: number;
    type: ShapeType;
    size: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
    opacity: number;
}

const ShapeComponent = ({ type, size, className }: { type: ShapeType; size: number; className?: string }) => {
    switch (type) {
        case "circle":
            return (
                <div
                    className={`rounded-full bg-primary/10 ${className}`}
                    style={{ width: size, height: size }}
                />
            );
        case "hexagon":
            return (
                <div
                    className={className}
                    style={{
                        width: size,
                        height: size * 0.866,
                        background: "hsla(142, 76%, 36%, 0.1)",
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                />
            );
        case "leaf":
            return (
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill="none"
                    className={className}
                >
                    <path
                        d="M12 2C6 2 2 8 2 12c0 5 4 10 10 10 4 0 8-4 8-8 0-6-4-12-8-12z"
                        fill="hsla(142, 76%, 36%, 0.15)"
                    />
                    <path
                        d="M12 22V8"
                        stroke="hsla(142, 76%, 36%, 0.2)"
                        strokeWidth="1"
                    />
                </svg>
            );
        case "diamond":
            return (
                <div
                    className={className}
                    style={{
                        width: size,
                        height: size,
                        background: "hsla(142, 76%, 36%, 0.08)",
                        transform: "rotate(45deg)",
                        borderRadius: "4px",
                    }}
                />
            );
        case "ring":
            return (
                <div
                    className={`rounded-full border-2 border-primary/10 ${className}`}
                    style={{ width: size, height: size }}
                />
            );
        default:
            return null;
    }
};

export const FloatingShapes = ({ count = 15, className = "" }: FloatingShapesProps) => {
    const shapes = useMemo<Shape[]>(() => {
        const types: ShapeType[] = ["circle", "hexagon", "leaf", "diamond", "ring"];

        return Array.from({ length: count }, (_, i) => ({
            id: i,
            type: types[Math.floor(Math.random() * types.length)],
            size: 20 + Math.random() * 60,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: 15 + Math.random() * 20,
            delay: Math.random() * 5,
            opacity: 0.3 + Math.random() * 0.4,
        }));
    }, [count]);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {shapes.map((shape) => (
                <motion.div
                    key={shape.id}
                    className="absolute"
                    style={{
                        left: `${shape.x}%`,
                        top: `${shape.y}%`,
                        opacity: shape.opacity,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, 15, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: shape.duration,
                        delay: shape.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <ShapeComponent type={shape.type} size={shape.size} />
                </motion.div>
            ))}
        </div>
    );
};

// Gradient mesh background
export const GradientMesh = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Primary gradient blob */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
                style={{
                    background: "radial-gradient(circle, hsl(142 76% 36%) 0%, transparent 70%)",
                    left: "-10%",
                    top: "-20%",
                }}
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Secondary gradient blob */}
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
                style={{
                    background: "radial-gradient(circle, hsl(33 100% 50%) 0%, transparent 70%)",
                    right: "-10%",
                    bottom: "-10%",
                }}
                animate={{
                    x: [0, -80, 0],
                    y: [0, -60, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Accent gradient blob */}
            <motion.div
                className="absolute w-[300px] h-[300px] rounded-full blur-3xl opacity-10"
                style={{
                    background: "radial-gradient(circle, hsl(142 50% 50%) 0%, transparent 70%)",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                }}
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
};

export default FloatingShapes;
