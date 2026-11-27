"use client";

import Link from "next/link";
import { useState } from "react";

type Props = { active: "catalog" | "orders"; children: React.ReactNode };

export default function AdminShell({ active, children }: Props) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const sections = [
    { key: "catalog" as const, label: "Catálogo de produtos", icon: "▦", open: catalogOpen, toggle: () => setCatalogOpen(v => !v), items: [{ href: "/admin?section=add-product", label: "Adicionar produto" }, { href: "/admin?section=existing-products", label: "Ver produtos existentes" }] },
    { key: "orders" as const, label: "Gestão de encomendas", icon: "▤", open: ordersOpen, toggle: () => setOrdersOpen(v => !v), items: [{ href: "/admin/encomendas?section=register", label: "Registar encomenda" }, { href: "/admin/encomendas?section=existing", label: "Ver encomendas existentes" }] },
  ];
  return (
    <div className="admin-shell min-h-screen bg-[#f3f4f8] text-slate-800 md:flex">
      <aside className="admin-sidebar w-full shrink-0 bg-[#351078] text-white md:sticky md:top-0 md:flex md:h-screen md:w-[250px] md:flex-col">
        <div className="admin-sidebar-brand border-b border-white/10 px-6 py-6"><Link href="/admin" className="text-2xl font-black tracking-tight text-white">jujuba<span className="text-pink-300">.</span></Link><p className="mt-1 text-xs text-violet-200">PAINEL DE ADMINISTRAÇÃO</p></div>
        <div className="admin-sidebar-navigation px-5 py-5"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">Menu principal</p>
          <nav aria-label="Navegação administrativa" className="grid gap-2">
            {sections.map(section => {
              const selected = active === section.key;
              return <div key={section.key}>
                <button type="button" aria-expanded={section.open} onClick={section.toggle} className={`flex min-h-[54px] w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition-colors ${selected ? "bg-[#6d35c0] text-white shadow-lg shadow-black/10" : "text-violet-100 hover:bg-white/10 hover:text-white"}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg" aria-hidden="true">{section.icon}</span><span className="flex-1">{section.label}</span><span className={`text-xs transition-transform ${section.open ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
                </button>
                {section.open ? <div className="ml-5 mt-2 grid gap-1 border-l border-white/20 pl-4">{section.items.map(item => <Link key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-sm text-violet-100 transition-colors hover:bg-white/10 hover:text-white">{item.label}</Link>)}</div> : null}
              </div>;
            })}
          </nav>
        </div>
        <div className="mt-auto hidden border-t border-white/10 p-5 text-xs leading-6 text-violet-200 md:block">Jujuba Festeira<br />Gestão da loja</div>
      </aside>
      <div className="min-w-0 flex-1"><div className="admin-topbar flex min-h-14 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Área administrativa</span><Link href="/" className="text-sm font-semibold text-[#7134ad] hover:underline">Ver loja ↗</Link></div>{children}</div>
    </div>
  );
}
