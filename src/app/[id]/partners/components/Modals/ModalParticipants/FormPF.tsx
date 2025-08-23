// FormPF.tsx
'use client';

import * as React from 'react';
import * as Yup from 'yup';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/FormsElements/Input';
import { SelectLabel } from '@/components/FormsElements/SelectLabel';
import { occupationOptions } from '@/lib/occupationOptions';
import { CheckboxLabel } from '@/components/FormsElements/CheckboxLabel';
import { Address } from '@/components/Address';
import { IdentificationIcon, UserIcon } from '@heroicons/react/24/outline';
import api from '@/lib/axios';
import { authApi } from '@/lib/urlApi';
import { MemberNode } from '@/types/Members';

// ---------- Utils
const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
const isAllSameDigits = (s: string) => /^(\d)\1+$/.test(s);

// Validação de CPF (checksum)
function isValidCPF(input: string) {
    const cpf = onlyDigits(input);
    if (cpf.length !== 11) return false;
    if (isAllSameDigits(cpf)) return false;

    const calcDV = (base: string, factorStart: number) => {
        let sum = 0;
        for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (factorStart - i);
        const mod = sum % 11;
        return mod < 2 ? 0 : 11 - mod;
    };

    const dv1 = calcDV(cpf.slice(0, 9), 10);
    const dv2 = calcDV(cpf.slice(0, 9) + dv1, 11);
    return cpf === cpf.slice(0, 9) + String(dv1) + String(dv2);
}

// Transforma "12,34" → 12.34 (number)
const percentageTransform = (_value: any, originalValue: any) => {
    if (typeof originalValue === 'string') {
        const n = Number(originalValue.replace(/\./g, '').replace(',', '.'));
        return Number.isNaN(n) ? undefined : n;
    }
    return originalValue;
};

const occupationValues =
    Array.isArray(occupationOptions) ? occupationOptions.map((o: any) => o?.value).filter(Boolean) : [];

// ---------- Yup Schema
const schema = Yup.object({
    id: Yup.string().optional(), // se vier, fazemos PUT
    document: Yup.string().required('Informe o CPF').test('cpf-valido', 'CPF inválido', (v) => !!v && isValidCPF(v)),
    occupation: occupationValues.length
        ? Yup.mixed().oneOf(occupationValues as any, 'Selecione uma qualificação').required('Selecione uma qualificação')
        : Yup.string().required('Selecione uma qualificação'),
    name: Yup.string().trim().min(3, 'Digite o nome completo').required('Nome é obrigatório'),
    percentage: Yup.number()
        .transform(percentageTransform)
        .typeError('Percentual inválido').required(),
    representative: Yup.boolean(),
    addresses: Yup.array().of(Yup.mixed()).min(1, 'Adicione pelo menos um endereço'),
    email: Yup.string().email('E-mail inválido').nullable().optional(),
    phone: Yup.string().nullable().optional(),
    corporate_name: Yup.string().nullable().optional(),
    frente_doc: Yup.string().nullable().optional(),
    cnpj: Yup.string().nullable().optional(),
});

type FormPFProps = {
    clientId: string;
    initialValues?: any;         // pode conter id
    readOnlyType?: boolean;
    onSaved?: (saved: MemberNode) => void; // pai atualiza/fecha se quiser
    level?: number;
    parentBusinessId?: string;
};

