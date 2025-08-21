import PartnersPageClient from './PartnersPageClient';
import { redirect } from 'next/navigation';
import { getOnboardingLink, pathForStep } from '@/server/onboarding.service';

export default async function Page({ params }: { params: { id: string } }) {
    const link = await getOnboardingLink(params.id);

    const target = pathForStep(params.id, link.step);
    const current = `/${params.id}/partners`;
    if (target && target !== current) redirect(target);

    return <PartnersPageClient link={link} />;
}