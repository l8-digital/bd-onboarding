'use client'

'use client';

import React, {useMemo, useState} from 'react';
import { useRouter } from 'next/navigation';
import {isValidCnpj, isValidPhoneBR} from '@/utils/validation';
import {Input} from '@/components/FormsElements/Input';
import {BuildingOfficeIcon, EnvelopeIcon, MapPinIcon, PhoneIcon, UserIcon} from '@heroicons/react/24/outline';
import * as yup from 'yup';
import {Button} from '@/components/Button/Button';
import {SelectLabel} from '@/components/FormsElements/SelectLabel';
import ddi from '@/utils/ddi.json';
import {OnboardingLinkApi} from '@/server/onboarding.service';
import {pathForStep} from '@/utils/onboarding-steps';
import {Address} from "@/components/Address";
import api from '@/lib/api.server';
import {authApi} from "@/lib/urlApi";


type Option = { label: string; value: string };

export default function OrganizationPageClient({link}: { link: OnboardingLinkApi }) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [payload, setPayload] = useState({
        link: link?.link ?? '',
        business_document: link?.business_document ?? '',
        social_name: link?.business_name ?? '',
        fantasy_name: link?.extra_information?.fantasy_name ?? '',
        number_of_employees: link?.extra_information?.number_of_employees ?? '',
        payroll: 1,
        ddi: link?.business_phone?.slice(0, 2) ?? '',
        phone: link?.business_phone?.slice(2) ?? '',
        email: link?.business_email ?? link?.email?.[0]?.email ?? '',
        addresses: link?.extra_information?.addresses ?? [],
    });

    const schema = yup.object({
        business_document: yup.string().required('CNPJ obrigatório').test('cnpj', 'CNPJ inválido', isValidCnpj),
        social_name: yup.string().required('Razão social obrigatória'),
        fantasy_name: yup.string().nullable(),
        phone: yup.string().required('Informe um número de telefone')
            .test('br-phone', 'Número de telefone inválido', (val) => isValidPhoneBR(val)),
        email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {

            const values = await schema.validate(payload, { abortEarly: false });

            // const res = await api.post(`${authApi}/v1/client/store`, values);

            const res = await api.post(`${authApi}/v1/client/store`, values)

            const id = res?.data?.link?.link;
            const step = res?.data?.link?.step;

            const target = pathForStep(id, step) as string;

            router.replace(target);
        } catch (err: any) {
            setLoading(false);

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
                        el.scrollIntoView({behavior: 'smooth', block: 'center'});
                        el.focus?.();
                    }
                }, 50);
            }
        }
    };

    const ddiOptions: Option[] = useMemo(() =>
        Object.keys(ddi)
            .map((code) => ({label: `+${code}`, value: `${code}`}))
            .sort((a, b) => Number(a.value) - Number(b.value)), []
    );

    return (
        <>
            <main>
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
                                Verifique se todos os dados estão corretos. Essas informações serão usadas para concluir
                                o
                                cadastro da sua conta.
                            </p>
                        </div>

                        <div>
                            <div className="space-y-6">
                                <Input
                                    id="business_document"
                                    label="CNPJ"
                                    maskType="document"
                                    value={payload.business_document}
                                    setState={setPayload}
                                    placeholder=""
                                    disabled
                                    suffix={<BuildingOfficeIcon className="w-5 h-5"/>}
                                    errorExternal={errors.business_document}
                                />

                                <Input
                                    id="social_name"
                                    label="Razão Social"
                                    value={payload.social_name}
                                    setState={setPayload}
                                    placeholder=""
                                    disabled
                                    suffix={<UserIcon className="w-5 h-5"/>}
                                    errorExternal={errors.social_name}
                                />

                                <Input
                                    id="fantasy_name"
                                    label="Nome Fantasia"
                                    value={payload.fantasy_name ?? ''}
                                    setState={setPayload}
                                    placeholder="Nome fantasia"
                                    floating={false}
                                    suffix={<UserIcon className="w-5 h-5"/>}
                                    errorExternal={errors.fantasy_name}
                                />

                                <Input
                                    id="email"
                                    label="E-mail"
                                    type="email"
                                    value={payload.email}
                                    setState={setPayload}
                                    placeholder="empresa@email.com"
                                    suffix={<EnvelopeIcon className="w-5 h-5"/>}
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
                                        placeholder=""
                                        disabled
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
                                        suffix={<PhoneIcon className="w-5 h-5"/>}
                                        errorExternal={errors.phone}
                                    />
                                </div>
                            </div>

                            <Address
                                addresses={payload.addresses}
                                onChange={(next: any) => setPayload(prev => ({...prev, addresses: next}))}
                            />

                            <Button type="button" onClick={handleSubmit} loading={loading} disabled={loading}
                                    color="primary" fullWidth>
                                Próximo
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
