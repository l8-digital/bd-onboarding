'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/Button/Button';
import { AddressModal, type Address } from '@/components/Address/AddressModal';

type Props = {
    addresses?: Address[];                     // lista atual (pode vir undefined)
    onChange: (next: Address[]) => void;       // devolve lista atualizada
    index?: number;                            // posição a editar (default 0)
    className?: string;
};

function formatCep(cep?: string) {
    const d = (cep ?? '').replace(/\D/g, '');
    return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function Address({ addresses, onChange, index = 0, className }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    const a = useMemo<Address | null>(
        () => (addresses && addresses[index]) ? addresses[index] : null,
        [addresses, index]
    );

    const hasAddress = !!a?.zipcode;

    const displayText = hasAddress
        ? `${a!.line}, ${a!.building_number} - ${a!.neighborhood} - ${a!.city_name} - ${a!.state_uf} - CEP ${formatCep(a!.zipcode)}`
        : '—';

    const handleAddressChange = useCallback((i: number, addr: Address) => {
        const base = (addresses ?? []);
        const next = base.slice();
        if (i < next.length) next[i] = addr;
        else next.push(addr);
        onChange(next);              // devolve pro pai
        setModalOpen(false);
    }, [addresses, onChange]);

    return (
        <div className={`w-full mt-3 mb-8 ${className ?? ''}`}>
            <h2 className="text-xs text-neutral/70 mb-1 pl-9">Endereço</h2>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <MapPinIcon className="h-5 w-5 text-blue" />
                    <div className="flex-1 leading-tight">
                        <div className="text-sm text-neutral">{displayText}</div>
                    </div>
                </div>

                <div className="relative flex items-center">
                    <Button type="button" color="gray" onClick={() => setModalOpen(true)}>
                        {hasAddress ? 'Editar' : 'Preencher'}
                    </Button>
                    {!hasAddress && (
                        <span
                            aria-hidden
                            className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-blue ring-2 ring-white"
                        />
                    )}
                </div>
            </div>

            <AddressModal
                open={modalOpen}
                index={index}
                address={a}
                onClose={() => setModalOpen(false)}
                onChange={handleAddressChange}
            />
        </div>
    );
}
