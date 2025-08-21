'use client';

import React from 'react';
import {ArrowLeftIcon, BuildingOffice2Icon, UserIcon} from '@heroicons/react/24/outline';
import FormPF from './FormPF';
import FormPJ from './FormPJ';
import {MemberNode} from '@/types/Members';

export type ModalPaticipantsProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: Partial<MemberNode>;
  lockType?: boolean;
  onClose: () => void;
  onSaved?: (saved: MemberNode) => void;
};

function mapMemberToPF(data?: Partial<MemberNode>) {
  return {
    document: data?.details?.document ?? '',
    name: data?.details?.name ?? '',
    percentage: data?.participation_percentage ?? '',
    representative: data?.type === 'LEGAL_REPRESENTATIVE',
  };
}

function mapMemberToPJ(data?: Partial<MemberNode>) {
  return {
    corporate_name: data?.details?.name ?? '',
    cnpj: data?.details?.document ?? '',
    percentage: data?.participation_percentage ?? '',
  };
}

const ModalPaticipants: React.FC<ModalPaticipantsProps> = ({
  open,
  mode,
  initialData,
  lockType,
  onClose,
  onSaved,
}) => {
  const activeType: 'PERSON' | 'BUSINESS' = (initialData?.member_type as any) ?? 'PERSON';
  const [activeTab, setActiveTab] = React.useState<'PERSON' | 'BUSINESS'>(activeType);

  const onTabClick = (tab: 'PERSON' | 'BUSINESS') => (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (lockType) return;
    setActiveTab(tab);
  };

  const isActive = (tab: 'PERSON' | 'BUSINESS') => activeTab === tab;

  const handleSaved = (values: any) => {
    if (!onSaved) return;
    const currentType = mode === 'edit' ? activeType : activeTab;
    const base: MemberNode = {
      id: initialData?.id || '',
      level: initialData?.level ?? 1,
      member_type: currentType,
      associate: initialData?.associate ?? false,
      details: initialData?.details ?? {id: '', name: '', document: ''},
      participation_percentage: initialData?.participation_percentage ?? '',
      parent_business_id: initialData?.parent_business_id,
      required_documents: initialData?.required_documents ?? [],
      submitted_documents: initialData?.submitted_documents ?? [],
      type: initialData?.type ?? null,
      members: initialData?.members ?? [],
    };

    if (currentType === 'PERSON') {
      base.details = {
        ...(base.details || {}),
        name: values.name,
        document: values.document,
      };
      base.participation_percentage = values.percentage ?? base.participation_percentage;
      base.type = values.representative ? 'LEGAL_REPRESENTATIVE' : base.type;
    } else {
      base.details = {
        ...(base.details || {}),
        name: values.corporate_name,
        document: values.cnpj,
      };
      base.participation_percentage = values.percentage ?? base.participation_percentage;
    }

    onSaved(base);
  };

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
              <ArrowLeftIcon className="h-4 w-4 stroke-neutral" />
            </button>
          </div>

          <h2 className="flex-1 text-center font-bold">
            {mode === 'edit' ? 'Editar Participante' : 'Adicionar Participante'}
          </h2>

          <div className="w-2/12" />
        </div>

        <div className="w-full flex-1 bg-white border border-gray/10 shadow-lg px-4 rounded-t-2xl">
          <div className="w-full max-w-xl mx-auto">
            {mode === 'create' && (
              <div className="w-full">
                <div className="relative right-0">
                  <ul
                    className="relative flex flex-wrap px-1.5 list-none rounded-md bg-slate-100"
                    role="list"
                  >
                    <li className="z-30 flex-auto text-center">
                      <a
                        className={`z-30 flex items-center justify-center gap-2 border-t-2 w-full px-0 text-[15px] py-2 transition-all ease-in-out cursor-pointer ${
                          isActive('PERSON')
                            ? 'border-primary text-slate-900'
                            : 'border-transparent text-slate-600'
                        }`}
                        role="tab"
                        aria-selected={isActive('PERSON')}
                        onClick={onTabClick('PERSON')}
                      >
                        <UserIcon
                          className={`w-4 h-4 ${
                            isActive('PERSON')
                              ? 'stroke-primary'
                              : 'stroke-neutral'
                          }`}
                        />
                        Pessoa Física
                      </a>
                    </li>
                    <li className="z-30 flex-auto text-center">
                      <a
                        className={`z-30 flex items-center justify-center gap-2 border-t-2 w-full px-0 text-[15px] py-2 transition-all ease-in-out cursor-pointer ${
                          isActive('BUSINESS')
                            ? 'border-primary text-slate-900'
                            : 'border-transparent text-slate-600'
                        }`}
                        role="tab"
                        aria-selected={isActive('BUSINESS')}
                        onClick={onTabClick('BUSINESS')}
                      >
                        <BuildingOffice2Icon
                          className={`w-4 h-4 ${
                            isActive('BUSINESS')
                              ? 'stroke-primary'
                              : 'stroke-neutral'
                          }`}
                        />
                        Pessoa Jurídica
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {mode === 'create' && (
              <>
                <div className={isActive('PERSON') ? '' : 'hidden'}>
                  <FormPF onSubmit={handleSaved} />
                </div>
                <div className={isActive('BUSINESS') ? '' : 'hidden'}>
                  <FormPJ onSubmit={handleSaved} />
                </div>
              </>
            )}

            {mode === 'edit' && activeType === 'PERSON' && (
              <FormPF
                initialValues={mapMemberToPF(initialData)}
                readOnlyType
                onSubmit={handleSaved}
              />
            )}

            {mode === 'edit' && activeType === 'BUSINESS' && (
              <FormPJ
                initialValues={mapMemberToPJ(initialData)}
                readOnlyType
                onSubmit={handleSaved}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPaticipants;

