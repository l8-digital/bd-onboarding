import React from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface AlertMessageProps {
    message?: string;
    type?: "error" | "success" | "warning" | "info";
    className?: string;
    fullWidth?: boolean;
}

const icons = {
    error: '',
    success: <CheckCircleIcon className="w-4 h-4 mr-1 stroke-green" />,
    warning: <ExclamationTriangleIcon className="w-4 h-4 mr-1 text-black" />,
    info: <InformationCircleIcon className="w-4 h-4 mr-1 text-white" />,
};

const styles = {
    error: "absolute text-red",
    success: "px-2 py-1.5 mt-0.5 bg-green/20 text-green",
    warning: "bg-yellow-300 text-black",
    info: "bg-blue text-white",
};

export const AlertMessage: React.FC<AlertMessageProps> = ({ message, type = "info", className = "", fullWidth }) => {
    if (!message) return null;

    return (
        <div className={`flex items-center rounded text-xs  ${styles[type]} ${className} ${fullWidth ? 'w-full' : ''}`}>
            {icons[type]}
            <p className="flex-1">{message}</p>
        </div>
    );
};
