'use client';

import React from 'react';
import * as yup from 'yup';
import ddi from '@/utils/ddi.json';
import {isValidPhoneBR} from '@/utils/validation';
import {ArrowLeftIcon, BuildingOffice2Icon, BuildingOfficeIcon, UserIcon} from '@heroicons/react/24/outline';
import {Button} from '@/components/Button/Button';
import {Input} from "@/components/FormsElements/Input";
import FormPF from "./FormPF";
import FormPJ from "./FormPJ";

export type RHContact = {
    id: string;
    email: string;
    phone: string;
};

type Option = { label: string; value: string };

interface ModalRHProps {
    open: boolean; // contato que vamos editar/criar
    onClose: () => void;
}

const ModalPaticipants: React.FC<ModalRHProps> = ({open, onClose}) => {
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [phoneDdi, setPhoneDdi] = React.useState('');
    const [errors, setErrors] = React.useState<{ email?: string; phone?: string }>({});
    const emailRef = React.useRef<HTMLInputElement | null>(null);

    // --- TABS ---
    type TabKey = 'fisica' | 'juridica';
    const [activeTab, setActiveTab] = React.useState<TabKey>('fisica');

    const onTabClick = (tab: TabKey) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setActiveTab(tab);
    };

    const isActive = (tab: TabKey) => activeTab === tab;

    const tabBaseClasses =
        'z-30 flex items-center justify-center gap-2 border-t-2 w-full px-0 text-[15px] py-2 transition-all ease-in-out cursor-pointer';

    const tabActiveClasses = 'border-primary text-slate-900';
    const tabInactiveClasses = 'border-transparent text-slate-600';

    // Foco inicial
    React.useEffect(() => {
        if (open) {
            const t = setTimeout(() => emailRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [open]);

    // Fechar com ESC
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const schema = yup.object({
        phone: yup
            .string()
            .required('Informe um número de telefone')
            .test('br-phone', 'Número de telefone inválido', (val) => isValidPhoneBR(val)),
        email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
    });

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        setErrors({});

        try {
            const values = await schema.validate({email, phone}, {abortEarly: false});
            // use values conforme necessário
            onClose();
        } catch (err: any) {
            const next: { email?: string; phone?: string } = {};
            if (err?.inner?.length) {
                err.inner.forEach((i: any) => {
                    if (i.path && !next[i.path as 'email' | 'phone']) {
                        next[i.path as 'email' | 'phone'] = i.message;
                    }
                });
            } else if (err?.path) {
                next[err.path as 'email' | 'phone'] = err.message;
            }
            setErrors(next);

            // scroll/ focus no primeiro erro
            const first = Object.keys(next)[0];
            if (first === 'email') {
                emailRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
                emailRef.current?.focus();
            }
        }
    }

    const ddiOptions: Option[] = Object.keys(ddi)
        .map((code) => ({
            label: `+${code}`,
            value: `${code}`,
        }))
        .sort((a, b) => Number(a.value) - Number(b.value));

    if (!open) return null;

    return (
        <div className="w-full h-full fixed top-0 left-0 bg-[#F8F9FB] overflow-auto z-[30]">
            <div className="max-w-4xl h-full mx-auto">
                <div className="w-full flex justify-center py-6">
                    <div className="w-2/12">
                        <button
                            className="p-1.5 inline-flex items-center rounded-full bg-gray/20 hover:text-zinc-900"
                            onClick={onClose}
                            type="button"
                        >
                            <ArrowLeftIcon className="h-4 w-4 stroke-neutral"/>
                        </button>
                    </div>

                    <h2 className="flex-1 text-center font-bold">Adicionar Participante</h2>

                    <div className="w-2/12"/>
                </div>

                <div className="w-full flex-1 bg-white border border-gray/10 shadow-lg px-4 rounded-t-2xl">
                    <div className="w-full max-w-xl mx-auto">
                        <div className="w-full">
                            <div className="relative right-0">
                                <ul className="relative flex flex-wrap px-1.5 list-none rounded-md bg-slate-100"
                                    role="list">
                                    <li className="z-30 flex-auto text-center">
                                        <a
                                            className={`${tabBaseClasses} ${isActive('fisica') ? tabActiveClasses : tabInactiveClasses}`}
                                            role="tab"
                                            aria-selected={isActive('fisica')}
                                            onClick={onTabClick('fisica')}
                                        >
                                            <UserIcon
                                                className={`w-4 h-4 ${isActive('fisica') ? 'stroke-primary' : 'stroke-neutral'}`}/>
                                            Pessoa Física
                                        </a>
                                    </li>
                                    <li className="z-30 flex-auto text-center">
                                        <a
                                            className={`${tabBaseClasses} ${isActive('juridica') ? tabActiveClasses : tabInactiveClasses}`}
                                            role="tab"
                                            aria-selected={isActive('juridica')}
                                            onClick={onTabClick('juridica')}
                                        >
                                            <BuildingOffice2Icon
                                                className={`w-4 h-4 ${isActive('juridica') ? 'stroke-primary' : 'stroke-neutral'}`}/>
                                            Pessoa Jurídica
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Conteúdo das abas */}
                        <div className={isActive('fisica') ? '' : 'hidden'}>
                            <FormPF onSuccess={onClose}/>
                        </div>

                        <div className={isActive('juridica') ? '' : 'hidden'}>
                            <FormPJ onSuccess={onClose}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalPaticipants;