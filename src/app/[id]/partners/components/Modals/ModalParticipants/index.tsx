// ModalPaticipants.tsx
'use client';

import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import FormParticipant from './FormParticipant';
import { MemberNode } from '@/types/Members';

export type ModalPaticipantsProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: Partial<MemberNode>;
  lockType?: boolean;
  onClose: () => void;
  onSaved?: (saved: MemberNode) => void;
  clientId: string; // <- adicione isso
  targetLevel: number;
  parentBusinessId?: string;
  maxAllowedPercentage: number; // NOVO
  requiredDocuments?: {
    business?: Record<string, Array<{ id: string }>>;
    person?: Record<string, Array<{ id: string }>>;
  };
};

const ModalPaticipants: React.FC<ModalPaticipantsProps> = ({
  open,
  mode,
  initialData,
  lockType,
  onClose,
  onSaved,
  clientId,
  targetLevel,
  parentBusinessId,
  maxAllowedPercentage,
  requiredDocuments,
}) => {
  const handleSavedFromChild = (saved: MemberNode) => {
    onSaved?.(saved);
    onClose();
  };

  if (!open) return null;

  const initialValues = initialData
    ? {
        id: initialData.id,
        name: initialData.details?.name,
        document: initialData.details?.document,
        percentage: initialData.participation_percentage,
        representative: initialData.type === 'LEGAL_REPRESENTATIVE',
        member_type: initialData.member_type as 'PERSON' | 'BUSINESS',
        level: initialData.level,
        parent_business_id: initialData.parent_business_id ?? null,
        submitted_documents: initialData.submitted_documents ?? [],
      }
    : undefined;

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
              <FormParticipant
                clientId={clientId}
                level={targetLevel}
                parentBusinessId={parentBusinessId}
                mode="create"
                readOnlyType={lockType}
                maxAllowedPercentage={maxAllowedPercentage}
                requiredDocuments={requiredDocuments}
                onSaved={handleSavedFromChild}
              />
            )}

            {mode === 'edit' && (
              <FormParticipant
                clientId={clientId}
                level={initialData?.level}
                parentBusinessId={initialData?.parent_business_id ?? undefined}
                mode="edit"
                readOnlyType
                initialValues={initialValues}
                maxAllowedPercentage={maxAllowedPercentage}
                requiredDocuments={requiredDocuments}
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
