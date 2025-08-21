// src/utils/onboarding-steps.ts (shared: pode ser importado por client e server)
export type OnboardingStep = 'WAITING_CLIENT_REGISTRATION' | 'WAITING_MEMBERS' | string;

export function pathForStep(id: string, step?: OnboardingStep) {
    switch (step) {
        case 'WAITING_CLIENT_REGISTRATION':
            return `/${id}/organization`;
        case 'WAITING_MEMBERS':
            return `/${id}/partners`;
        default:
            return null;
    }
}
