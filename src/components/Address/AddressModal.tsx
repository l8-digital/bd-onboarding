// components/Address/AddressModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as yup from 'yup';
import { Input } from '@/components/FormsElements/Input';
import { SelectLabel } from '@/components/FormsElements/SelectLabel';
import { Button } from '@/components/Button/Button';
import brasil from '@/utils/brasil.json';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

// helpers de normalização
const digits = (v?: string | null) => (v ?? '').replace(/\D/g, '');
const upper  = (v?: string | null) => (v ?? '').toString().trim().toUpperCase();

// schema com transforms para já devolver os dados prontos
const addressSchema = yup
    .object({
        zipcode: yup
            .string()
            .transform(digits)
            .required('CEP obrigatório')
            .length(8, 'CEP inválido'),

        state_uf: yup
            .string()
            .transform(upper)
            .required('Estado obrigatório')
            .length(2, 'UF deve ter 2 letras'),

        city_name: yup
            .string()
            .transform(upper)
            .required('Cidade obrigatória'),

        line: yup
            .string()
            .transform(upper)
            .required('Logradouro obrigatório'),

        building_number: yup
            .string()
            .transform(v => (v == null ? '' : String(v).trim()))
            .required('Número obrigatório'),

        neighborhood: yup
            .string()
            .transform(upper)
            .required('Bairro obrigatório'),
    })
    .noUnknown(true);

export type Address = yup.InferType<typeof addressSchema>; // { zipcode, state_uf, city_name, line, building_number, neighborhood }

type AddressPayload = Address;
type AddressKeys = keyof AddressPayload;

interface AddressModalProps {
    open: boolean;
    index: number;
    address: Address | null;
    onClose: () => void;
    onChange: (index: number, address: Address) => void; // <- callback final
}

