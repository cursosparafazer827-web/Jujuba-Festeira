import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (error || !userId) redirect("/admin/login");
  const { data: admin, error: adminError } = await supabase.from("admin_users").select("user_id,display_name,is_active").eq("user_id",userId).eq("is_active",true).maybeSingle();
  if (adminError || !admin) redirect("/admin/login?error=unauthorized");
  return { supabase, userId, admin };
}