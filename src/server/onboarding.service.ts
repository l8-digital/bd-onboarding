import 'server-only';
import api from '@/lib/api.server';
import { cache } from 'react';
import { authApi } from '@/lib/urlApi';
import { MemberNode } from '@/types/Members'

export type ApiEmail = { email: string };

export type ApiAddressRaw = {
    city_id: number;
    zipcode: string;
    line: string;
    building_number: string | number;
    neighborhood: string;
    complement: string | null;
    city_name: string;
    state_uf: string;
};

export type ExtraInfo = {
    addresses?: ApiAddressRaw[];
    fantasy_name?: string;
    number_of_employees?: number;
    payroll?: number;
};

type LinkClient = {
    document?: string;
    email?: string;
    name?: string;
    phone?: string;
};


export interface OnboardingLinkApi {
    step?: 'WAITING_CLIENT_REGISTRATION' | 'WAITING_MEMBERS' | string;
    link?: string;
    business_document?: string;
    business_name?: string;
    business_phone?: string;
    business_email?: string;
    extra_information?: ExtraInfo;
    email?: ApiEmail[];
    client?: LinkClient;
    members?: MemberNode[];
}

export interface OnboardingLinkWithAddress0 extends OnboardingLinkApi {
    address0?: ApiAddressRaw | null;
}

export const getOnboardingLink = cache(
    async (id: string): Promise<OnboardingLinkWithAddress0> => {
        const { data } = await api.get(`${authApi}/v1/client/link/fetch/${id}`);
        const link = data?.data?.link as OnboardingLinkApi;
        return { ...link };
    }
);

export function pathForStep(id: string, step?: string) {
    switch (step) {
        case 'WAITING_CLIENT_REGISTRATION':
            return `/${id}/organization`;
        case 'WAITING_MEMBERS':
            return `/${id}/partners`;
        default:
            return null;
    }
}
