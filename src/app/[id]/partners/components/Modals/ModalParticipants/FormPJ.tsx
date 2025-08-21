'use client';

import * as React from 'react';
import { Button } from '@/components/Button/Button';

export default function FormPJ({
  onSubmit,
  initialValues,
  readOnlyType: _readOnlyType,
}: {
  onSubmit: (values: any) => void;
  initialValues?: any;
  readOnlyType?: boolean;
}) {
  const [payload, setPayload] = React.useState({
    corporate_name: '',
    cnpj: '',
    email: '',
    phone: '',
    percentage: '',
    ...(initialValues || {}),
  });
  const [pending, _startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(payload);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
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
        value={payload.percentage || ''}
        onChange={(e) => setPayload((p) => ({ ...p, percentage: e.target.value }))}
      />
      <Button type="submit" color="primary" fullWidth disabled={pending}>
        {pending ? 'Salvando...' : 'Salvar (PJ)'}
      </Button>
    </form>
  );
}

