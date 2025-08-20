import StepNav from '@/components/StepNav';
import { OnboardingServerProvider } from '@/contexts/OnboardingServerContext';
import { getOnboardingLink } from '@/server/onboarding.service';
import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    params: { id: string };
}

export default async function OnboardingLayout({ children, params }: LayoutProps) {
    const data = await getOnboardingLink(params.id);
    return (
        <OnboardingServerProvider value={data}>
            <StepNav />
            {children}
        </OnboardingServerProvider>
    );
}
