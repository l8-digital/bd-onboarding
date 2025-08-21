'use client';

import * as React from 'react';
import {Button} from '@/components/Button/Button';
import {Input} from '@/components/FormsElements/Input';
import {SelectLabel} from '@/components/FormsElements/SelectLabel';
import {occupationOptions} from '@/lib/occupationOptions';
import {
  IdentificationIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {CheckboxLabel} from '@/components/FormsElements/CheckboxLabel';
import {Address} from '@/components/Address';

export default function FormPF({
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
    document: '',
    occupation: '',
    name: '',
    percentage: '',
    representative: false,
    addresses: [],
    frente_doc: '',
    cnpj: '',
    email: '',
    phone: '',
    ...(initialValues || {}),
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(payload);
  };

  return (
    <form className="py-6" onSubmit={handleSubmit}>
      <h2 className="text-neutral mb-3">Informações Gerais</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          id="document"
          label="CPF"
          value={payload.document}
          setState={setPayload}
          maskType="cpf"
          placeholder="000.000.000-00"
          floating={false}
          suffix={<IdentificationIcon className="w-5 h-5 stroke-gray" />}
          errorExternal={errors.document}
        />

        <SelectLabel
          id="occupation"
          label="Qualificação"
          options={occupationOptions}
          placeholder="Selecione"
          value={payload.occupation}
          setState={setPayload}
          errorExternal={errors?.occupation}
        />
      </div>

      <Input
        id="name"
        label="Nome Completo"
        value={payload.name}
        setState={setPayload}
        placeholder="Digite o nome completo"
        floating={false}
        suffix={<UserIcon className="w-5 h-5 stroke-gray" />}
        errorExternal={errors.name}
      />

      <Input
        id="percentage"
        label="Percentual de Participação"
        value={payload.percentage}
        maskType={"percentage"}
        setState={setPayload}
        placeholder="0,00"
        floating={false}
        suffix={<span className="font-lg stroke-gray">%</span>}
        errorExternal={errors.percentage}
      />

      <CheckboxLabel
        id="representative"
        label="Representante Legal"
        value={payload.representative}
        setState={setPayload}
      />

      <h2 className="text-neutral mb-3 mt-6">Endereço</h2>
      <Address
        addresses={payload.addresses}
        onChange={(next: any) => setPayload((prev) => ({...prev, addresses: next}))}
      />

      <h2 className="text-neutral mb-3 mt-4">Documentos</h2>

      <div className="mt-6">
        <Button
          type="submit"
          color="primary"
          fullWidth
          disabled={pending}
          loading={pending}
        >
          {pending ? 'Salvando...' : 'Salvar Sócio'}
        </Button>
      </div>
    </form>
  );
}

