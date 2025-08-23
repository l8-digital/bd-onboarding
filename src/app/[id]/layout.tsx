import StepNav from '@/components/StepNav';
import React from 'react';
import {
    getOnboardingLink, type OnboardingLinkApi,
} from '@/server/onboarding.service';

interface LayoutProps {
    children: React.ReactNode;
    params: { id: string };
}

export default async function OnboardingLayout({ children, params }: LayoutProps) {
    const link: OnboardingLinkApi = await getOnboardingLink(params.id);



    return (
        <>
            <StepNav />
            {React.isValidElement(children)
                ? React.cloneElement(
                    children as React.ReactElement<{ link?: OnboardingLinkApi }>,
                    { link }
                )
                : children}
        </>
    );
}
