"use client";

import Button from "@/components/ui/button";
import StepIndicator from "@/components/onboarding/step-indicator";
import InviteForm from "@/components/onboarding/invite-form";

export default function OnboardingInvitePage() {
  return (
    <div>
      <StepIndicator currentStep={2} />

      <h1 className="text-2xl font-semibold text-foreground">
        Invite your team
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add team members to collaborate on agreements.
      </p>

      <div className="mt-8">
        <InviteForm />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost">Skip for now</Button>
        <Button size="lg">Complete setup</Button>
      </div>
    </div>
  );
}
