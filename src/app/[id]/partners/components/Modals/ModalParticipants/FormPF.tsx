'use client';

import * as React from 'react';
import {Button} from '@/components/Button/Button';
import {Input} from "@/components/FormsElements/Input";
import {SelectLabel} from "@/components/FormsElements/SelectLabel";
import { occupationOptions } from '@/lib/occupationOptions';
import {
    BuildingOfficeIcon,
    IdentificationIcon,
    MapPinIcon,
    PercentBadgeIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import {CheckboxLabel} from "@/components/FormsElements/CheckboxLabel";
import {useState} from "react";
import {Address} from "@/components/Address";
import {UploadFile} from "@/components/FormsElements/UploadFile";

// import { schemaPJ } from '../schemas/pj';
// import { savePJ } from '@/app/_actions/participants/pj';


export default function FormPF({onSuccess}: { onSuccess: () => void }) {

    const [payload, setPayload] = React.useState({
        corporate_name: '',
        document: '',
        occupation: '',
        name: '',
        percentage: '',
        representative: false,
        addresses: [],
        frente_doc: '',
        cnpj: '',
        email: '',
        phone: ''
    });
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [pending, startTransition] = React.useTransition();
    const [modalOpen, setModalOpen] = useState(false);




    return (
        <div className="py-6">

            <h2 className="text-neutral mb-3">Informações Gerais</h2>

            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    id="document"
                    label="CPF"
                    value={payload.document}
                    setState={setPayload}
                    maskType="cpf"
                    placeholder="000.000.000-00"
                    floating={false}
                    suffix={<IdentificationIcon className="w-5 h-5 stroke-gray" />}
                    errorExternal={errors.document}
                />

                <SelectLabel
                    id="occupation"
                    label="Qualificação"
                    options={occupationOptions}
                    placeholder="Selecione"
                    value={payload.occupation}
                    setState={setPayload}
                    errorExternal={errors?.occupation}
                />
            </div>

            <Input
                id="name"
                label="Nome Completo"
                value={payload.name}
                setState={setPayload}
                placeholder="Digite o nome completo"
                floating={false}
                suffix={<UserIcon className="w-5 h-5 stroke-gray" />}
                errorExternal={errors.name}
            />

            <Input
                id="percentage"
                label="Percentual de Participação"
                value={payload.percentage}
                maskType={"percentage"}
                setState={setPayload}
                placeholder="0,00"
                floating={false}
                suffix={<span className="font-lg stroke-gray">%</span>}
                errorExternal={errors.percentage}
            />

            <CheckboxLabel
                id="representative"
                label="Representante Legal"
                value={payload.representative}
                setState={setPayload}
            />


            <h2 className="text-neutral mb-3 mt-6">Endereço</h2>

            <Address
                addresses={payload.addresses}
                onChange={(next: any) => setPayload(prev => ({ ...prev, addresses: next }))}
            />
            {/*<div className="w-full mt-3">
                <h2 className="text-xs text-neutral/70 mb-1 pl-9">Endereço</h2>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <MapPinIcon className="h-5 w-5 text-blue" />
                        <div className="flex-1 leading-tight">
                            <div className="text-sm text-neutral">
                                {a0 && a0.zipcode
                                    ? `${a0.line}, ${a0.building_number} - ${a0.neighborhood} - ${a0.city_name} - ${a0.state} - CEP ${a0.zipcode}`
                                    : '—'}
                            </div>
                        </div>
                    </div>

                    <div >
                        <Button type="button" color="gray" onClick={() => setModalOpen(true)}>
                            {a0 ? 'Editar' : 'Preencher'}


                            {a0 && (
                                <span
                                    aria-hidden
                                    className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-blue ring-2 ring-white"
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </div>*/}

            <h2 className="text-neutral mb-3 mt-4">Documentos</h2>

            <SelectLabel
                id="occupation"
                label="Tipo do documento"
                options={occupationOptions}
                placeholder="Selecione"
                value={payload.occupation}
                setState={setPayload}
                errorExternal={errors?.occupation}
            />

            {/*<UploadFile
                id="frente_doc"
                label="Frente do documento"
                hint="JPG ou PNG"
                accept="image/*"
                value={payload.frente_doc ?? null}
                setState={setPayload}                // armazena em payload.frente_doc
                maxSizeMB={10}
            />*/}

            <div className="mt-6">
                <Button type="submit" color="primary" fullWidth
                        disabled={pending} loading={pending}>
                    Adicionar Sócio
                </Button>
            </div>
        </div>
    );
}