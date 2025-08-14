// src/components/FormsElements/InputPhone.tsx
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import {useEffect, useState} from 'react'
import styles from './../style.module.scss'

interface InputPhoneProps {
    label?: string
    value?: string
    onChange: (value: string) => void
    error?: string
    onEnter?: () => void
    defaultCountry?: any
    onCountryChange?: (country: string) => void
}

export function InputPhone({
                               label = 'Telefone',
                               value = '',
                               onChange,
                               onCountryChange,
                               onEnter,
                               defaultCountry,
                               error
                           }: InputPhoneProps) {
    const [phone, setPhone] = useState(value)
    const [country, setCountry] = useState<any>(defaultCountry || 'BR') // <- controle interno


    const sanitizePhone = (raw: string): string => {
        const digits = raw.replace(/\D/g, '').slice(0, 13)
        return raw.startsWith('+') ? `+${digits}` : digits
    }

    const handlePhoneChange = (newValue: string | undefined) => {
        if (newValue === undefined) {
            setPhone('')
            onChange('')
            return
        }

        const sanitized = sanitizePhone(newValue)

        setPhone(sanitized)
        onChange(sanitized)
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text')
        const sanitized = sanitizePhone(pasted)
        setPhone(sanitized)
        onChange(sanitized)
        e.preventDefault()
    }

    useEffect(() => {
        if (onCountryChange) {
            onCountryChange(country); // dispara o país default logo ao montar
        }
    }, []); // dispara apenas uma vez ao montar

    const handleCountryChange = (newCountry?: string) => {
        if (newCountry) {
            setCountry(newCountry)
            if (onCountryChange) {
                onCountryChange(newCountry)
            }
        }
    }
    return (
        <div className="flex flex-col items-start mb-4">
            <label className={styles.cFloat__label}>{label}</label>

            <PhoneInput
                placeholder="Digite seu número"
                defaultCountry={defaultCountry}
                value={phone}
                onChange={handlePhoneChange}
                onPaste={handlePaste}
                onCountryChange={handleCountryChange} // <- agora com tipo válido
                onKeyDown={(e: any) => {
                    if (e.key === 'Enter' && onEnter) {
                        onEnter()
                    }
                }}
                maxLength={15}
                className={`w-full border-b ${
                    error ? 'border-red' : 'border-neutral/30'
                } bg-transparent text-neutral px-2 py-2 !focus:outline-none`}
            />

            {error && (
                <span className="text-xs px-2 py-0.5 rounded-md text-white bg-red mt-0.5">
          {error}
        </span>
            )}
        </div>
    )
}
