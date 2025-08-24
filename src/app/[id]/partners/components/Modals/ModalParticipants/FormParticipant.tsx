'use client';

import * as React from 'react';
import * as Yup from 'yup';
import {Button} from '@/components/Button/Button';
import {Input} from '@/components/FormsElements/Input';
import {CheckboxLabel} from '@/components/FormsElements/CheckboxLabel';
import {SelectLabel} from '@/components/FormsElements/SelectLabel';
import {occupationOptions} from '@/lib/occupationOptions';
import {Address} from '@/components/Address';
import {
    IdentificationIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline';
import api from '@/lib/axios';
import {authApi} from '@/lib/urlApi';
import {MemberNode} from '@/types/Members';
import {AlertMessage} from "@/components/AlertMessage";
import {UploadFile, UploadFileHandle} from "@/components/FormsElements/UploadFile";
import {useRef} from "react";

// ---------- Utils
const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
const isAllSameDigits = (s: string) => /^(\d)\1+$/.test(s);

// CPF checksum
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

// Telefone BR (10 ou 11 dígitos; se 11, 3º dígito costuma ser 9)
function isValidPhoneBR(val?: string | null) {
    const d = onlyDigits(val || '');
    if (d.length === 10) return true; // fixo: AA + 8 dígitos
    if (d.length === 11 && d[2] === '9') return true; // móvel: AA + 9 dígitos iniciando em 9
    return false;
}

// "12,34" → 12.34 (number)
const percentageTransform = (_value: any, originalValue: any) => {
    if (typeof originalValue === 'string') {
        const n = Number(originalValue.replace(/\./g, '').replace(',', '.'));
        return Number.isNaN(n) ? undefined : n;
    }
    return originalValue;
};

const occupationValues =
    Array.isArray(occupationOptions)
        ? occupationOptions.map((o: any) => o?.value).filter(Boolean)
        : [];

// ---------- Schema dinâmico
function getSchema(type: 'PERSON' | 'BUSINESS', maxAllowed: number) {
    const msg = `Você só pode preencher até ${maxAllowed.toFixed(2)}% neste nível.`;

    return Yup.object({
        id: Yup.string().optional(),
        name: Yup.string().trim().min(3, 'Nome é obrigatório').required('Nome é obrigatório'),
        document: Yup.string()
            .required(type === 'PERSON' ? 'Informe o CPF' : 'Informe o CNPJ')
            .test('doc-valido', 'CPF inválido', (v) => (type === 'PERSON' ? !!v && isValidCPF(v) : true)),
        percentage: Yup.number()
            .transform(percentageTransform)
            .typeError('Percentual inválido')
            .min(0, 'Mínimo 0%')
            .max(maxAllowed, msg)
            .required('Percentual inválido'),

        // novos:
        email: Yup.string().email('E-mail inválido').required('E-mail obrigatório'),
        phone: Yup.string()
            .required('Informe um número de telefone')
            .test('br-phone', 'Número de telefone inválido', (val) => isValidPhoneBR(val)),

        representative: Yup.boolean().optional(),

        // exclusivos de PF
        occupation:
            type === 'PERSON'
                ? (occupationValues.length
                    ? Yup.mixed().oneOf(occupationValues as any, 'Selecione uma qualificação').required('Selecione uma qualificação')
                    : Yup.string().required('Selecione uma qualificação'))
                : Yup.mixed().notRequired(),

        // endereço obrigatório só para PF
        addresses:
            type === 'PERSON'
                ? Yup.array().of(Yup.mixed()).min(1, 'Adicione pelo menos um endereço')
                : Yup.array().of(Yup.mixed()).optional(),
    });
}

export type FormParticipantProps = {
    clientId: string;
    level?: number;
    parentBusinessId?: string;
    mode: 'create' | 'edit';
    readOnlyType?: boolean;
    initialValues?: {
        id?: string;
        name?: string;
        document?: string;
        percentage?: string;
        representative?: boolean;
        member_type?: 'PERSON' | 'BUSINESS';
        level?: number;
        parent_business_id?: string | null;
        occupation?: string;
        addresses?: any[];
        email?: string;
        phone?: string;
        ddi?: string; // opcional, ex.: '55'
    };
    maxAllowedPercentage: number; // NOVO
    onSaved: (saved: MemberNode) => void;
};

export default function FormParticipant({
                                            clientId,
                                            level,
                                            parentBusinessId,
                                            mode,
                                            readOnlyType,
                                            initialValues,
                                            maxAllowedPercentage,
                                            onSaved,
                                        }: FormParticipantProps) {
    const [type, setType] = React.useState<'PERSON' | 'BUSINESS'>(initialValues?.member_type ?? 'PERSON');
    const uploadRef = useRef<UploadFileHandle>(null);

    const [payload, setPayload] = React.useState({
        id: initialValues?.id ?? '',
        name: initialValues?.name ?? '',
        document: initialValues?.document ?? '',
        percentage: initialValues?.percentage ?? '',
        representative: initialValues?.representative ?? false,
        // PF
        occupation: initialValues?.occupation ?? '',
        addresses: initialValues?.addresses ?? [],
        // novos
        email: initialValues?.email ?? '',
        phone: initialValues?.phone ?? '',
        frente_doc: '',
        ddi: initialValues?.ddi ?? '55',
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [loading, setLoading] = React.useState(false);

    const resolvedLevel = level ?? initialValues?.level ?? 1;
    const resolvedParent = parentBusinessId ?? initialValues?.parent_business_id ?? null;
    const typeLocked = readOnlyType || mode === 'edit';

    const nameLabel = type === 'PERSON' ? 'Nome Completo' : 'Razão Social';
    const documentLabel = type === 'PERSON' ? 'CPF' : 'CNPJ';
    const documentMask: any = type === 'PERSON' ? 'cpf' : 'cnpj';
    const documentPlaceholder = type === 'PERSON' ? '000.000.000-00' : '00.000.000/0000-00';

    // opções mínimas de DDI (mantém desabilitado conforme seu snippet)
    const ddiOptions = React.useMemo(() => [{label: '+55', value: '55'}], []);

    const buildMemberNode = (values: any): MemberNode => ({
        id: values.id || '',
        level: resolvedLevel,
        member_type: type,
        associate: false,
        details: {id: '', name: values.name, document: values.document},
        participation_percentage: values.percentage,
        parent_business_id: resolvedParent,
        required_documents: [],
        submitted_documents: [],
        type: type === 'PERSON' && values.representative ? 'LEGAL_REPRESENTATIVE' : null,
        members: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const schema = getSchema(type, maxAllowedPercentage);
            const values = await schema.validate(payload, {abortEarly: false, stripUnknown: false});

            // Normalizações
            const docDigits = onlyDigits(values.document || '');
            const phoneDigits = onlyDigits(values.phone || '');
            const perc =
                typeof values.percentage === 'number'
                    ? String(values.percentage)
                    : String(values.percentage || '').replace(/\./g, '').replace(',', '.');

            // business_id: se estiver criando em uma empresa associada, use parent; senão, o client principal
            const businessId = (parentBusinessId ?? initialValues?.parent_business_id) || clientId;

            // associate: regra sugerida -> marcar "1" quando estiver vinculando a uma empresa "associada" (há parent)
            const associate = parentBusinessId ? '1' : '0';

            // Monta FormData no formato exato do print
            const fd = new FormData();
            fd.append('business_id', businessId);
            fd.append('type', type); // 'PERSON' | 'BUSINESS'
            fd.append('role', values.occupation || ''); // occupation -> role (ex.: 'RH')
            fd.append('name', values.name);
            fd.append('document', docDigits);
            fd.append('phone', phoneDigits);
            fd.append('email', values.email);
            fd.append('participation_percentage', perc);
            fd.append('associate', associate);

            // Opcional: anexar documentos se existirem em payload.documents = [{id, path}, ...]
            // (adicione payload.documents ao seu estado caso ainda não tenha)
            // if (Array.isArray((payload as any).documents)) {
            //   (payload as any).documents.forEach((d: any, i: number) => {
            //     if (d?.id)   fd.append(`documents[${i}][id]`, String(d.id));
            //     if (d?.path) fd.append(`documents[${i}][path]`, String(d.path));
            //   });
            // }

            // Chamada — o endpoint que você já usa, agora com body achatado:
            if (mode === 'edit') {
                // precisa de values.id
                await api.put(`${authApi}/v1/client/${clientId}/members/${values.id}`, fd);
            } else {
                await api.post(`${authApi}/v1/client/members/${clientId}`, fd);
            }

            onSaved(
                // mantém o retorno local para atualizar UI
                {
                    id: values.id || '',
                    level: resolvedLevel,
                    member_type: type,
                    associate: associate === '1',
                    details: {id: '', name: values.name, document: docDigits},
                    participation_percentage: perc,
                    parent_business_id: parentBusinessId ?? null,
                    required_documents: [],
                    submitted_documents: [],
                    type: type === 'PERSON' && values.representative ? 'LEGAL_REPRESENTATIVE' : null,
                    members: [],
                } as MemberNode
            );

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
                        el.scrollIntoView({behavior: 'smooth', block: 'center'});
                        (el as any).focus?.();
                    }
                }, 50);
            }
        }
    };


    return (
        <form className="py-6" onSubmit={handleSubmit} noValidate>
            <h2 className="text-neutral mb-3">Informações Gerais</h2>

            {/* Tipo: Pessoa Física / Jurídica */}
            <div className="flex items-center gap-4 mb-6">
                <label className="flex items-center gap-1 text-sm">
                    <input
                        type="radio"
                        name="member_type"
                        value="PERSON"
                        checked={type === 'PERSON'}
                        onChange={() => !typeLocked && setType('PERSON')}
                        disabled={typeLocked}
                    />
                    Pessoa Física
                </label>
                <label className="flex items-center gap-1 text-sm">
                    <input
                        type="radio"
                        name="member_type"
                        value="BUSINESS"
                        checked={type === 'BUSINESS'}
                        onChange={() => !typeLocked && setType('BUSINESS')}
                        disabled={typeLocked}
                    />
                    Pessoa Jurídica
                </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Documento (CPF/CNPJ dinâmico) */}
                <Input
                    id="document"
                    label={documentLabel}
                    value={payload.document}
                    setState={(updater: any) =>
                        setPayload((prev: any) =>
                            typeof updater === 'function' ? updater(prev) : {...prev, document: updater},
                        )
                    }
                    maskType={documentMask}
                    placeholder={documentPlaceholder}
                    floating={false}
                    suffix={<IdentificationIcon className="w-5 h-5 stroke-gray"/>}
                    errorExternal={errors.document}
                />

                {/* Ocupação: apenas PF */}
                {type === 'PERSON' && (
                    <SelectLabel
                        id="occupation"
                        label="Qualificação"
                        options={occupationOptions}
                        placeholder="Selecione"
                        value={payload.occupation}
                        setState={(updater: any) =>
                            setPayload((prev: any) =>
                                typeof updater === 'function' ? updater(prev) : {...prev, occupation: updater},
                            )
                        }
                        errorExternal={errors.occupation}
                    />
                )}
            </div>

            {/* Nome / Razão Social */}
            <Input
                id="name"
                label={nameLabel}
                value={payload.name}
                setState={(updater: any) =>
                    setPayload((prev: any) => (typeof updater === 'function' ? updater(prev) : {
                        ...prev,
                        name: updater
                    }))
                }
                placeholder={type === 'PERSON' ? 'Digite o nome completo' : 'Digite a razão social'}
                floating={false}
                suffix={<UserIcon className="w-5 h-5 stroke-gray"/>}
                errorExternal={errors.name}
            />

            {/* Percentual */}
            <Input
                id="percentage"
                label="Percentual de Participação"
                value={payload.percentage}
                maskType="percentage"
                setState={(updater: any) =>
                    setPayload((prev: any) =>
                        typeof updater === 'function' ? updater(prev) : {...prev, percentage: updater},
                    )
                }
                placeholder="0,00"
                floating={false}
                suffix={<span className="font-lg stroke-gray">%</span>}
                errorExternal={errors.percentage}
            />
            <p className="text-xs text-neutral mt-1">
              Disponível neste nível: <span className="font-semibold">{maxAllowedPercentage.toFixed(2)}%</span>
            </p>

            {/* Telefone e e-mail */}
            <div className="flex gap-4 mt-5">
                <div className="w-3/12">
                    <SelectLabel
                        id="ddi"
                        label="DDI"
                        options={ddiOptions}
                        placeholder=""
                        disabled
                        value={payload.ddi}
                        setState={(updater: any) =>
                            setPayload((prev: any) =>
                                typeof updater === 'function' ? updater(prev) : {...prev, ddi: updater},
                            )
                        }
                        errorExternal={errors?.ddi}
                    />
                </div>

                <div className="w-9/12">
                    <Input
                        id="phone"
                        label="Telefone"
                        type="tel"
                        maskType="phone"
                        value={payload.phone}
                        setState={(updater: any) =>
                            setPayload((prev: any) =>
                                typeof updater === 'function' ? updater(prev) : {...prev, phone: updater},
                            )
                        }
                        placeholder="(00) 00000-0000"
                        floating={false}
                        suffix={<PhoneIcon className="w-5 h-5"/>}
                        errorExternal={errors.phone}
                    />
                </div>
            </div>

            <Input
                id="email"
                label="E-mail"
                type="email"
                value={payload.email}
                setState={(updater: any) =>
                    setPayload((prev: any) =>
                        typeof updater === 'function' ? updater(prev) : {...prev, email: updater},
                    )
                }
                placeholder="empresa@email.com"
                suffix={<EnvelopeIcon className="w-5 h-5"/>}
                floating={false}
                errorExternal={errors.email}
            />

            {/* Representante legal: apenas PF */}
            {type === 'PERSON' && (
                <CheckboxLabel
                    id="representative"
                    label="Representante Legal"
                    value={payload.representative}
                    setState={(fnOrVal: any) =>
                        setPayload((prev: any) =>
                            typeof fnOrVal === 'function' ? fnOrVal(prev) : {...prev, representative: fnOrVal},
                        )
                    }
                />
            )}

            {/* Endereço: obrigatório apenas para PF */}
            {type === 'PERSON' && (
                <>
                    <h2 className="text-neutral mb-3 mt-6">Endereço</h2>
                    <Address
                        addresses={payload.addresses}
                        onChange={(next: any) => setPayload((prev: any) => ({...prev, addresses: next}))}
                    />
                    <AlertMessage message={errors.addresses} type="error" className="relative" />
                </>
            )}

            <UploadFile
                ref={uploadRef}
                id="frente_doc"
                label="Documento (frente)"
                hint="JPG, PNG ou PDF — até 5MB"
                accept="image/*,application/pdf"
                maxSizeMB={5}
                value={payload.frente_doc}     // controlado
                setState={setPayload}          // o próprio componente faz: { ...prev, [id]: file }
                errorExternal={undefined}
                required
                clientId={clientId}
                documentTypeId=""
                ownerDocument={payload.document || ''}
            />

            {errors.__global ? <p className="text-red-600 text-sm mt-3">{errors.__global}</p> : null}

            <div className="mt-6">
                <Button type="submit" color="primary" fullWidth disabled={loading || maxAllowedPercentage <= 0} loading={loading}>
                    Salvar Participante
                </Button>
            </div>
        </form>
    );
}
