// ModalPaticipants.tsx
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
  clientId: string; // <- adicione isso
};

function mapMemberToPF(data?: Partial<MemberNode>) {
  return {
    id: data?.id ?? '',                         // importante p/ PUT
    document: data?.details?.document ?? '',
    name: data?.details?.name ?? '',
    percentage: data?.participation_percentage ?? '',
    representative: data?.type === 'LEGAL_REPRESENTATIVE',
  };
}

function mapMemberToPJ(data?: Partial<MemberNode>) {
  return {
    id: data?.id ?? '',                         // importante p/ PUT
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
                                                             clientId,
                                                           }) => {
  const activeType: 'PERSON' | 'BUSINESS' = (initialData?.member_type as any) ?? 'PERSON';
  const [activeTab, setActiveTab] = React.useState<'PERSON' | 'BUSINESS'>(activeType);

  const onTabClick = (tab: 'PERSON' | 'BUSINESS') => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (lockType) return;
    setActiveTab(tab);
  };

  const isActive = (tab: 'PERSON' | 'BUSINESS') => activeTab === tab;

  // O pai só precisa fechar/atualizar quando o filho terminar:
  const handleSavedFromChild = (saved: MemberNode) => {
    onSaved?.(saved);
    onClose();
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
                  <>
                    <div className={isActive('PERSON') ? '' : 'hidden'}>
                      <FormPF
                          clientId={clientId}
                          initialValues={undefined}
                          onSaved={handleSavedFromChild} // <- o filho chama quando terminar
                      />
                    </div>
                    <div className={isActive('BUSINESS') ? '' : 'hidden'}>
                      <FormPJ
                          clientId={clientId}
                          initialValues={undefined}
                          onSaved={handleSavedFromChild}
                      />
                    </div>
                  </>
              )}

              {mode === 'edit' && activeType === 'PERSON' && (
                  <FormPF
                      clientId={clientId}
                      initialValues={mapMemberToPF(initialData)}
                      readOnlyType
                      onSaved={handleSavedFromChild}
                  />
              )}

              {mode === 'edit' && activeType === 'BUSINESS' && (
                  <FormPJ
                      clientId={clientId}
                      initialValues={mapMemberToPJ(initialData)}
                      readOnlyType
                      onSaved={handleSavedFromChild}
                  />
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ModalPaticipants;
