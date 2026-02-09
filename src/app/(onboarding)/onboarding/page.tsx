"use client";

import { useState } from "react";
import { Briefcase, PenTool, Users } from "lucide-react";
import Button from "@/components/ui/button";
import StepIndicator from "@/components/onboarding/step-indicator";
import RoleCard from "@/components/onboarding/role-card";

const roles = [
  {
    id: "send",
    icon: Briefcase,
    title: "Send agreements",
    description: "Create and send documents for signature",
  },
  {
    id: "sign",
    icon: PenTool,
    title: "Sign agreements",
    description: "Review and sign documents sent to you",
  },
  {
    id: "both",
    icon: Users,
    title: "Both",
    description: "Send and sign agreements",
  },
] as const;

export default function OnboardingRolePage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div>
      <StepIndicator currentStep={1} />

      <h1 className="text-2xl font-semibold text-foreground">
        How will you use SignOf?
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This helps us tailor your experience.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            icon={role.icon}
            title={role.title}
            description={role.description}
            selected={selectedRole === role.id}
            onClick={() => setSelectedRole(role.id)}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" disabled={!selectedRole}>
          Continue
        </Button>
      </div>
    </div>
  );
}
