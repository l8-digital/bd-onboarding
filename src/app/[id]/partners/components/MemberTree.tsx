// components/Partners/MemberTree.tsx
'use client';

import React from 'react';
import {
    BuildingOffice2Icon,
    UserIcon,
    PencilIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import {Button} from "@/components/Button/Button";

export type MemberType = 'BUSINESS' | 'PERSON';

export interface MemberDetails {
    id: string;
    name: string;
    document: string;
}

export interface MemberNode {
    id: string;
    level: number;
    member_type: MemberType;           // 'BUSINESS' | 'PERSON'
    associate: boolean;                // true -> associada
    details: MemberDetails;            // { id, name, document }
    participation_percentage: string;  // "70.00"
    parent_business_id?: string | null;
    required_documents: any[];
    submitted_documents: any[];
    type: string | null;
    members: MemberNode[];             // filhos
}

type RowProps = {
    member: MemberNode;
    onEdit: (member: MemberNode) => void;
    onAddParticipant: (parentId: string, level: number) => void;
};

const formatPct = (p?: string | number) => {
    const n = typeof p === 'number' ? p : parseFloat(p || '0');
    return Number.isFinite(n) ? (Number.isInteger(n) ? `${n}%` : `${n.toFixed(2)}%`) : '0%';
};

function MemberRow({member, onEdit, onAddParticipant}: RowProps) {
    const isBusiness = member.member_type === 'BUSINESS';
    const Icon = isBusiness ? BuildingOffice2Icon : UserIcon;
    const entity = isBusiness ? 'Empresa' : 'Pessoa';
    const tag = member.associate ? 'associada' : 'participante';

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 stroke-blue"/>
                </div>
                <div>
                    <p className="font-medium leading-tight uppercase">
                        {member.details?.name || '—'}
                    </p>
                    <p className="text-xs text-gray">
                        {entity} {tag} • {formatPct(member.participation_percentage)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    color="gray"
                    size="sm"
                    iconLeft={<PencilIcon className="w-4 h-4 stroke-black"/>}
                    onClick={() => onEdit(member)}
                    iconOnly
                />

                {(member.level === 1) && (
                    <Button
                        type="button"
                        color="gray"
                        size="sm"
                        iconLeft={<PlusIcon className="w-4 h-4 stroke-black"/>}
                        onClick={() => onAddParticipant(member.id, member.level)}
                    >
                        Participante
                    </Button>
                )}
            </div>
        </div>
    );
}

type TreeProps = {
    members: MemberNode[];
    onEdit: (member: MemberNode) => void;
    onAddParticipant: (parentId: string, level: number) => void;
};

export default function MemberTree({members, onEdit, onAddParticipant}: TreeProps) {
    if (!members?.length) {
        return (
            <div className="text-sm text-slate-500">Nenhum participante cadastrado.</div>
        );
    }

    return (
        <div className="space-y-6">
            {members.map((m) => (
                <div key={m.id} className="py-3 space-y-2">
                    <MemberRow
                        member={m}
                        onEdit={onEdit}
                        onAddParticipant={onAddParticipant}
                    />

                    {m.members?.length > 0 && (
                        <div className="ml-4 pl-4 border-l border-gray/50 space-y-3">
                            <MemberTree
                                members={m.members}
                                onEdit={onEdit}
                                onAddParticipant={onAddParticipant}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
