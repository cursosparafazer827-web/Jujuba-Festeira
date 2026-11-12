import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const next = requestedNext === "/admin/reset-password" ? requestedNext : "/admin/login";

  if (!code) redirect("/admin/forgot-password?error=link");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) redirect("/admin/forgot-password?error=link");
  redirect(next);
}