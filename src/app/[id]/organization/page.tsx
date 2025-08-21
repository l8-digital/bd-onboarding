import OrganizationPageClient from './OrganizationPageClient';
import {getOnboardingLink, pathForStep} from '@/server/onboarding.service';
import {redirect} from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
    const link = await getOnboardingLink(params.id);

    const target = pathForStep(params.id, link.step);
    const current = `/${params.id}/organization`;
    if (target && target !== current) redirect(target);

    return <OrganizationPageClient link={link} />;
}