export const AddressModal: React.FC<AddressModalProps> = ({
                                                              open,
                                                              index,
                                                              address,
                                                              onClose,
                                                              onChange,
                                                          }) => {
    const [payload, setPayload] = useState<AddressPayload>({
        zipcode: address?.zipcode ?? '',
        state_uf: address?.state_uf ?? '',
        city_name: address?.city_name ?? '',
        line: address?.line ?? '',
        building_number: address?.building_number ?? '',
        neighborhood: address?.neighborhood ?? '',
    });

    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const [loadingCep, setLoadingCep] = useState(false);

    // SelectLabel não é input; use HTMLElement | null
    const refs = useRef<Record<AddressKeys, HTMLElement | null>>({
        zipcode: null,
        state_uf: null,
        city_name: null,
        line: null,
        building_number: null,
        neighborhood: null,
    });

    const skipCepLookupRef = useRef(true);

    const setPayloadSafe = (updater: React.SetStateAction<AddressPayload>) => {
        setPayload(prev => {
            const next = typeof updater === 'function'
                ? (updater as (p: AddressPayload) => AddressPayload)(prev)
                : updater;

            const prevDigits = digits(prev.zipcode);
            const nextDigits = digits(next.zipcode);
            if (prevDigits !== nextDigits) {
                skipCepLookupRef.current = false; // habilita busca por CEP
            }
            return next;
        });
    };

    const modalKey = `${index}-${address?.zipcode ?? ''}-${address?.state_uf ?? ''}-${address?.city_name ?? ''}-${address?.line ?? ''}-${address?.building_number ?? ''}-${address?.neighborhood ?? ''}`;

    // auto-preenchimento via ViaCEP quando o CEP completa 8 dígitos
    useEffect(() => {
        if (skipCepLookupRef.current) return;

        const cepLimpo = digits(payload.zipcode);
        setLocalErrors(prev => ({ ...prev, zipcode: '' }));

        if (cepLimpo.length !== 8) {
            setLoadingCep(false);
            return;
        }

        const debounce = setTimeout(() => {
            setLoadingCep(true);

            fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
                .then(res => res.json())
                .then(data => {
                    if (data.erro) throw new Error('CEP não encontrado');

                    setPayload(prev => ({
                        ...prev,
                        line: (data.logradouro || '').toString().toUpperCase(),
                        neighborhood: (data.bairro || '').toString().toUpperCase(),
                        state_uf: (data.uf || '').toString().toUpperCase(),
                        city_name: (data.localidade || '').toString().toUpperCase(),
                    }));

                    setLoadingCep(false);

                    setTimeout(() => {
                        if (!data.logradouro) (refs.current.line as any)?.focus?.();
                        else (refs.current.building_number as any)?.focus?.();
                    }, 100);
                })
                .catch(() => {
                    setLoadingCep(false);
                    setLocalErrors(prev => ({ ...prev, zipcode: 'CEP não encontrado' }));
                    setPayload(prev => ({
                        ...prev,
                        line: '',
                        neighborhood: '',
                        state_uf: '',
                        city_name: '',
                    }));
                });
        }, 500);

        return () => clearTimeout(debounce);
    }, [payload.zipcode]);

    const handleSave = async () => {
        try {
            const address = await addressSchema.validate(payload, {
                abortEarly: false,
            });

            onChange(index, address); // <- devolve pronto
            onClose();
        } catch (err: any) {
            const errs: Record<string, string> = {};
            if (err?.inner) {
                err.inner.forEach((i: any) => {
                    if (i.path && !errs[i.path]) errs[i.path] = i.message;
                });
            } else if (err?.path) {
                errs[err.path] = err.message;
            }

            setLocalErrors(errs);

            const first = Object.keys(errs)[0] as AddressKeys | undefined;
            if (first) {
                (refs.current[first] as any)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const statesOptions = (brasil as any[]).map((b: any) => ({ label: b.sigla, value: b.sigla }));

    const citiesOptions = (uf: string) => {
        const found = (brasil as any[]).find((b: any) => b.sigla === uf);
        return found ? found.cidades.map((c: string) => ({ label: c, value: c })) : [];
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div key={modalKey} className="bg-white rounded-xl w-full max-w-lg">
                <div className="px-6 pt-3 pb-3 flex items-center justify-between border-b border-black/20">
                    <h2 className="text-xl font-bold">Endereço</h2>
                    <button type="button" onClick={onClose} className="pl-3 py-2">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid p-6">
                    <Input
                        id="zipcode"
                        label="CEP"
                        maskType="cep"
                        type="tel"
                        autoComplete="postal-code"
                        setState={setPayloadSafe}
                        value={payload.zipcode}
                        ref={(el: any) => (refs.current.zipcode = el)}
                        suffix={<ArrowPathIcon className={`w-4 h-4 transition ${loadingCep ? 'animate-spin' : 'hidden'}`} />}
                        errorExternal={localErrors.zipcode}
                    />

                    <Input
                        label="Logradouro"
                        id="line"
                        value={payload.line}
                        setState={setPayloadSafe}
                        placeholder="Digite o logradouro"
                        className="uppercase"
                        floating={false}
                        errorExternal={localErrors.line}
                        ref={(el: any) => (refs.current.line = el)}
                    />

                    <div className="flex gap-3">
                        <div className="w-4/12">
                            <Input
                                label="Número"
                                id="building_number"
                                value={payload.building_number}
                                setState={setPayloadSafe}
                                placeholder="Número"
                                className="uppercase"
                                floating={false}
                                errorExternal={localErrors.building_number}
                                ref={(el: any) => (refs.current.building_number = el)}
                            />
                        </div>
                        <div className="w-8/12">
                            <Input
                                label="Bairro"
                                id="neighborhood"
                                value={payload.neighborhood}
                                setState={setPayloadSafe}
                                placeholder="Digite o bairro"
                                className="uppercase"
                                floating={false}
                                errorExternal={localErrors.neighborhood}
                                ref={(el: any) => (refs.current.neighborhood = el)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-4/12">
                            <SelectLabel
                                id="state_uf"
                                label="Estado"
                                options={statesOptions}
                                value={payload.state_uf}
                                setState={setPayloadSafe}
                                className="uppercase"
                                floating={false}
                                errorExternal={localErrors.state_uf}
                                ref={(el: any) => (refs.current.state_uf = el)}
                            />
                        </div>
                        <div className="w-8/12">
                            <SelectLabel
                                id="city_name"
                                label="Cidade"
                                options={citiesOptions(payload.state_uf)}
                                value={payload.city_name}
                                setState={setPayloadSafe}
                                className="uppercase"
                                floating={false}
                                errorExternal={localErrors.city_name}
                                ref={(el: any) => (refs.current.city_name = el)}
                            />
                        </div>
                    </div>

                    <div className="mt-5">
                        <Button type="button" color="primary" fullWidth onClick={handleSave}>
                            Salvar endereço
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
