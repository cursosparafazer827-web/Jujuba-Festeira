"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateAdminPassword(formData: FormData) {
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirmation") || "");

  if (password.length < 10) redirect("/admin/reset-password?error=short");
  if (password !== confirmation) redirect("/admin/reset-password?error=mismatch");

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) redirect("/admin/forgot-password?error=link");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/admin/reset-password?error=update");

  await supabase.auth.signOut();
  redirect("/admin/login?message=updated");
}