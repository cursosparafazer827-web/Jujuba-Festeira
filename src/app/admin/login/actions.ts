"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export async function loginAction(formData:FormData){
 const email=String(formData.get("email")||"").trim(); const password=String(formData.get("password")||"");
 if(!email||!password) redirect("/admin/login?error=missing");
 const supabase=await createClient();
 const {error}=await supabase.auth.signInWithPassword({email,password});
 if(error) redirect("/admin/login?error=credentials");
 const {data:claimsData}=await supabase.auth.getClaims(); const userId=claimsData?.claims?.sub;
 if(!userId){await supabase.auth.signOut();redirect("/admin/login?error=unauthorized");}
 const {data:admin}=await supabase.from("admin_users").select("user_id").eq("user_id",userId).eq("is_active",true).maybeSingle();
 if(!admin){await supabase.auth.signOut();redirect("/admin/login?error=unauthorized");}
 redirect("/admin");
}