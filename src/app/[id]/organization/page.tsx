'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// import { useOnboarding } from '@/contexts/OnboardingContext';
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
// import {AddressModal, type Address} from "@/app/[id]/organization/components/AddressModal";

// Tipos originais
// type RouteParams = { linkCode?: string };

type CompanyData = {
    document: string;
    social_name: string;
    fantasy_name: string | null;
    phone: string;
    email: string;
};

export default function OrganizationPage() {
    const [data, updateData ]  = useState([]);
    const router = useRouter();
    const params = useParams<{ id?: string }>();
    const linkCode = params?.id as string | undefined;

    const [modalOpen, setModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    type Option = { label: string; value: string };

    const [payload, setPayload] = useState({
        document: '',
        social_name: '',
        fantasy_name: '',
        ddi: '',
        phone: '',
        email: '',
        addresses: [],
        // addresses: (data?.organization?.addresses ?? (data?.organization as any)?.address ?? []) as Address[],
    });

 /*   useEffect(() => {
        setPayload({
            document: data?.organization?.document || '',
            social_name: data?.organization?.social_name ?? '',
            fantasy_name: data?.organization?.fantasy_name ?? '',
            ddi: data?.organization?.ddi ?? '',
            phone: data?.organization?.phone ?? '',
            email: data?.organization?.email ?? '',
            addresses: (data?.organization?.addresses ?? (data?.organization as any)?.address ?? []) as Address[],
        });
    }, [data?.organization]);*/

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

    const to = (path: string) => `/${linkCode ?? ''}/${path}`.replace(/\/+/g, '/');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const values: any = (await schema.validate(payload, {
                abortEarly: false,
            })) as CompanyData & { addresses: Address[] };

            // updateData('organization', values);
            router.push(to('representative'));
        } catch (err: any) {
            console.error(err);

            const next: Record<string, string> = {};

            if (err?.inner?.length) {
                err.inner.forEach((i: any) => {
                    if (i.path && !next[i.path]) {
                        next[i.path] = i.message;
                    }
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

    const a0 = (payload.addresses?.[0] as Address | undefined) ?? undefined;

    const ddiOptions: Option[] = Object.keys(ddi)
        .map((code) => ({ label: `+${code}`, value: `${code}` }))
        .sort((a, b) => Number(a.value) - Number(b.value));

    return (
        <>
            <section className="pt-24 pb-6">
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

                    <form onSubmit={handleSubmit} className="">
                        <div className="space-y-6">
                            <Input
                                id="document"
                                label="CNPJ"
                                maskType="document"
                                value={payload.document}
                                setState={(fn) => setPayload((prev) => fn({ ...prev }))}
                                placeholder=""
                                disabled
                                suffix={<BuildingOfficeIcon className="w-5 h-5" />}
                                errorExternal={errors.document}
                            />

                            <Input
                                id="social_name"
                                label="Razão Social"
                                value={payload.social_name}
                                setState={(fn) => setPayload((prev) => fn({ ...prev }))}
                                placeholder=""
                                disabled={true}
                                suffix={<UserIcon className="w-5 h-5" />}
                                errorExternal={errors.social_name}
                            />

                            <Input
                                id="fantasy_name"
                                label="Nome Fantasia"
                                value={payload.fantasy_name ?? ''}
                                setState={(fn) => setPayload((prev) => fn({ ...prev }))}
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
                                setState={setPayload}
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
                                    setState={setPayload}
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
                                </Button>
                            </div>
                        </div>

                        <Button type="submit" color="primary" fullWidth>
                            Próximo
                        </Button>
                    </form>
                </div>
            </section>


          {/*  <AddressModal
                open={modalOpen}
                index={0}
                address={(payload.addresses?.[0] as Address) || null}
                onClose={() => setModalOpen(false)}
            />*/}
        </>
    );
}
