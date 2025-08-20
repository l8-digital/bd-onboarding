export type Option = { label: string; value: string };

export const occupationOptions: Option[] = [
    { value: 'representante-legal', label: 'Representante Legal' },
    { value: 'socio', label: 'Sócio(a)' },
    { value: 'socio-administrador', label: 'Sócio-Administrador(a)' },
    { value: 'socio-gerente', label: 'Sócio-Gerente' },
    { value: 'titular-empresa-individual', label: 'Titular (Empresa Individual)' },

    { value: 'administrador', label: 'Administrador(a)' },
    { value: 'diretor', label: 'Diretor(a)' },
    { value: 'presidente', label: 'Presidente' },
    { value: 'vice-presidente', label: 'Vice-Presidente' },

    { value: 'conselheiro-administracao', label: 'Conselheiro(a) de Administração' },
    { value: 'membro-conselho-fiscal', label: 'Membro do Conselho Fiscal' },

    { value: 'procurador', label: 'Procurador(a)' },
    { value: 'gerente', label: 'Gerente' },
    { value: 'tesoureiro', label: 'Tesoureiro(a)' },
    { value: 'secretario', label: 'Secretário(a)' },

    { value: 'liquidante', label: 'Liquidante' },
    { value: 'interventor', label: 'Interventor(a)' },
    { value: 'administrador-judicial', label: 'Administrador(a) Judicial' },

    { value: 'outro', label: 'Outro' },
];
