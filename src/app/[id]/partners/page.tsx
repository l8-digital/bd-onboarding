'use client';

import React, {useState} from 'react';
import { useRouter, useParams } from 'next/navigation';
// import { useOnboarding } from '@/contexts/OnboardingContext';
import { Input } from '@/components/FormsElements/Input';
import { Button } from '@/components/Button/Button';
import { SelectLabel } from '@/components/FormsElements/SelectLabel';
import Index  from './components/Modals/ModalParticipants';
import ddi from '@/utils/ddi.json';
import * as yup from 'yup';
import { isValidCpf, isValidPhoneBR } from '@/utils/validation';
import { BuildingOffice2Icon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

// Tipos locais

type Option = { label: string; value: string };

type RepresentativePayload = {
    name: string;
    document: string;
    ddi: string;
    phone: string;
    email: string;
};

const schema = yup.object({
    name: yup.string().required('Obrigatório'),
    document: yup
        .string()
        .required('CPF obrigatório')
        .test('cpf', 'CPF inválido', isValidCpf),
    phone: yup
        .string()
        .required('Informe um número de telefone')
        .test('br-phone', 'Número de telefone inválido', (val) => isValidPhoneBR(val)),
    email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
});

export default function RepresentativePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params?.id;

    // const { data, updateData } = useState();
    const [data, updateData ]  = useState([]);

    const [openParticipant, setOpenParticipant] = React.useState(false);

    // inicializa com 1 representante (pode puxar defaults do contexto se houver)
    const [payload, setPayload] = React.useState<RepresentativePayload>({
        name: '',
        document: '',
        ddi: '55',
        phone: '',
        email: '',
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const ddiOptions: Option[] = Object.keys(ddi)
        .map((code) => ({ label: `+${code}`, value: `${code}` }))
        .sort((a, b) => Number(a.value) - Number(b.value));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const values = (await schema.validate(payload, { abortEarly: false })) as RepresentativePayload;

            // Normalize se quiser concatenar DDI + número (ex.: +55XXXXXXXXXXX)
            // const onlyDigits = (s: string) => (s || '').replace(/\D/g, '');
            // const localDigits = onlyDigits(values.phone);
            // const fullPhone = values.ddi === '55' ? `+55${localDigits}` : `+${values.ddi}${localDigits}`;

          /*  updateData('legal_representatives', [
                {
                    name: values.name,
                    document: values.document,
                    phone: values.phone, // ou fullPhone
                    email: values.email,
                },
            ] as any);*/

            router.push(`/${id}/collaborators`);
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
                    const el = document.getElementById(first) as HTMLInputElement | null;
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el?.focus();
                }, 50);
            }
        }
    }

    return (
        <main className="max-w-2xl mx-auto pt-24 px-4">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-2 mb-8 pt-12">
                    <h2 className="text-center text-2xl font-black">Socios e Representantes</h2>
                    <p className="text-center text-neutral text-[15px]">
                        É o momento de conhecer a equipe que compõe o quadro societário da empresa.
                    </p>
                </div>

                <section className="">
                    <div className="rounded-xl border border-neutral/10 bg-neutral/5 shadow-sm">
                        <div className="flex items-start gap-4 p-4">
                            <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center" />
                            <div className="flex-1">
                                <p className="text-xs text-slate-700">
                                    Adicione sócios que somem ao menos <span className="font-semibold">80% de participação</span>,
                                    todos os <span className="font-semibold">administradores</span> e
                                    <span className="font-semibold"> 1 representante legal por nível até o 3º</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-3">
                    <div className="rounded-xl border border-neutral/10 bg-white shadow-sm">
                        <div className="p-4 flex items-center gap-4">
                            <BuildingOffice2Icon className="w-5 h-5 stroke-blue" />

                            <div className="w-full flex flex-col items-start">
                                <div className="w-full flex items-center justify-between">
                                    <div className="flex items-center justify-between gap-5">
                                        <div>
                                            <p className="uppercase font-medium">NOME DA EMPRESA</p>
                                            <p className="text-xs text-neutral/70">Empresa principal</p>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        color="gray"
                                        size="sm"
                                        iconLeft={<PlusIcon className="w-4 h-4 stroke-black" />}
                                        onClick={() => setOpenParticipant(true)}
                                    >
                                        Participante
                                    </Button>
                                </div>

                                <p className="w-auto flex items-center mt-1.5 rounded-full bg-red/10 pl-1 pr-2 py-1 text-red text-xs">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red text-white text-xs mr-2">
                    !
                  </span>
                                    Pelo menos um Representante Legal precisa ser adicionado.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-3">
                    <div className="bg-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center">
                                    <BuildingOffice2Icon className="w-5 h-5 stroke-blue" />
                                </div>
                                <div>
                                    <p className="font-medium leading-tight">TRIPOD PARTICIPATION LTDA</p>
                                    <p className="text-xs text-slate-500">Empresa associada • 100%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm hover:bg-slate-50"
                                    aria-label="Editar empresa"
                                    type="button"
                                >
                                    <PencilIcon className="w-4 h-4 stroke-black" />
                                </button>

                                <Button
                                    type="button"
                                    color="gray"
                                    size="sm"
                                    iconLeft={<PlusIcon className="w-4 h-4 stroke-black" />}
                                    onClick={() => setOpenParticipant(true)}
                                >
                                    Participante
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 ml-10 border-l border-slate-200 pl-6">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                                        LC
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-tight">LEANDRO VIANA COLHADO</p>
                                        <p className="text-xs text-slate-500">Sócio • 100% • Rep. Legal</p>
                                    </div>
                                </div>
                                <button
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm hover:bg-slate-50"
                                    aria-label="Editar sócio"
                                    type="button"
                                >
                                    <PencilIcon className="w-4 h-4 stroke-black" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <p className="mt-10 text-center text-xs text-neutral/70">
                    Não se preocupe, todos os dados preenchidos são salvos automaticamente.
                </p>

                <div className="mt-4">
                    <Button type="submit" color="primary" fullWidth>
                        Continuar
                    </Button>
                </div>
            </form>

            <Index open={openParticipant} onClose={() => setOpenParticipant(false)} />
        </main>
    );
}
