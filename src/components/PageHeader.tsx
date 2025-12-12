import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    iconColor?: string;
    gradient?: string;
    action?: ReactNode;
    children?: ReactNode;
}

export const PageHeader = ({
    title,
    description,
    icon: Icon,
    iconColor = "text-primary",
    gradient = "from-primary via-primary/80 to-primary/60",
    action,
    children,
}: PageHeaderProps) => {
    return (
        <motion.div
            className="relative mb-8 pb-6 border-b border-border/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background gradient decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    {Icon && (
                        <motion.div
                            className={`p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-glow`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                            <Icon className={`h-8 w-8 ${iconColor}`} />
                        </motion.div>
                    )}
                    <div>
                        <motion.h1
                            className={`text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            className="text-muted-foreground text-lg max-w-2xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {description}
                        </motion.p>
                    </div>
                </div>

                {action && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {action}
                    </motion.div>
                )}
            </div>

            {children && (
                <motion.div
                    className="mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {children}
                </motion.div>
            )}
        </motion.div>
    );
};

// Modern card wrapper with entrance animation
interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const AnimatedCard = ({ children, className = "", delay = 0 }: AnimatedCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -2 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Page container with consistent styling
interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export const PageContainer = ({ children, className = "" }: PageContainerProps) => {
    return (
        <div className={`min-h-screen bg-background ${className}`}>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Results section wrapper
interface ResultsSectionProps {
    children: ReactNode;
    show: boolean;
}

export const ResultsSection = ({ children, show }: ResultsSectionProps) => {
    if (!show) return null;

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
};

export default PageHeader;
