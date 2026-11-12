import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateAdminPassword } from "./actions";

export default async function ResetPassword({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const {error}=await searchParams;
  const supabase=await createClient();
  const {data:claimsData}=await supabase.auth.getClaims();
  const userId=claimsData?.claims?.sub;
  if(!userId) redirect("/admin/forgot-password?error=link");
  const {data:admin}=await supabase.from("admin_users").select("user_id").eq("user_id",userId).eq("is_active",true).maybeSingle();
  if(!admin) redirect("/admin/login?error=unauthorized");

  const errors:Record<string,string>={short:"A palavra-passe deve ter pelo menos 10 caracteres.",mismatch:"As palavras-passe não coincidem.",update:"Não foi possível atualizar a palavra-passe. Solicite um novo link."};
  return <main className="container flex min-h-screen items-center justify-center py-12"><section className="panel w-full max-w-md">
    <Link href="/admin/login" className="font-bold text-berry">← Jujuba Festeira</Link>
    <h1 className="mt-6 text-3xl font-black">Criar nova palavra-passe</h1>
    <p className="muted mt-2">Escolha uma palavra-passe forte com pelo menos 10 caracteres.</p>
    {error?<p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors[error]||"Não foi possível concluir a recuperação."}</p>:null}
    <form action={updateAdminPassword} className="mt-6"><label className="field">Nova palavra-passe<input type="password" name="password" required minLength={10} autoComplete="new-password"/></label><label className="field">Confirmar palavra-passe<input type="password" name="confirmation" required minLength={10} autoComplete="new-password"/></label><button className="btn mt-4 w-full" type="submit">Guardar nova palavra-passe</button></form>
  </section></main>;
}