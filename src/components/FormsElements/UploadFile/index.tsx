'use client';

import React, {
    useEffect,
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from 'react';
import styles from './../style.module.scss';
import { AlertMessage } from '../../AlertMessage';
import {
    PaperClipIcon,
    PhotoIcon,
    DocumentTextIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

export interface UploadFileHandle {
    open: () => void;
    clear: () => void;
    getFile: () => File | null;
}

interface UploadFileProps {
    id: string;
    label: string;
    hint?: string;                          // ex.: "JPG ou PNG" / "Arquivo PDF"
    accept?: string;                        // ex.: "image/*" | "application/pdf"
    value?: File | null;                    // controlado (opcional)
    setState?: (updater: any) => void;      // mesmo padrão dos seus inputs
    modifyStateExternal?: (id: string, file: File | null) => void;
    required?: boolean;
    disabled?: boolean;
    errorExternal?: string;
    className?: string;
    maxSizeMB?: number;                     // validação simples (opcional)
    showPreview?: boolean;                  // default: true
}

export const UploadFile = forwardRef<UploadFileHandle, UploadFileProps>(
    (
        {
            id,
            label,
            hint,
            accept = 'image/*,application/pdf',
            value = null,
            setState,
            modifyStateExternal,
            required = false,
            disabled = false,
            errorExternal,
            className = '',
            maxSizeMB,
            showPreview = true,
        },
        ref
    ) => {
        const inputRef = useRef<HTMLInputElement | null>(null);
        const [file, setFile] = useState<File | null>(value);
        const [preview, setPreview] = useState<string | null>(null);
        const [error, setError] = useState<string | undefined>(errorExternal);

        useImperativeHandle(ref, () => ({
            open: () => inputRef.current?.click(),
            clear: () => handleClear(),
            getFile: () => file,
        }));

        // sync externo -> interno
        useEffect(() => {
            setFile(value ?? null);
        }, [value]);

        // sync erro externo
        useEffect(() => {
            setError(errorExternal);
        }, [errorExternal]);

        // preview para imagens
        useEffect(() => {
            if (file && showPreview && file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreview(url);
                return () => URL.revokeObjectURL(url);
            }
            setPreview(null);
        }, [file, showPreview]);

        function pushToParent(next: File | null) {
            if (modifyStateExternal) {
                modifyStateExternal(id, next);
            } else if (setState) {
                // mantém seu padrão: merge por id em objetos
                setState((prev: any) => ({ ...prev, [id]: next }));
            }
        }

        function handlePickClick() {
            if (disabled) return;
            inputRef.current?.click();
        }

        function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            const f = e.target.files?.[0] ?? null;
            if (!f) return;

            // validação simples: tamanho
            if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
                setError(`Arquivo maior que ${maxSizeMB}MB.`);
                return;
            }

            setError(undefined);
            setFile(f);
            pushToParent(f);
        }

        function handleClear() {
            setFile(null);
            setError(undefined);
            if (inputRef.current) inputRef.current.value = '';
            pushToParent(null);
        }

        const isImage = file?.type?.startsWith('image/');
        const isPdf = file?.type === 'application/pdf';

        return (
            <div className={`${styles.cFloat} ${className}`}>
                <div className="flex items-center justify-between gap-3">
                    {/* label + hint */}
                    <div className="min-w-0">
                        <label className={`${styles.cFloat__label} block`} htmlFor={id}>
                            {label}
                            {required && <span className="text-red ml-1">*</span>}
                        </label>
                        {hint && (
                            <p className="text-xs text-neutral/60 truncate">{hint}</p>
                        )}
                    </div>

                    {/* ação / preview */}
                    <div className="flex items-center gap-2">
                        {/* estado com arquivo */}
                        {file ? (
                            <>
                                {showPreview ? (
                                    isImage ? (
                                        <img
                                            src={preview ?? ''}
                                            alt={file.name}
                                            className="h-8 w-8 rounded object-cover ring-1 ring-black/5"
                                        />
                                    ) : isPdf ? (
                                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center ring-1 ring-black/5">
                                            <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center ring-1 ring-black/5">
                                            <PaperClipIcon className="w-5 h-5 text-slate-600" />
                                        </div>
                                    )
                                ) : null}

                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={disabled}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 ring-1 ring-black/5 disabled:opacity-50"
                                    aria-label="Remover arquivo"
                                    title="Remover arquivo"
                                >
                                    <TrashIcon className="w-4 h-4 text-slate-700" />
                                </button>
                            </>
                        ) : (
                            // estado inicial (sem arquivo)
                            <button
                                type="button"
                                onClick={handlePickClick}
                                disabled={disabled}
                                className="inline-flex items-center rounded-full bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm text-slate-800 ring-1 ring-black/5 disabled:opacity-50"
                            >
                                Anexar
                            </button>
                        )}
                    </div>
                </div>

                {/* input invisível */}
                <input
                    id={id}
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleChange}
                    disabled={disabled}
                />

                {/* erro */}
                {error && <AlertMessage message={error} type="error" />}
            </div>
        );
    }
);

UploadFile.displayName = 'UploadFile';