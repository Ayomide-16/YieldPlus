import { useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    tiltAmount?: number;
    glareEnable?: boolean;
    scale?: number;
}

export const TiltCard = ({
    children,
    className = "",
    tiltAmount = 10,
    glareEnable = true,
    scale = 1.02,
}: TiltCardProps) => {
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation (inverted for natural feel)
        const rotateXValue = (mouseY / (rect.height / 2)) * -tiltAmount;
        const rotateYValue = (mouseX / (rect.width / 2)) * tiltAmount;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);

        // Calculate glare position
        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        setGlarePosition({ x: glareX, y: glareY });
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setGlarePosition({ x: 50, y: 50 });
    };

    return (
        <motion.div
            ref={cardRef}
            className={`relative ${className}`}
            style={{
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            animate={{
                rotateX,
                rotateY,
                scale: rotateX !== 0 || rotateY !== 0 ? scale : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {/* Glare effect */}
            {glareEnable && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
                    style={{
                        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                        opacity: rotateX !== 0 || rotateY !== 0 ? 1 : 0,
                        transition: "opacity 0.3s ease",
                    }}
                />
            )}
        </motion.div>
    );
};

// Feature card with 3D tilt
interface TiltFeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    gradient?: string;
    href?: string;
    onClick?: () => void;
}

export const TiltFeatureCard = ({
    icon,
    title,
    description,
    gradient = "from-primary/20 to-primary/5",
    href,
    onClick,
}: TiltFeatureCardProps) => {
    const content = (
        <TiltCard className="h-full">
            <div
                className={`h-full p-6 rounded-2xl border border-border/50 bg-gradient-to-br ${gradient} glass cursor-pointer group`}
                onClick={onClick}
            >
                <motion.div
                    className="w-14 h-14 rounded-xl bg-background/80 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-glow transition-shadow duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                >
                    {icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </p>
            </div>
        </TiltCard>
    );

    if (href) {
        return <a href={href} className="block h-full">{content}</a>;
    }

    return content;
};

export default TiltCard;
