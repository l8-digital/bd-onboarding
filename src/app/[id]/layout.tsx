'use client';

import StepNav from '@/components/StepNav';
// import { OnboardingProvider } from '@/contexts/OnboardingContext';
import React from 'react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
      // <OnboardingProvider>
      <>
          <StepNav />

          {children}
      </>
      // </OnboardingProvider>
  );
}