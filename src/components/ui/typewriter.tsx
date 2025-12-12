import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterProps {
    texts: string[];
    className?: string;
    speed?: number;
    deleteSpeed?: number;
    pauseDuration?: number;
    cursor?: boolean;
}

export const Typewriter = ({
    texts,
    className = "",
    speed = 50,
    deleteSpeed = 30,
    pauseDuration = 2000,
    cursor = true,
}: TypewriterProps) => {
    const [displayText, setDisplayText] = useState("");
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = texts[textIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentText.length) {
                    setDisplayText(currentText.slice(0, displayText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), pauseDuration);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(displayText.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setTextIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, isDeleting ? deleteSpeed : speed);

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, textIndex, texts, speed, deleteSpeed, pauseDuration]);

    return (
        <span className={className}>
            {displayText}
            {cursor && (
                <motion.span
                    className="inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            )}
        </span>
    );
};

// Simple text reveal animation
interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
}

export const TextReveal = ({ text, className = "", delay = 0 }: TextRevealProps) => {
    return (
        <motion.span
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
        >
            {text}
        </motion.span>
    );
};

// Word by word reveal
interface WordRevealProps {
    text: string;
    className?: string;
    wordClassName?: string;
    staggerDelay?: number;
}

export const WordReveal = ({
    text,
    className = "",
    wordClassName = "",
    staggerDelay = 0.1
}: WordRevealProps) => {
    const words = text.split(" ");

    return (
        <span className={className}>
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    className={`inline-block ${wordClassName}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        delay: index * staggerDelay,
                        ease: "easeOut",
                    }}
                >
                    {word}
                    {index < words.length - 1 && "\u00A0"}
                </motion.span>
            ))}
        </span>
    );
};

export default Typewriter;
