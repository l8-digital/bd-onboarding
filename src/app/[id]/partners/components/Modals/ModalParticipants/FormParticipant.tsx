'use client';

import * as React from 'react';
import * as Yup from 'yup';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/FormsElements/Input';
import { CheckboxLabel } from '@/components/FormsElements/CheckboxLabel';
import api from '@/lib/axios';
import { authApi } from '@/lib/urlApi';
import { MemberNode } from '@/types/Members';

// Utils copied from old FormPF
const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
const isAllSameDigits = (s: string) => /^(\d)\1+$/.test(s);

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

const percentageTransform = (_value: any, originalValue: any) => {
  if (typeof originalValue === 'string') {
    const n = Number(originalValue.replace(/\./g, '').replace(',', '.'));
    return Number.isNaN(n) ? undefined : n;
  }
  return originalValue;
};

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
    representative: Yup.boolean().optional(),
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
  };
  maxAllowedPercentage: number;
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
  const [payload, setPayload] = React.useState({
    id: initialValues?.id ?? '',
    name: initialValues?.name ?? '',
    document: initialValues?.document ?? '',
    percentage: initialValues?.percentage ?? '',
    representative: initialValues?.representative ?? false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const resolvedLevel = level ?? initialValues?.level ?? 1;
  const resolvedParent = parentBusinessId ?? initialValues?.parent_business_id ?? null;
  const typeLocked = readOnlyType || mode === 'edit';

  const buildMemberNode = (values: any): MemberNode => ({
    id: values.id || '',
    level: resolvedLevel,
    member_type: type,
    associate: false,
    details: { id: '', name: values.name, document: values.document },
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
      const values = await schema.validate(payload, { abortEarly: false, stripUnknown: false });

      const upsertPayload = {
        member: {
          id: values.id || undefined,
          member_type: type,
          details: { name: values.name, document: values.document },
          participation_percentage: values.percentage,
          type: type === 'PERSON' && values.representative ? 'LEGAL_REPRESENTATIVE' : null,
          level: resolvedLevel,
          parent_business_id: resolvedParent,
        },
      };

      if (mode === 'edit') {
        await api.put(`${authApi}/v1/client/${clientId}/members/${values.id}`, upsertPayload);
      } else {
        await api.post(`${authApi}/v1/client/members/${clientId}`, upsertPayload);
      }

      onSaved(buildMemberNode(values));
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

      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-1 text-sm">
          <input
            type="radio"
            name="member_type"
            value="PERSON"
            checked={type === 'PERSON'}
            onChange={() => setType('PERSON')}
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
            onChange={() => setType('BUSINESS')}
            disabled={typeLocked}
          />
          Pessoa Jurídica
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          id="name"
          label={type === 'PERSON' ? 'Nome completo' : 'Razão social'}
          value={payload.name}
          setState={(updater: any) =>
            setPayload((prev: any) => (typeof updater === 'function' ? updater(prev) : { ...prev, name: updater }))
          }
          floating={false}
        />
        <Input
          id="document"
          label={type === 'PERSON' ? 'CPF' : 'CNPJ'}
          value={payload.document}
          setState={(updater: any) =>
            setPayload((prev: any) => (typeof updater === 'function' ? updater(prev) : { ...prev, document: updater }))
          }
          maskType={type === 'PERSON' ? 'cpf' : 'document'}
          placeholder={type === 'PERSON' ? '000.000.000-00' : '00.000.000/0000-00'}
          floating={false}
        />
        <div>
          <Input
            id="percentage"
            label="Participação (%)"
            value={payload.percentage}
            setState={(updater: any) =>
              setPayload((prev: any) => (typeof updater === 'function' ? updater(prev) : { ...prev, percentage: updater }))
            }
            maskType="percentage"
            placeholder="0,00%"
            floating={false}
          />
          <p className="text-xs text-neutral mt-1">
            Disponível neste nível: <span className="font-semibold">{maxAllowedPercentage.toFixed(2)}%</span>
          </p>
        </div>
        {type === 'PERSON' && (
          <CheckboxLabel
            id="representative"
            label="Representante Legal"
            value={payload.representative}
            setState={(value: any) => setPayload((prev: any) => ({ ...prev, representative: value }))}
          />
        )}
      </div>

      {errors.__global && <p className="text-red text-sm mt-4">{errors.__global}</p>}

      <div className="mt-6">
        <Button type="submit" color="primary" fullWidth disabled={loading || maxAllowedPercentage <= 0}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}

