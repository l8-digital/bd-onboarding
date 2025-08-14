import React, {
    useEffect,
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import {Loader2} from "lucide-react";
import styles from "../style.module.scss";
import {AlertMessage} from "../../AlertMessage";

interface SelectLabelProps {
    id: string;
    label: string;
    value?: string | number;
    options: { label: string; value: string | number }[];
    setState?: (callback: (prevState: any) => any) => void;
    modifyStateExternal?: (id: string, value: string | number) => void;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    errorExternal?: string;
    className?: string;
    loading?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode; // <-- novo
    floating?: boolean; // <-- NOVO
}

export const SelectLabel = forwardRef<HTMLSelectElement, SelectLabelProps>(
    (
        {
            id,
            label,
            value = "",
            options,
            setState,
            modifyStateExternal,
            required = false,
            disabled = false,
            readOnly = false,
            placeholder = "Selecione",
            errorExternal,
            className,
            loading = false,
            prefix,
            suffix,
            floating
        },
        ref
    ) => {
        const internalRef = useRef<HTMLSelectElement>(null);
        const [localValue, setLocalValue] = useState<string | number>(value);
        const [error, setError] = useState<string | undefined>();

        useImperativeHandle(ref, () => internalRef.current!);

        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        useEffect(() => {
            setError(errorExternal);
        }, [errorExternal]);

        function updateValue(newValue: string | number) {
            if (modifyStateExternal) {
                modifyStateExternal(id, newValue);
            } else if (setState) {
                setState((prev: any) => ({
                    ...prev,
                    [id]: newValue,
                }));
            }
        }

        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selected = e.target.value;
            setLocalValue(selected);
            updateValue(selected);
            setError(undefined);
        };

        return (
            <div className={[
                styles.cGroup,
                floating ? styles['cGroup--float'] : styles['cGroup--fixed'],        // ou styles['cGroup--fixed']
                prefix ? styles.hasPrefix : '',
                suffix ? styles.hasSuffix : '',
                error ? styles.hasError : '',
                disabled ? styles.isDisabled : '',
            ].join(' ').trim()}
            >
                {!floating && (
                    <label className={styles.cGroup__label}>
                        {label}
                        {required && <span className="text-red">*</span>}
                    </label>
                )}
                <div className={styles.cGroup__fix}>
                    {prefix && <span className={styles['cGroup__fix--prefix']}>{prefix}</span>}

                    <div className={`${floating ? 'flex-col' : 'flex-col-reverse'} flex-1 flex relative`}>

                        <select
                            id={id}
                            ref={internalRef}
                            value={localValue}
                            onChange={handleChange}
                            disabled={disabled || readOnly || loading}
                            className={[
                                styles.cGroup__select, styles.customSelect,
                                className].join(' ').trim()}
                        >
                            <option value="" disabled>
                                {loading ? "Carregando..." : placeholder}
                            </option>
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        {floating && (
                            <label className={styles.cGroup__label}>
                                {label}
                                {required && <span className="text-red">*</span>}
                            </label>
                        )}
                    </div>

                    {suffix && <span className={styles['cGroup__fix--suffix']}>{suffix}</span>}
                </div>

                {error && <AlertMessage message={errorExternal} type="error"/>}
            </div>
        );
    }
);