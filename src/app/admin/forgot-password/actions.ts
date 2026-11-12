"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/admin/forgot-password?error=email");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://jujuba-festeira.vercel.app/auth/callback?next=%2Fadmin%2Freset-password",
  });

  if (error) redirect("/admin/forgot-password?error=send");
  redirect("/admin/forgot-password?sent=1");
}