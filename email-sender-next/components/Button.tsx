
import React from "react";

interface ButtonProps {
    text: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export default function Button({
    text,
    onClick,
    type = "button",
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    className = "",
    fullWidth = false,
    icon = null,
}: ButtonProps) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";

    const variants = {
        primary: "bg-[#0b57d0] text-white hover:bg-[#0b57d0]/90 hover:shadow-md border border-transparent",
        secondary: "bg-white text-[#0b57d0] border border-gray-200 hover:bg-blue-50 hover:border-blue-200", // Outlined-ish
        danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-md border border-transparent",
        ghost: "text-gray-600 hover:bg-gray-100",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    };

    const sizes = {
        sm: "px-4 py-1.5 text-xs",
        md: "px-6 py-2 text-sm",
        lg: "px-8 py-2.5 text-base",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        ${base} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    wait...
                </span>
            ) : (
                <>
                    {icon && <span>{icon}</span>}
                    {text}
                </>
            )}
        </button>
    );
}
