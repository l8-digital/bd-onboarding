'use client';

import * as React from 'react';
import { Button } from '@/components/Button/Button';
// import { schemaPJ } from '../schemas/pj';
// import { savePJ } from '@/app/_actions/participants/pj';

export default function FormPJ({ onSuccess }: { onSuccess: () => void }) {
    const [payload, setPayload] = React.useState({ corporate_name:'', cnpj:'', email:'', phone:'' });
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [pending, startTransition] = React.useTransition();

   /* async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        try {
            const valid = await schemaPJ.validate(payload, { abortEarly: false });
            startTransition(async () => {
                await savePJ(valid); // endpoint PJ
                onSuccess();
            });
        } catch (err: any) {
            const next: Record<string, string> = {};
            err?.inner?.forEach((i: any) => { if (i.path && !next[i.path]) next[i.path] = i.message; });
            if (err?.path) next[err.path] = err.message;
            setErrors(next);
        }
    }*/

    return (
        <form className="space-y-4">
            {/* seus Inputs reais aqui */}
            <input className="input" placeholder="Razão Social" value={payload.corporate_name} onChange={e=>setPayload(p=>({...p, corporate_name:e.target.value}))}/>
            <input className="input" placeholder="CNPJ" value={payload.cnpj} onChange={e=>setPayload(p=>({...p, cnpj:e.target.value}))}/>
            <input className="input" placeholder="E-mail" value={payload.email} onChange={e=>setPayload(p=>({...p, email:e.target.value}))}/>
            <input className="input" placeholder="Telefone" value={payload.phone} onChange={e=>setPayload(p=>({...p, phone:e.target.value}))}/>
            <Button type="submit" color="primary" fullWidth disabled={pending}>{pending?'Salvando...':'Salvar (PJ)'}</Button>
        </form>
    );
}