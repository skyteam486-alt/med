import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export default async function OnboardingPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (session.profile) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4 py-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Finish your profile</CardTitle>
            <CardDescription>Tell us a little about yourself to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
