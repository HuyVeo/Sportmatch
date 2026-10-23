import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getSports } from "@/lib/data/sports";
import { getCurrentUser } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Bắt đầu · SportMatch",
};

export default async function OnboardingPage() {
  const [user, sports] = await Promise.all([getCurrentUser(), getSports()]);

  return (
    <OnboardingWizard
      sportOptions={sports}
      initialPhotoUrl={user.avatarUrl}
    />
  );
}
