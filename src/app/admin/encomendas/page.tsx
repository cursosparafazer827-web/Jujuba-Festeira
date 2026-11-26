import Link from "next/link";
import AdminShell from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { createOrder, updateOrder, updateOrderStatus } from "./actions";
import { OrderPrintButton } from "@/components/admin/order-print-button";

export const dynamic="force-dynamic";
const statuses=["Pendente","Confirmada","Em produção","Concluída","Entregue","Cancelada"] as const;
type ProductOption={id:string;name:string};
type OrderRecord={id:string;order_number:number;customer_name:string;customer_phone:string;product_name:string;variant_name:string|null;quantity:number;unit_price_cents:number;total_price_cents:number;customizations:{details?:string}|null;notes:string|null;status:(typeof statuses)[number];order_date:string};
const money=(cents:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);

export default async function OrdersPage({searchParams}:{searchParams:Promise<{saved?:string;updated?:string;edited?:string;error?:string;status?:string;q?:string;section?:string}>}){
 const {supabase}=await requireAdmin();
 const params=await searchParams;
 const section=params.section||"";
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
 const errorMessage=params.error==="invalid"?"Verifique os dados da encomenda e tente novamente.":params.error==="save"?"Não foi possível registar a encomenda. Tente novamente.":params.error==="status"?"Não foi possível atualizar o estado da encomenda.":params.error==="edit"?"Não foi possível editar a encomenda. Verifique os dados e tente novamente.":ordersError?"Não foi possível carregar as encomendas.":productsError?"Não foi possível carregar os produtos.":null;
 return <AdminShell active="orders"><main className="container py-8">
  <header className="mb-8 space-y-4">
   <div className="flex flex-wrap items-start justify-between gap-4">
    <div><Link href="/admin" className="text-sm font-bold text-berry">← Painel administrativo</Link><h1 className="mt-2 text-3xl font-black">Gestão de encomendas</h1><p className="muted mt-1">Regista os pedidos recebidos pelo WhatsApp e acompanha cada etapa.</p></div>
    <span className="pill">{orders?.length||0} encomendas recentes</span>
   </div>
  </header>
  {params.saved?<p className="mb-4 rounded-xl bg-green-50 p-3 text-green-800">Encomenda registada com sucesso.</p>:null}
  {params.updated?<p className="mb-4 rounded-xl bg-green-50 p-3 text-green-800">Estado da encomenda atualizado.</p>:null}
  {params.edited?<p className="mb-4 rounded-xl bg-green-50 p-3 text-green-800">Encomenda atualizada com sucesso.</p>:null}
  {errorMessage?<p className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{errorMessage}</p>:null}
  {section==="register"?  <details className="panel mb-8 group">
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
  </details>:section==="existing"?  <details className="panel group">
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
     {orders?.map((order:OrderRecord)=><article key={order.id} data-order-card={order.id} className="rounded-xl border border-pink-100 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
       <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
         <h3 className="font-black text-berry">Encomenda #{order.order_number}</h3>
         <span className={`rounded-full px-3 py-1 text-xs font-bold ${
          order.status==="Concluída"||order.status==="Entregue"?"bg-green-50 text-green-700":
          order.status==="Cancelada"?"bg-red-50 text-red-700":
          order.status==="Em produção"?"bg-purple-50 text-purple-700":
          order.status==="Confirmada"?"bg-blue-50 text-blue-700":"bg-amber-50 text-amber-800"
         }`}>{order.status}</span>
        </div>
        <p className="mt-2 break-words font-semibold">{order.customer_name}</p>
        <p className="muted mt-1 text-sm">{order.customer_phone}</p>
        <div className="mt-3 grid gap-2 rounded-xl bg-pink-50/60 p-3 text-sm sm:grid-cols-2">
         <p className="min-w-0 break-words"><span className="muted">Produto:</span> <strong>{order.product_name}</strong></p>
         <p><span className="muted">Opção:</span> <strong>{order.variant_name||"—"}</strong></p>
         <p><span className="muted">Quantidade:</span> <strong>{order.quantity} un.</strong></p>
         <p><span className="muted">Data:</span> <strong>{new Date(order.order_date).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})}</strong></p>
        </div>
       </div>
       <div className="shrink-0 rounded-xl border border-pink-100 bg-white px-4 py-3 sm:min-w-36 sm:text-right">
        <p className="muted text-xs font-semibold">Valor total</p>
        <p className="mt-1 text-xl font-black text-berry">{money(order.total_price_cents)}</p>
       </div>
      </div>
      <div className="print-only">
       <h1>Jujuba Festeira</h1>
       <h2>Resumo da encomenda #{order.order_number}</h2>
       <p><strong>Data:</strong> {new Date(order.order_date).toLocaleString("pt-BR")}</p>
       <p><strong>Cliente:</strong> {order.customer_name}</p>
       <p><strong>Telefone / WhatsApp:</strong> {order.customer_phone}</p>
       <p><strong>Produto:</strong> {order.product_name}</p>
       {order.variant_name?<p><strong>Variante:</strong> {order.variant_name}</p>:null}
       <p><strong>Quantidade:</strong> {order.quantity}</p>
       <p><strong>Preço unitário:</strong> {money(order.unit_price_cents)}</p>
       <p><strong>Valor total:</strong> {money(order.total_price_cents)}</p>
       <p><strong>Estado:</strong> {order.status}</p>
       {order.customizations?.details?<p className="print-pre"><strong>Personalizações:</strong>{"\n"}{order.customizations.details}</p>:null}
       {order.notes?<p className="print-pre"><strong>Observações:</strong>{"\n"}{order.notes}</p>:null}
      </div>
      <details className="mt-4 border-t border-pink-100 pt-3 group">
       <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-berry [&::-webkit-details-marker]:hidden">
        <span>Ver detalhes da encomenda</span>
        <span className="btn btn-light text-xs">Abrir detalhes</span>
       </summary>
       <div className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
         <p className="text-sm font-bold text-berry">Ficha completa da encomenda</p>
         <OrderPrintButton orderId={order.id}/>
        </div>
        <section className="grid gap-3 rounded-xl border border-pink-100 p-3 sm:grid-cols-2" aria-label="Dados da encomenda">
         <div>
          <h4 className="mb-2 text-sm font-black text-berry">Cliente</h4>
          <p className="break-words text-sm font-semibold">{order.customer_name}</p>
          <p className="muted mt-1 break-words text-sm">{order.customer_phone}</p>
          <a className="btn btn-light mt-3 text-xs" href={"https://wa.me/"+String(order.customer_phone).replace(/\\D/g,"")} target="_blank" rel="noreferrer">Abrir conversa no WhatsApp</a>
         </div>
         <div className="rounded-lg bg-pink-50/60 p-3">
          <h4 className="mb-2 text-sm font-black text-berry">Resumo financeiro</h4>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
           <dt className="muted">Preço unitário</dt><dd className="text-right font-semibold">{money(order.unit_price_cents)}</dd>
           <dt className="muted">Quantidade</dt><dd className="text-right font-semibold">{order.quantity} un.</dd>
           <dt className="muted">Total</dt><dd className="text-right font-black text-berry">{money(order.total_price_cents)}</dd>
          </dl>
         </div>
        </section>
        <section className="rounded-xl border border-pink-100 p-3">
         <h4 className="mb-2 text-sm font-black text-berry">Produto e opção</h4>
         <p className="text-sm"><strong>{order.product_name}</strong></p>
         <p className="muted mt-1 text-sm">Variante / opção: {order.variant_name||"—"}</p>
         <p className="muted mt-1 text-sm">Registada em: {new Date(order.order_date).toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})}</p>
        </section>
        <section className="rounded-xl border border-pink-100 p-3">
         <h4 className="mb-2 text-sm font-black text-berry">Personalizações escolhidas</h4>
         {order.customizations?.details?<p className="whitespace-pre-line break-words text-sm">{order.customizations.details}</p>:<p className="muted text-sm">Não foram registadas personalizações.</p>}
        </section>
        <section className="rounded-xl border border-pink-100 p-3">
         <h4 className="mb-2 text-sm font-black text-berry">Observações internas</h4>
         {order.notes?<p className="whitespace-pre-line break-words text-sm">{order.notes}</p>:<p className="muted text-sm">Sem observações internas.</p>}
        </section>
        <details className="rounded-xl bg-pink-50/60 p-3 group">
         <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold [&::-webkit-details-marker]:hidden">
          <span>Editar dados da encomenda</span>
          <span className="btn btn-light text-xs">Editar encomenda</span>
         </summary>
         <form action={updateOrder} className="mt-4 grid gap-3 border-t border-pink-100 pt-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={order.id}/>
          <label className="field">Nome do cliente<input name="customer_name" required maxLength={120} defaultValue={order.customer_name}/></label>
          <label className="field">Telefone / WhatsApp<input name="customer_phone" required maxLength={40} defaultValue={order.customer_phone}/></label>
          <label className="field sm:col-span-2">Produto<select name="product_id" required defaultValue={products?.find((product:ProductOption)=>product.name===order.product_name)?.id||""}><option value="" disabled>Escolhe um produto</option>{products?.map((product:ProductOption)=><option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label className="field">Variante / opção<input name="variant_name" maxLength={120} defaultValue={order.variant_name||""}/></label>
          <label className="field">Quantidade<input name="quantity" type="number" min="1" max="10000" required defaultValue={order.quantity}/></label>
          <label className="field">Preço unitário (R$)<input name="unit_price" type="number" min="0" max="1000000" step="0.01" required defaultValue={(order.unit_price_cents/100).toFixed(2)}/></label>
          <label className="field sm:col-span-2">Personalizações escolhidas<textarea name="customizations" rows={3} defaultValue={order.customizations?.details||""}/></label>
          <label className="field sm:col-span-2">Observações internas<textarea name="notes" rows={2} defaultValue={order.notes||""}/></label>
          <p className="muted text-xs sm:col-span-2">O valor total será recalculado automaticamente. O estado da encomenda não será alterado.</p>
          <button className="btn sm:col-span-2">Guardar alterações</button>
         </form>
        </details>
        <form action={updateOrderStatus} className="flex flex-wrap items-end gap-2 border-t border-pink-100 pt-4">
         <input type="hidden" name="id" value={order.id}/>
         <label className="field min-w-48 flex-1">Estado da encomenda<select name="status" defaultValue={order.status}>{statuses.map(status=><option key={status} value={status}>{status}</option>)}</select></label>
         <button className="btn btn-light">Atualizar estado</button>
        </form>
       </div>
      </details>
     </article>)}
     {!orders?.length?<p className="muted">{searchTerm?"Não foram encontradas encomendas para esta pesquisa.":selectedStatus?"Não existem encomendas com este estado.":"Ainda não existem encomendas registadas."}</p>:null}
    </div>
   </div>
  </details>
 </main></AdminShell>;
}
:<section className="panel"><p className="font-semibold text-berry">Escolhe uma opção em <strong>Gestão de encomendas</strong>, no menu lateral, para registar uma encomenda ou consultar as encomendas existentes.</p></section>}