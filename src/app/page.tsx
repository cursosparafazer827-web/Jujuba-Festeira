import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CatalogBrowser from "@/components/catalog-browser";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id,name,slug").eq("is_active", true).order("sort_order"),
    supabase
      .from("products")
      .select("id,name,slug,short_description,base_price_cents,category_id,is_featured,product_images(image_url,alt_text,is_primary,sort_order)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .order("sort_order", { referencedTable: "product_images", ascending: true }),
  ]);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5544997477331";

  return (
    <main>
      <header className="border-b border-pink-100 bg-white">
        <div className="container flex items-center justify-between py-5">
          <Link href="/" className="text-2xl font-black text-berry">
            Jujuba Festeira<span className="text-pink-400"> ♥</span>
          </Link>
          <nav className="flex gap-5 text-sm font-semibold">
            <a href="#catalogo">Catálogo</a>
            <a href={"https://wa.me/" + whatsapp} target="_blank" rel="noreferrer">Fale connosco</a>
          </nav>
        </div>
      </header>

      <section className="bg-candy/40">
        <div className="container grid gap-8 py-20 md:grid-cols-2 md:items-center">
          <div>
            <span className="pill">Papelaria personalizada</span>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              A festa dos seus sonhos começa nos detalhes.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-stone-600">
              Peças feitas com carinho para transformar cada comemoração numa memória especial.
            </p>
            <a className="btn mt-8" href="#catalogo">Explorar catálogo</a>
          </div>
          <div className="panel flex min-h-64 items-center justify-center bg-white text-center">
            <div>
              <div className="text-7xl">🎀 🎉</div>
              <p className="mt-4 text-lg font-bold text-berry">Detalhes que encantam!</p>
              <p className="muted text-sm">Personalize com tema, nome e idade.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="container py-16">
        <div className="mb-8">
          <p className="font-bold uppercase tracking-widest text-berry">Feito para celebrar</p>
          <h2 className="mt-2 text-3xl font-black">O nosso catálogo</h2>
          <p className="mt-2 text-sm text-stone-500">Pesquise um produto ou escolha uma categoria.</p>
        </div>
        <CatalogBrowser categories={categories || []} products={products || []} />
        {!products?.length ? (
          <p className="panel muted mt-6">Estamos a preparar o catálogo. Em breve teremos novidades!</p>
        ) : null}
      </section>

      <footer className="mt-12 bg-stone-900 py-10 text-center text-white">
        <p className="text-xl font-black">Jujuba Festeira</p>
        <p className="mt-2 text-sm text-stone-300">Feito com carinho para celebrar os seus melhores momentos.</p>
        <p className="mt-5 text-xs text-stone-400">© {new Date().getFullYear()} Jujuba Festeira</p>
      </footer>
    </main>
  );
}
