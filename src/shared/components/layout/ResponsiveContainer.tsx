import React from "react";
import classNames from "classnames";

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
    return (
        <div
            className={classNames(
                "min-w-[360px] max-w-[940px]", // Constraint
                "mx-auto w-full", // Center align
                "min-h-screen flex flex-col",
                "bg-background text-label-900", // Default colors
                "shadow-2xl shadow-black/5", // Subtle drop shadow for app-like feel
                "relative overflow-x-hidden", // Prevent horizontal overflow
                className
            )}
        >
            {children}
        </div>
    );
}
