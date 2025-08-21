export type UUID = string;
export type MemberType = 'BUSINESS' | 'PERSON';

// Detalhes mínimos presentes no seu exemplo (podem vir mais campos)
export interface MemberDetails {
    id: UUID;
    name: string;
    document: string; // CNPJ/CPF em string
    [k: string]: unknown; // tolera campos extras
}

// Se não conhece o shape dos documentos, mantenha genérico:
export type RequiredDoc = Record<string, unknown>;
export type SubmittedDoc = Record<string, unknown>;

// Nó recursivo de membro/sócio
export interface MemberNode {
    id: UUID;
    level: number;                        // ex.: 1
    member_type: MemberType;              // 'BUSINESS' | 'PERSON'
    associate: boolean;                   // ex.: true
    details: MemberDetails;               // { id, name, document, ... }
    participation_percentage: `${number}`;// ex.: "70.00" (string numérica)
    parent_business_id?: UUID | null;     // ex.: "609a6b42-..."; pode ser null/undefined
    required_documents: RequiredDoc[];    // []
    submitted_documents: SubmittedDoc[];  // [{}]
    type: string | null;                  // se a API envia null
    members: MemberNode[];                // filhos (recursivo)
}

export function hasLegalRepresentative(
    nodes: MemberNode[] | MemberNode | null | undefined
): boolean {
    if (!nodes) return false;
    const arr = Array.isArray(nodes) ? nodes : [nodes];

    return arr.some((m) =>
        m?.type === 'LEGAL_REPRESENTATIVE' ||
        (m?.members?.length ? hasLegalRepresentative(m.members) : false)
    );
}

// Helpers (narrowing) opcionais
export const isBusiness = (m: MemberNode): m is MemberNode =>
    m.member_type === 'BUSINESS';
export const isPerson = (m: MemberNode): m is MemberNode =>
    m.member_type === 'PERSON';