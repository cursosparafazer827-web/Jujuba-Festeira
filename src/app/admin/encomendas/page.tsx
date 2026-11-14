import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createOrder, updateOrderStatus } from "./actions";

export const dynamic="force-dynamic";
const statuses=["Pendente","Confirmada","Em produção","Concluída","Entregue","Cancelada"] as const;
type ProductOption={id:string;name:string};
type OrderRecord={id:string;order_number:number;customer_name:string;customer_phone:string;product_name:string;variant_name:string|null;quantity:number;unit_price_cents:number;total_price_cents:number;customizations:{details?:string}|null;notes:string|null;status:(typeof statuses)[number];order_date:string};
const money=(cents:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);

export default async function OrdersPage({searchParams}:{searchParams:Promise<{saved?:string;updated?:string;error?:string;status?:string;q?:string}>}){
 const {supabase}=await requireAdmin();
 const params=await searchParams;
 const selectedStatus=statuses.includes(params.status as (typeof statuses)[number])?params.status as (typeof statuses)[number]:"";
 const searchTerm=(params.q||"").trim().replace(/[,.()\\\\%_*]/g," ").replace(/\s+/g," ").slice(0,80);
 let ordersQuery=supabase.from("orders").select("*");
 if(selectedStatus) ordersQuery=ordersQuery.eq("status",selectedStatus);
 if(searchTerm){
  const safeTerm=searchTerm.replace(/[%_]/g,"");
  const filters=[`customer_name.ilike.%${safeTerm}%`,`customer_phone.ilike.%${safeTerm}%`];
  if(/^\d+$/.test(safeTerm)) filters.push(`order_number.eq.${safeTerm}`);
  ordersQuery=ordersQuery.or(filters.join(","));
 }
 const [{data:orders,error:ordersError},{data:products,error:productsError}]=await Promise.all([
  ordersQuery.order("order_date",{ascending:false}).limit(100),
  supabase.from("products").select("id,name").order("name")
 ]);
 const errorMessage=params.error==="invalid"?"Verifique os dados da encomenda e tente novamente.":params.error==="save"?"Não foi possível registar a encomenda. Tente novamente.":params.error==="status"?"Não foi possível atualizar o estado da encomenda.":ordersError?"Não foi possível carregar as encomendas.":productsError?"Não foi possível carregar os produtos.":null;
 return <main className="container py-10">
  <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
   <div><Link href="/admin" className="text-sm font-bold text-berry">← Painel administrativo</Link><h1 className="mt-2 text-3xl font-black">Gestão de encomendas</h1><p className="muted mt-1">Regista os pedidos recebidos pelo WhatsApp e acompanha cada etapa.</p></div>
   <span className="pill">{orders?.length||0} encomendas recentes</span>
  </header>
  {params.saved?<p className="mb-4 rounded-xl bg-green-50 p-3 text-green-800">Encomenda registada com sucesso.</p>:null}
  {params.updated?<p className="mb-4 rounded-xl bg-green-50 p-3 text-green-800">Estado da encomenda atualizado.</p>:null}
  {errorMessage?<p className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{errorMessage}</p>:null}
  <details className="panel mb-8 group">
   <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
    <span><span className="block text-xl font-black">＋ Registar nova encomenda</span><span className="muted mt-1 block text-sm">Abre este formulário quando precisares de registar um pedido recebido pelo WhatsApp.</span></span>
    <span className="btn btn-light">Abrir formulário</span>
   </summary>
   <form action={createOrder} className="mt-4 grid gap-3 border-t border-pink-100 pt-4 sm:grid-cols-2">
    <label className="field">Nome do cliente<input name="customer_name" required maxLength={120}/></label>
    <label className="field">Telefone / WhatsApp<input name="customer_phone" required maxLength={40} placeholder="+55..."/></label>
    <label className="field">Produto<select name="product_id" required defaultValue=""><option value="" disabled>Escolhe um produto</option>{products?.map((p:ProductOption)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <label className="field">Variante / opção<input name="variant_name" maxLength={120} placeholder="Ex.: 20 peças"/></label>
    <label className="field">Quantidade<input name="quantity" type="number" min="1" max="10000" defaultValue="1" required/></label>
    <label className="field">Preço unitário (R$)<input name="unit_price" type="number" min="0" max="1000000" step="0.01" required/></label>
    <label className="field sm:col-span-2">Personalizações escolhidas<textarea name="customizations" rows={3} placeholder={"Tema: Safari\\nNome: Maria\\nIdade: 5 anos\\nCor: Rosa"}/></label>
    <label className="field sm:col-span-2">Observações internas<textarea name="notes" rows={2} placeholder="Prazo combinado, entrega, sinal, etc."/></label>
    <p className="muted text-xs sm:col-span-2">O valor total é calculado automaticamente a partir do preço unitário × quantidade.</p>
    <button className="btn sm:col-span-2">Registar encomenda</button>
   </form>
  </details>
  <details className="panel group">
   <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
    <span><span className="block text-xl font-black">Encomendas recebidas</span><span className="muted mt-1 block text-sm">{orders?.length||0} encomendas recentes. Abre para pesquisar, filtrar e gerir os pedidos.</span></span>
    <span className="btn btn-light">Mostrar encomendas</span>
   </summary>
   <div className="mt-5 border-t border-pink-100 pt-4">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black">Lista de encomendas</h2><span className="pill">{orders?.length||0} {selectedStatus?"encomendas neste estado":"encomendas recentes"}</span></div>
    <form method="get" className="mb-4 flex flex-wrap items-end gap-2 rounded-xl bg-pink-50/60 p-3">
     {selectedStatus?<input type="hidden" name="status" value={selectedStatus}/>:null}
     <label className="field min-w-48 flex-1">Pesquisar encomenda<input name="q" type="search" maxLength={80} defaultValue={searchTerm} placeholder="Nome, número ou telefone"/></label>
     <button className="btn btn-light" type="submit">Pesquisar</button>
     {searchTerm?<Link href={selectedStatus?`/admin/encomendas?status=${encodeURIComponent(selectedStatus)}`:"/admin/encomendas"} className="btn btn-light">Limpar pesquisa</Link>:null}
    </form>
    <nav aria-label="Filtrar encomendas por estado" className="mb-5 flex flex-wrap gap-2 rounded-xl bg-pink-50/60 p-3">
     <Link href={searchTerm?`/admin/encomendas?q=${encodeURIComponent(searchTerm)}`:"/admin/encomendas"} aria-current={!selectedStatus?"page":undefined} className={!selectedStatus?"btn":"btn btn-light"}>Todas</Link>
     {statuses.map(status=>{
      const labels:Record<(typeof statuses)[number],string>={"Pendente":"Pendentes","Confirmada":"Confirmadas","Em produção":"Em produção","Concluída":"Concluídas","Entregue":"Entregues","Cancelada":"Canceladas"};
      const active=selectedStatus===status;
      return <Link key={status} href={`/admin/encomendas?status=${encodeURIComponent(status)}${searchTerm?`&q=${encodeURIComponent(searchTerm)}`:""}`} aria-current={active?"page":undefined} className={active?"btn":"btn btn-light"}>{labels[status]}</Link>;
     })}
    </nav>
    <div className="grid gap-4">
     {orders?.map((order:OrderRecord)=><article key={order.id} className="rounded-xl border border-pink-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">Encomenda #{order.order_number} · {order.customer_name}</h3><p className="muted mt-1 text-xs">{new Date(order.order_date).toLocaleString("pt-BR")}</p><p className="mt-2 text-sm">{order.product_name}{order.variant_name?" · "+order.variant_name:""} · {order.quantity} un.</p><p className="mt-1 font-black text-berry">{money(order.total_price_cents)}</p></div><a className="btn btn-light text-xs" href={"https://wa.me/"+String(order.customer_phone).replace(/\D/g,"")} target="_blank" rel="noreferrer">Abrir WhatsApp</a></div>
      <div className="mt-3 grid gap-1 text-sm"><p><strong>Telefone:</strong> {order.customer_phone}</p>{order.customizations?.details?<p className="whitespace-pre-line"><strong>Personalizações:</strong> {order.customizations.details}</p>:null}{order.notes?<p className="whitespace-pre-line"><strong>Observações:</strong> {order.notes}</p>:null}</div>
      <form action={updateOrderStatus} className="mt-4 flex flex-wrap items-end gap-2 border-t border-pink-100 pt-3"><input type="hidden" name="id" value={order.id}/><label className="field min-w-48 flex-1">Estado da encomenda<select name="status" defaultValue={order.status}>{statuses.map(status=><option key={status} value={status}>{status}</option>)}</select></label><button className="btn btn-light">Atualizar estado</button></form>
     </article>)}
     {!orders?.length?<p className="muted">{searchTerm?"Não foram encontradas encomendas para esta pesquisa.":selectedStatus?"Não existem encomendas com este estado.":"Ainda não existem encomendas registadas."}</p>:null}
    </div>
   </div>
  </details>
 </main>;
}
