"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string } | null;

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/");
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "patient");
  const ageRaw = String(formData.get("age") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();

  if (!email || !password || !name) {
    return { error: "Name, email and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (role !== "patient" && role !== "doctor") {
    return { error: "Invalid role." };
  }

  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (signUpError) return { error: signUpError.message };

  // Email confirmation is auto-applied at the DB level, but GoTrue still returns no
  // session on sign-up, so establish one explicitly.
  if (!signUpData.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) return { error: signInError.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Could not establish a session. Please try logging in." };

  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: user.id,
    role,
    name,
    age: role === "patient" && ageRaw ? Number(ageRaw) : null,
    gender: role === "patient" && gender ? gender : null,
  });
  if (profileError) return { error: profileError.message };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function createProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "patient");
  const ageRaw = String(formData.get("age") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (role !== "patient" && role !== "doctor") return { error: "Invalid role." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    role,
    name,
    age: role === "patient" && ageRaw ? Number(ageRaw) : null,
    gender: role === "patient" && gender ? gender : null,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