export default function FormPF({ clientId, initialValues, readOnlyType: _readOnlyType, onSaved, level, parentBusinessId }: FormPFProps) {

    const [payload, setPayload] = React.useState({
        id: initialValues?.id ?? '',
        document: initialValues?.document ?? '',
        occupation: initialValues?.occupation ?? '',
        name: initialValues?.name ?? '',
        percentage: initialValues?.percentage ?? '',
        representative: initialValues?.representative ?? false,
        addresses: initialValues?.addresses ?? [],
        email: initialValues?.email ?? '',
        phone: initialValues?.phone ?? '',
    });
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(false);

    const resolvedLevel = level ?? 1;
    const resolvedParent = parentBusinessId ?? null;

    const buildMemberNode = (values: any): MemberNode => ({
        id: values.id || '',
        level: resolvedLevel,
        member_type: 'PERSON',
        associate: false,
        details: { id: '', name: values.name, document: values.document },
        participation_percentage: values.percentage,
        parent_business_id: resolvedParent,
        required_documents: [],
        submitted_documents: [],
        type: values.representative ? 'LEGAL_REPRESENTATIVE' : null,
        members: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const values = await schema.validate(payload, { abortEarly: false, stripUnknown: false });
            const isEdit = Boolean(values.id);

            // ----- MONTE O PAYLOAD PRO BACKEND -----
            // Opção A) você já usava um "update por cliente" (upsert):
            const upsertPayload = {
                member: {
                    id: values.id || undefined,
                    member_type: 'PERSON',
                    details: { name: values.name, document: values.document },
                    participation_percentage: values.percentage,
                    type: values.representative ? 'LEGAL_REPRESENTATIVE' : null,
                    level: resolvedLevel,
                    parent_business_id: resolvedParent,
                    // inclua addresses se o backend espera aqui:
                    addresses: values.addresses,
                    occupation: values.occupation,
                    email: values.email || undefined,
                    phone: values.phone || undefined,
                },
            };

            // Opção B) endpoints dedicados (descomente se sua API for assim):
            // const createUrl = `${authApi}/onboarding_api/v1/members`;
            // const updateUrl = `${authApi}/onboarding_api/v1/members/${values.id}`;

            // ----- CHAME O ENDPOINT -----
            // A) Upsert no mesmo endpoint por clientId:

            if (isEdit) {
                await api.put(`${authApi}/v1/client/${clientId}/members/${initialValues?.id}`, upsertPayload);
            } else {
                console.log('aqui ')
             //   await api.post(`${authApi}/v1/client/members/${clientId}`, upsertPayload);
            }
            // notifica o pai com um MemberNode (útil para atualizar a lista)
            onSaved?.(buildMemberNode(values));
            setLoading(false);
        } catch (err: any) {
            setLoading(false);
            const next: Record<string, string> = {};
            if (err?.name === 'ValidationError') {
                if (err?.inner?.length) {
                    err.inner.forEach((i: any) => {
                        if (i.path && !next[i.path]) next[i.path] = i.message;
                    });
                } else if (err?.path) {
                    next[err.path] = err.message;
                }
            } else {
                next['__global'] = err?.response?.data?.message || err?.message || 'Erro ao salvar. Tente novamente.';
            }
            setErrors(next);

            const first = Object.keys(next).find((k) => k !== '__global');
            if (first) {
                setTimeout(() => {
                    const el = document.getElementById(first);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        (el as any).focus?.();
                    }
                }, 50);
            }
        }
    };

    return (
        <form className="py-6" onSubmit={handleSubmit} noValidate>
            <h2 className="text-neutral mb-3">Informações Gerais</h2>

            <div className="grid md:grid-cols-2 gap-4">
                <Input
                    id="document"
                    label="CPF"
                    value={payload.document}
                    setState={(updater: any) =>
                        setPayload((prev: any) => (typeof updater === 'function' ? updater(prev) : { ...prev, document: updater }))
                    }
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
                    setState={(updater: any) =>
                        setPayload((prev: any) =>
                            typeof updater === 'function' ? updater(prev) : { ...prev, occupation: updater }
                        )
                    }
                    errorExternal={errors.occupation}
                />
            </div>

            <Input
                id="name"
                label="Nome Completo"
                value={payload.name}
                setState={(updater: any) =>
                    setPayload((prev: any) => (typeof updater === 'function' ? updater(prev) : { ...prev, name: updater }))
                }
                placeholder="Digite o nome completo"
                floating={false}
                suffix={<UserIcon className="w-5 h-5 stroke-gray" />}
                errorExternal={errors.name}
            />

            <Input
                id="percentage"
                label="Percentual de Participação"
                value={payload.percentage}
                maskType="percentage"
                setState={(updater: any) =>
                    setPayload((prev: any) => (typeof updater === 'function' ? updater(prev) : { ...prev, percentage: updater }))
                }
                placeholder="0,00"
                floating={false}
                suffix={<span className="font-lg stroke-gray">%</span>}
                errorExternal={errors.percentage}
            />

            <CheckboxLabel
                id="representative"
                label="Representante Legal"
                value={payload.representative}
                setState={(fnOrVal: any) =>
                    setPayload((prev: any) => (typeof fnOrVal === 'function' ? fnOrVal(prev) : { ...prev, representative: fnOrVal }))
                }
            />

            <h2 className="text-neutral mb-3 mt-6">Endereço</h2>
            <Address
                addresses={payload.addresses}
                onChange={(next: any) => setPayload((prev: any) => ({ ...prev, addresses: next }))}
            />

            {errors.__global ? <p className="text-red-600 text-sm mt-3">{errors.__global}</p> : null}

            <div className="mt-6">
                <Button type="submit" color="primary" fullWidth disabled={loading} loading={loading}>
                    {loading ? 'Salvando...' : (payload.id ? 'Atualizar Sócio' : 'Salvar Sócio')}
                </Button>
            </div>
        </form>
    );
}
