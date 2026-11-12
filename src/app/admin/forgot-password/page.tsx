import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default async function ForgotPassword({searchParams}:{searchParams:Promise<{error?:string;sent?:string}>}) {
  const {error,sent}=await searchParams;
  return <main className="container flex min-h-screen items-center justify-center py-12"><section className="panel w-full max-w-md">
    <Link href="/admin/login" className="font-bold text-berry">← Voltar ao login</Link>
    <h1 className="mt-6 text-3xl font-black">Recuperar palavra-passe</h1>
    <p className="muted mt-2">Indique o e-mail da conta de administração. Se existir uma conta associada, enviaremos um link para criar uma nova palavra-passe.</p>
    {sent==="1"?<p role="status" className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-800">Pedido processado. Se o endereço estiver registado, receberá um e-mail com as instruções. Verifique também a pasta de spam.</p>:null}
    {error?<p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error==="email"?"Introduza um endereço de e-mail válido.":"Não foi possível processar o pedido. Tente novamente mais tarde."}</p>:null}
    <form action={requestPasswordReset} className="mt-6"><label className="field">E-mail<input type="email" name="email" required autoComplete="email" placeholder="o-seu@email.com"/></label><button className="btn mt-4 w-full" type="submit">Enviar link de recuperação</button></form>
  </section></main>;
}