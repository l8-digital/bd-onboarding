// components/Address/AddressModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as yup from 'yup';
import { Input } from '@/components/FormsElements/Input';
import { SelectLabel } from '@/components/FormsElements/SelectLabel';
import { Button } from '@/components/Button/Button';
import brasil from '@/utils/brasil.json';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type Address = {
    zipcode: string;
    state: string;
    city_name?: string;
    line: string;
    building_number: string;
    neighborhood: string;
};

type AddressForm = Address;

const addressSchema = yup.object({
    zipcode: yup.string().required('CEP obrigatório'),
    state: yup.string().required('Estado obrigatório'),
    city_name: yup.string().required('Cidade obrigatória'),
    line: yup.string().required('Logradouro obrigatório'),
    building_number: yup.string().required('Número obrigatório'),
    neighborhood: yup.string().required('Bairro obrigatório'),
});

interface AddressModalProps {
    open: boolean;
    index: number;
    address: Partial<Address> | null;                 // vem por props
    onClose: () => void;
    onSave: (index: number, address: Address) => void; // devolve para o pai
}

export const AddressModal: React.FC<AddressModalProps> = ({
                                                              open,
                                                              index,
                                                              address,
                                                              onClose,
                                                              onSave,
                                                          }) => {
    // 1) payload preenchido diretamente pelas props (sem useEffect)
    const [payload, setPayload] = useState<AddressForm>({
        zipcode: address?.zipcode ?? '',
        state: address?.state ?? '',
        city_name: address?.city_name ?? '',
        line: address?.line ?? '',
        building_number: address?.building_number ?? '',
        neighborhood: address?.neighborhood ?? '',
    });

    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const [loadingCep, setLoadingCep] = useState(false);
    const refs = useRef<Record<string, HTMLInputElement | null>>({});

    // 2) começa bloqueando a busca de CEP; só libera quando o usuário digitar
    const skipCepLookupRef = useRef(true);

    // 3) wrapper pra detectar digitação no CEP e liberar a busca
    const setPayloadSafe = (updater: React.SetStateAction<AddressForm>) => {
        setPayload((prev) => {
            const next = typeof updater === 'function' ? (updater as (p: AddressForm) => AddressForm)(prev) : updater;
            // se o usuário alterou o CEP, libera a busca
            const prevDigits = (prev.zipcode || '').replace(/\D/g, '');
            const nextDigits = (next.zipcode || '').replace(/\D/g, '');
            if (prevDigits !== nextDigits) {
                skipCepLookupRef.current = false;
            }
            return next;
        });
    };

    // 4) força remount quando o address mudar (reaplica o estado inicial sem useEffect)
    const modalKey = `${index}-${address?.zipcode ?? ''}-${address?.state ?? ''}-${address?.city_name ?? ''}-${address?.line ?? ''}-${address?.building_number ?? ''}-${address?.neighborhood ?? ''}`;

    // 5) Busca CEP (ViaCEP) — só quando DIGITAR (não ao abrir)
    useEffect(() => {
        if (skipCepLookupRef.current) return;

        const cepLimpo = (payload.zipcode || '').replace(/\D/g, '');
        setLocalErrors((prev) => ({ ...prev, zipcode: '' }));

        if (cepLimpo.length !== 8) {
            setLoadingCep(false);
            return;
        }

        const debounce = setTimeout(() => {
            setLoadingCep(true);

            fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.erro) throw new Error('CEP não encontrado');

                    setPayload((prev) => ({
                        ...prev,
                        line: data.logradouro || '',
                        neighborhood: data.bairro || '',
                        state: data.uf || '',
                        city_name: data.localidade || '',
                    }));

                    setLoadingCep(false);

                    setTimeout(() => {
                        if (!data.logradouro) refs.current['line']?.focus();
                        else refs.current['building_number']?.focus();
                    }, 100);
                })
                .catch(() => {
                    setLoadingCep(false);
                    setLocalErrors((prev) => ({ ...prev, zipcode: 'CEP não encontrado' }));
                    setPayload((prev) => ({
                        ...prev,
                        line: '',
                        neighborhood: '',
                        state: '',
                        city_name: '',
                    }));
                });
        }, 500);

        return () => clearTimeout(debounce);
    }, [payload.zipcode]);

    const statesOptions = (brasil as any[]).map((b: any) => ({ label: b.sigla, value: b.sigla }));

    const citiesOptions = (state: string) => {
        const found = (brasil as any[]).find((b: any) => b.sigla === state);
        return found ? found.cidades.map((c: string) => ({ label: c, value: c })) : [];
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            {/* key força remount quando address mudar */}
            <div key={modalKey} className="bg-white rounded-xl w-full max-w-lg">
                <div className="px-6 pt-3 pb-3 flex items-center justify-between border-b border-black/20">
                    <h2 className="text-xl font-bold">Endereço</h2>
                    <button type="button" onClick={onClose} className="pl-3 py-2">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    (async () => {
                        try {
                            const values = (await addressSchema.validate(payload, { abortEarly: false })) as AddressForm;
                            const addressObj: Address = {
                                zipcode: (values.zipcode || '').replace(/\D/g, ''),
                                state: values.state,
                                city_name: values.city_name,
                                line: values.line,
                                building_number: values.building_number,
                                neighborhood: values.neighborhood,
                            };
                            onSave(index, addressObj);
                            onClose();
                        } catch (err: any) {
                            const errs: Record<string, string> = {};
                            if (err?.inner) {
                                err.inner.forEach((i: any) => {
                                    if (i.path && !errs[i.path]) errs[i.path] = i.message;
                                });
                            } else if (err?.path) errs[err.path] = err.message;
                            setLocalErrors(errs);
                            const first = Object.keys(errs)[0];
                            if (first) refs.current[first as keyof AddressForm]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
                        }
                    })();
                }} className="grid p-6">

                    <Input
                        id="zipcode"
                        label="CEP"
                        maskType="cep"
                        type="tel"
                        autoComplete="postal-code"
                        setState={setPayloadSafe}
                        value={payload.zipcode}
                        ref={(el: any) => (refs.current['zipcode'] = el)}
                        suffix={<ArrowPathIcon className={`w-4 h-4 transition ${loadingCep ? 'animate-spin' : 'hidden'}`} />}
                        errorExternal={localErrors.zipcode}
                    />

                    <Input
                        label="Logradouro"
                        id="line"
                        value={payload.line}
                        setState={setPayloadSafe}
                        placeholder=""
                        className="uppercase"
                        floating={false}
                        errorExternal={localErrors.line}
                        ref={(el: any) => (refs.current['line'] = el)}
                    />

                    <div className="flex gap-3">
                        <div className="w-4/12">
                            <Input
                                label="Número"
                                id="building_number"
                                value={payload.building_number}
                                setState={setPayloadSafe}
                                placeholder=""
                                className="uppercase"
                                floating={false}
                                errorExternal={localErrors.building_number}
                                ref={(el: any) => (refs.current['building_number'] = el)}
                            />
                        </div>
                        <div className="w-8/12">
                            <Input
                                label="Bairro"
                                id="neighborhood"
                                value={payload.neighborhood}
                                setState={setPayloadSafe}
                                placeholder=""
                                className="uppercase"
                                floating={false}
                                errorExternal={localErrors.neighborhood}
                                ref={(el: any) => (refs.current['neighborhood'] = el)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-8/12">
                            <SelectLabel
                                id="city_name"
                                label="Cidade"
                                options={citiesOptions(payload.state)}
                                value={payload.city_name}
                                setState={setPayloadSafe}
                                className="uppercase"
                                floating={false}
                                errorExternal={localErrors.city_name}
                                ref={(el: any) => (refs.current['city_name'] = el)}
                            />
                        </div>
                        <div className="w-4/12">
                            <SelectLabel
                                id="state"
                                label="Estado"
                                options={statesOptions}
                                value={payload.state}
                                setState={setPayloadSafe}
                                className="uppercase"
                                floating={false}
                                errorExternal={localErrors.state}
                                ref={(el: any) => (refs.current['state'] = el)}
                            />
                        </div>
                    </div>

                    <div className="mt-5">
                        <Button type="submit" color="primary" fullWidth>
                            Salvar endereço
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
