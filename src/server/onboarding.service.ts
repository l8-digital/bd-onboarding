import api from '@/lib/api.server';
import { cache } from 'react';

interface OnboardingLink {
    organization?: {
        document: string;
        social_name: string;
        fantasy_name: string | null;
        phone: string;
        email: string;
        addresses?: any[];
    };
}

export const getOnboardingLink = cache(async (id: string): Promise<OnboardingLink> => {
    const { data } = await api.get(`/onboarding/${id}`);
    return data as OnboardingLink;
});
