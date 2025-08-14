import React, {
    forwardRef,
    useEffect,
    useState,
    useImperativeHandle,
    useRef
} from "react";
import styles from './../style.module.scss';
import {AlertMessage} from "../../AlertMessage";
import {formatInteger} from "@/components/FormsElements/helpers/formatInteger";
import {formatSlug} from "@/components/FormsElements/helpers/formatSlug";
import {formatExpiry} from "@/components/FormsElements/helpers/formatExpiry";
import {formatCreditCard} from "@/components/FormsElements/helpers/formatCreditCard";
import {formatCep} from "@/components/FormsElements/helpers/formatCep";
import {formatCpf} from "@/components/FormsElements/helpers/formatCpf";
import {formatDocInput} from "@/components/FormsElements/helpers/formatDocInput";
import {formatPercentage} from "@/components/FormsElements/helpers/formatPercentage";
import {formatCurrency2} from "@/components/FormsElements/helpers/formatCurrency2";
import {formatNumbers} from "@/components/FormsElements/helpers/formatNumbers";

interface InputLabelTextTypes {
    label: string;
    value?: any;
    disabled?: boolean;
    id: string;
    setState?: (callback: (prevState: any) => any) => void;
    required?: boolean;
    type?: string;
    externalRules?: { rule: RegExp, error: string }[];
    statusVerifyErrors?: string;
    placeholder?: string;
    loadingExternal?: boolean;
    modifyStateExternal?: (id: string, value: any) => void;
    maskType?:
        | 'currency'
        | 'document'
        | 'phone'
        | 'percentage'
        | 'integer'
        | 'cep'
        | 'cpf'
        | 'creditcard'
        | 'expiry'
        | 'slug'
        | 'coupon';
    minLength?: number;
    maxLength?: number;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode; // <-- novo
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    readOnly?: boolean;
    errorExternal?: string;
    className?: string;
    min?: number;
    max?: number;
    autoComplete?: string;
}

export const InputLabel = forwardRef<HTMLInputElement, InputLabelTextTypes>((props, ref) => {
    const {
        label,
        value = '',
        disabled = false,
        id,
        setState,
        required,
        type = 'text',
        statusVerifyErrors = 'manual',
        placeholder,
        maskType,
        min,
        max,
        minLength,
        prefix,
        suffix,
        onBlur,
        readOnly,
        maxLength,
        modifyStateExternal,
        errorExternal,
        className,
        autoComplete
    } = props;

    const internalRef = useRef<HTMLInputElement>(null);
    const [valueLocal, setValueLocal] = useState<any>(value);
    const [error, setError] = useState<string | undefined>();
    const [isEditing, setIsEditing] = useState(false);

    useImperativeHandle(ref, () => internalRef.current!);

    useEffect(() => {
        if (!isEditing) setValueLocal(value);
        if (value) setError(undefined);
    }, [value]);

    useEffect(() => {
        setError(errorExternal);
    }, [errorExternal]);

    useEffect(() => {
        if (statusVerifyErrors === 'clear') setError(undefined);
    }, [statusVerifyErrors]);

    const getMaskedValue = (val: any) => {
        if (maskType === 'currency') return formatCurrency2(val)?.masked;
        if (maskType === 'percentage') return formatPercentage(val)?.masked;
        if (maskType === 'document') return formatDocInput(val, true);
        if (maskType === 'cpf') return formatCpf(val);
        if (maskType === 'phone') return formatNumbers(val);
        if (maskType === 'cep') return formatCep(val);
        if (maskType === 'creditcard') return formatCreditCard(val);
        if (maskType === 'expiry') return formatExpiry(val);
        if (maskType === 'integer') return formatInteger(val, min, max)?.masked;
        if (maskType === 'slug') return formatSlug(val);
        if (maskType === 'coupon') return String(val).toUpperCase();
        return val;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        if (maskType === 'currency') {
            const formatted = formatCurrency2(input);
            setValueLocal(formatted.masked);
            return updateState(formatted.value);
        }

        if (maskType === 'percentage') {
            const formatted = formatPercentage(input);
            setValueLocal(formatted.masked);
            return updateState(formatted.value);
        }

        if (maskType === 'integer') {
            const formatted = formatInteger(input, min, max);
            setValueLocal(formatted.masked);
            return updateState(formatted.value);
        }

        if (maskType === 'cpf') {
            const digits = input.replace(/\D/g, '').slice(0, 11);
            setValueLocal(digits);
            return updateState(digits);
        }

        if (maskType === 'cep') {
            const digits = input.replace(/\D/g, '').slice(0, 8);
            setValueLocal(digits);
            return updateState(digits);
        }

        if (maskType === 'creditcard') {
            const digits = input.replace(/\D/g, '').slice(0, 16);
            setValueLocal(digits);
            return updateState(digits);
        }

        if (maskType === 'slug') {
            const sanitized = formatSlug(input);
            setValueLocal(sanitized);
            return updateState(sanitized);
        }

        if (maskType === 'expiry') {
            const formatted = formatExpiry(input);
            setValueLocal(formatted);
            return updateState(formatted);
        }

        if (maskType === 'coupon') {
            const sanitized = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
            setValueLocal(sanitized);
            return updateState(sanitized);
        }

        setValueLocal(input);
        updateState(input);
    };

    const updateState = (val: any) => {
        if (modifyStateExternal) {
            modifyStateExternal(id, val);
        } else if (setState) {
            setState(prev => ({...prev, [id]: val}));
        }
    };

    return (
        <div className={styles.cFloat}>

            <div className={prefix || suffix ? styles.cFloat__prefix : ''}>
                {prefix && (
                    <span
                        className={`${styles.suffix} border-b
                        ${error ? '!border-red' : isEditing ? '!border-blue' : 'border-neutral/20'}`}>
                    {prefix}
                  </span>
                )}

                <div className="relative">
                    <input
                        id={id}
                        type={type}
                        ref={internalRef}
                        onFocus={() => setIsEditing(true)}
                        onBlur={(e) => {
                            setIsEditing(false);
                            onBlur?.(e);
                        }}
                        min={min}
                        max={max}
                        autoComplete={autoComplete}
                        minLength={minLength}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        className={`${styles.cFloat__input} ${error ? '!border-red !bg-red/10' : 'border-white/10'} ${className}`}
                        readOnly={readOnly}
                        disabled={disabled}
                        value={getMaskedValue(valueLocal)}
                        onChange={handleChange}
                    />

                    <label className={styles.cFloat__label}>
                        {label}
                        {required && <span className="text-red">*</span>}
                    </label>
                </div>

                {suffix && (
                    <span
                        className={`${styles.suffix} border-b
                        ${error ? '!border-red' : isEditing ? '!border-blue' : 'border-neutral/20'}`}>
                    {suffix}
                  </span>
                )}

            </div>

            {error && (
                <AlertMessage message={errorExternal} type="error"/>
            )}
        </div>
    );
});

export const InputText = React.memo(InputLabel);
