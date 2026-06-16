import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;

export async function getSessionProfile(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? null, profile: profile ?? null };
}

export async function requireProfile(): Promise<{ userId: string; email: string | null; profile: Profile }> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!session.profile) redirect("/onboarding");
  return { userId: session.userId, email: session.email, profile: session.profile };
}
