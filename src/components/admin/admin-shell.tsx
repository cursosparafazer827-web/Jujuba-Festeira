import Link from "next/link";

type Props = {
  active: "catalog" | "orders";
  children: React.ReactNode;
};

export default function AdminShell({ active, children }: Props) {
  const links = [
    { href: "/admin", label: "Catálogo de produtos", key: "catalog" as const, icon: "▦" },
    { href: "/admin/encomendas", label: "Gestão de encomendas", key: "orders" as const, icon: "▤" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-slate-800 md:flex">
      <aside className="w-full shrink-0 bg-[#351078] text-white md:sticky md:top-0 md:flex md:h-screen md:w-[250px] md:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/admin" className="text-2xl font-black tracking-tight text-white">jujuba<span className="text-pink-300">.</span></Link>
          <p className="mt-1 text-xs text-violet-200">PAINEL DE ADMINISTRAÇÃO</p>
        </div>
        <div className="px-5 py-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-violet-300">Menu principal</p>
          <nav aria-label="Navegação administrativa" className="grid gap-2">
            {links.map((link) => {
              const selected = active === link.key;
              return (
                <Link key={link.key} href={link.href} aria-current={selected ? "page" : undefined}
                  className={`flex min-h-[54px] items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors ${selected ? "bg-[#6d35c0] text-white shadow-lg shadow-black/10" : "text-violet-100 hover:bg-white/10 hover:text-white"}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg" aria-hidden="true">{link.icon}</span>
                  <span>{link.label}</span>
                  {selected ? <span className="ml-auto h-2 w-2 rounded-full bg-pink-300" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto hidden border-t border-white/10 p-5 text-xs leading-6 text-violet-200 md:block">
          Jujuba Festeira<br />Gestão da loja
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="flex min-h-14 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Área administrativa</span>
          <Link href="/" className="text-sm font-semibold text-[#7134ad] hover:underline">Ver loja ↗</Link>
        </div>
        {children}
      </div>
    </div>
  );
}
