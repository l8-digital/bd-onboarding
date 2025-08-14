import React from 'react';
import styles from './../style.module.scss'; // Reutiliza a base de estilo do InputLabel
import {AlertMessage} from "../../AlertMessage";

interface CheckboxLabelProps {
    id: string;
    label: string;
    value: boolean | undefined;
    setState?: (callback: (prev: any) => any) => void;
    modifyStateExternal?: (id: string, value: boolean) => void;
    disabled?: boolean;
    errorExternal?: string;
}

export const CheckboxLabel: React.FC<CheckboxLabelProps> = ({
                                                                id,
                                                                label,
                                                                value,
                                                                setState,
                                                                modifyStateExternal,
                                                                disabled = false,
                                                                errorExternal,
                                                            }) => {
    const handleChange = () => {
        const newValue = !value;
        if (modifyStateExternal) {
            modifyStateExternal(id, newValue);
        } else if (setState) {
            setState((prev: any) => ({...prev, [id]: newValue}));
        }
    };

    return (
        <div className={`${styles.cFloat} flex items-center justify-between`}>
            <label className="text-sm text-neutral/60">
                {label}
            </label>

            <button
                id={id}
                type="button"
                onClick={handleChange}
                disabled={disabled}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                    value ? 'bg-green' : 'bg-neutral/30'
                } ${disabled ? 'opacity-50' : ''}`}
            >
        <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                value ? 'translate-x-5' : ''
            }`}
        />
            </button>

            {errorExternal && <AlertMessage message={errorExternal} type="error"/>}
        </div>
    );
};