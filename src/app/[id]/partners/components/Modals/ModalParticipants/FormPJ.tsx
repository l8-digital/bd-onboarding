'use client';

import * as React from 'react';
import { Button } from '@/components/Button/Button';
import api from '@/lib/axios';
import { authApi } from '@/lib/urlApi';
import { MemberNode } from '@/types/Members';

type FormPJProps = {
  clientId: string;
  initialValues?: any;
  readOnlyType?: boolean;
  onSaved?: (saved: MemberNode) => void;
  level?: number;
  parentBusinessId?: string;
};

export default function FormPJ({
  clientId,
  initialValues,
  readOnlyType: _readOnlyType,
  onSaved,
  level,
  parentBusinessId,
}: FormPJProps) {
  const [payload, setPayload] = React.useState({
    id: initialValues?.id ?? '',
    corporate_name: initialValues?.corporate_name ?? '',
    cnpj: initialValues?.cnpj ?? '',
    email: initialValues?.email ?? '',
    phone: initialValues?.phone ?? '',
    percentage: initialValues?.percentage ?? '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const resolvedLevel = level ?? 1;
  const resolvedParent = parentBusinessId ?? null;

  const buildMemberNode = (values: any): MemberNode => ({
    id: values.id || '',
    level: resolvedLevel,
    member_type: 'BUSINESS',
    associate: false,
    details: { id: '', name: values.corporate_name, document: values.cnpj },
    participation_percentage: values.percentage,
    parent_business_id: resolvedParent,
    required_documents: [],
    submitted_documents: [],
    type: null,
    members: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const values = payload;
    const isEdit = Boolean(values.id);

    const upsertPayload = {
      member: {
        id: values.id || undefined,
        member_type: 'BUSINESS',
        details: { name: values.corporate_name, document: values.cnpj },
        participation_percentage: values.percentage,
        email: values.email || undefined,
        phone: values.phone || undefined,
        level: resolvedLevel,
        parent_business_id: resolvedParent,
      },
    };

    try {
      if (isEdit) {
        await api.put(`${authApi}/v1/client/${clientId}/members/${values.id}`, upsertPayload);
      } else {
        // await api.post(`${authApi}/v1/client/members/${clientId}`, upsertPayload);
      }

      onSaved?.(buildMemberNode(values));
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrors({ __global: err?.message || 'Erro ao salvar.' });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <input
        className="input"
        placeholder="Razão Social"
        value={payload.corporate_name}
        onChange={(e) => setPayload((p) => ({ ...p, corporate_name: e.target.value }))}
      />
      <input
        className="input"
        placeholder="CNPJ"
        value={payload.cnpj}
        onChange={(e) => setPayload((p) => ({ ...p, cnpj: e.target.value }))}
      />
      <input
        className="input"
        placeholder="E-mail"
        value={payload.email}
        onChange={(e) => setPayload((p) => ({ ...p, email: e.target.value }))}
      />
      <input
        className="input"
        placeholder="Telefone"
        value={payload.phone}
        onChange={(e) => setPayload((p) => ({ ...p, phone: e.target.value }))}
      />
      <input
        className="input"
        placeholder="Percentual de Participação"
        value={payload.percentage}
        onChange={(e) => setPayload((p) => ({ ...p, percentage: e.target.value }))}
      />
      {errors.__global && <p className="text-red text-sm">{errors.__global}</p>}
      <Button type="submit" color="primary" fullWidth disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar (PJ)'}
      </Button>
    </form>
  );
}

