'use client';

import React, { createContext, useContext } from 'react';
import { type Address } from '@/components/Modals/ModalAddress';

interface Organization {
    document: string;
    social_name: string;
    fantasy_name: string | null;
    phone: string;
    email: string;
    addresses?: Address[];
}

export interface OnboardingData {
    organization?: Organization;
}

const OnboardingServerContext = createContext<OnboardingData | null>(null);

interface ProviderProps {
    value: OnboardingData;
    children: React.ReactNode;
}

export function OnboardingServerProvider({ value, children }: ProviderProps) {
    return <OnboardingServerContext.Provider value={value}>{children}</OnboardingServerContext.Provider>;
}

export function useOnboarding() {
    const context = useContext(OnboardingServerContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingServerProvider');
    }
    return context;
}

