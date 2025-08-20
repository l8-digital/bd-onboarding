'use client'

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingServerContext';
import { isValidCnpj, isValidPhoneBR } from '@/utils/validation';
import { Input } from '@/components/FormsElements/Input';
import {
    BuildingOfficeIcon,
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import * as yup from 'yup';
import { Button } from '@/components/Button/Button';
import { SelectLabel } from '@/components/FormsElements/SelectLabel';
import ddi from '@/utils/ddi.json';
import { type Address, AddressModal } from '@/components/Modals/ModalAddress';

// --- Tipos ---
interface CompanyData {
    document: string;
    social_name: string;
    fantasy_name: string | null;
    phone: string;
    email: string;
}

interface Payload extends CompanyData {
    ddi: string;
    addresses: Address[];
}

type Option = { label: string; value: string };

export default function OrganizationPage() {
    const router = useRouter();
    const params = useParams<{ id?: string }>();
    const linkCode = (params?.id as string | undefined) ?? undefined;

    const { organization } = useOnboarding();

    // --- Estado principal ---
    const [payload, setPayload] = useState<Payload>({
        document: organization?.document ?? '',
        social_name: organization?.social_name ?? '',
        fantasy_name: organization?.fantasy_name ?? '',
        ddi: '',
        phone: organization?.phone ?? '',
        email: organization?.email ?? '',
        addresses: organization?.addresses ?? [],
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Helper: mesmo contrato que seus Inputs esperam (recebe fn(prev) => next)
    const patchPayload = (fn: (draft: Payload) => Payload) =>
        setPayload((prev) => fn({ ...prev }));

    // Primeiro endereço (caso exista)
    const a0: Address | null = payload.addresses?.[0] ?? null;

    // Validação
    const schema = yup.object({
        document: yup
            .string()
            .required('CNPJ obrigatório')
            .test('cnpj', 'CNPJ inválido', isValidCnpj),
        social_name: yup.string().required('Razão social obrigatória'),
        fantasy_name: yup.string().nullable(),
        phone: yup
            .string()
            .required('Informe um número de telefone')
            .test('br-phone', 'Número de telefone inválido', (val) => isValidPhoneBR(val)),
        email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
    });

    const to = (path: string) => `/${linkCode ?? ''}/${path}`.replace(/\/+\//g, '/');

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const values = (await schema.validate(payload, { abortEarly: false })) as Payload;

            // Se quiser tornar endereço obrigatório, descomente:
            // if (!values.addresses?.[0]) {
            //   setErrors((prev) => ({ ...prev, addresses: 'Endereço obrigatório' }));
            //   return;
            // }

            // updateData('organization', values) // <- se usar contexto
            router.push(to('representative'));
        } catch (err: any) {
            const next: Record<string, string> = {};
            if (err?.inner?.length) {
                err.inner.forEach((i: any) => {
                    if (i.path && !next[i.path]) next[i.path] = i.message;
                });
            } else if (err?.path) {
                next[err.path] = err.message;
            }
            setErrors(next);

            const first = Object.keys(next)[0];
            if (first) {
                setTimeout(() => {
                    const el = document.getElementById(first);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // @ts-ignore
                        el.focus?.();
                    }
                }, 50);
            }
        }
    };

    // Opções de DDI
    const ddiOptions: Option[] = Object.keys(ddi)
        .map((code) => ({ label: `+${code}`, value: `${code}` }))
        .sort((a, b) => Number(a.value) - Number(b.value));

    // Salvar endereço vindo do modal
    function handleSave(index: number, addr: Address) {
        setPayload((prev) => {
            const next = [...(prev.addresses ?? [])];
            if (index < next.length) next[index] = addr;
            else next.push(addr);
            return { ...prev, addresses: next };
        });
        setModalOpen(false);
    }

    return (
        <>
            <section className="pt-24 pb-10">
                <div className="max-w-xl mx-auto">
                    <div className="grid gap-2 mb-8">
                        <img
                            src="https://static.azify.com/azify-ui/illustrations/light/medium/finance/buildings.png"
                            className="w-20 h-20 mx-auto"
                            alt="Buildings"
                        />
                        <h2 className="text-center text-lg font-black">Confira os Dados da Empresa</h2>
                        <p className="text-center text-[15px]">
                            Verifique se todos os dados estão corretos. Essas informações serão usadas para concluir o cadastro da sua
                            conta.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <Input
                                id="document"
                                label="CNPJ"
                                maskType="document"
                                value={payload.document}
                                setState={patchPayload}
                                placeholder=""
                                disabled
                                suffix={<BuildingOfficeIcon className="w-5 h-5" />}
                                errorExternal={errors.document}
                            />

                            <Input
                                id="social_name"
                                label="Razão Social"
                                value={payload.social_name}
                                setState={patchPayload}
                                placeholder=""
                                disabled
                                suffix={<UserIcon className="w-5 h-5" />}
                                errorExternal={errors.social_name}
                            />

                            <Input
                                id="fantasy_name"
                                label="Nome Fantasia"
                                value={payload.fantasy_name ?? ''}
                                setState={patchPayload}
                                placeholder="Nome fantasia"
                                floating={false}
                                suffix={<UserIcon className="w-5 h-5" />}
                                errorExternal={errors.fantasy_name}
                            />

                            <Input
                                id="email"
                                label="E-mail"
                                type="email"
                                value={payload.email}
                                setState={patchPayload}
                                placeholder="empresa@email.com"
                                suffix={<EnvelopeIcon className="w-5 h-5" />}
                                floating={false}
                                errorExternal={errors.email}
                            />
                        </div>

                        <div className="flex gap-4 mt-5">
                            <div className="w-3/12">
                                <SelectLabel
                                    id="ddi"
                                    label="DDI"
                                    options={ddiOptions}
                                    placeholder={''}
                                    disabled={true}
                                    value={payload.ddi}
                                    setState={setPayload}
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
                                    setState={patchPayload}
                                    placeholder="(00) 00000-0000"
                                    floating={false}
                                    suffix={<PhoneIcon className="w-5 h-5" />}
                                    errorExternal={errors.phone}
                                />
                            </div>
                        </div>

                        <div className="w-full mt-3 mb-8">
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

                        <Button type="submit" color="primary" fullWidth>
                            Próximo
                        </Button>
                    </form>
                </div>
            </section>

            <AddressModal
                open={modalOpen}
                index={0}
                address={a0}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
            />
        </>
    );
}
