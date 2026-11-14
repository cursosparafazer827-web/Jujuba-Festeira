import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import CatalogBrowser from "@/components/catalog-browser";
import SiteHeader from "@/components/site-header";

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
    <main className="site-shell">
      <SiteHeader whatsapp={whatsapp} />

      <section className="jf-hero-banner" aria-label="Jujuba Festeira — Papelaria Criativa">
        <div className="jf-hero-art">
          <Image
            src="/images/jujuba-banner.webp"
            alt="Jujuba Festeira — transformamos papel em memórias inesquecíveis"
            width={1600}
            height={600}
            priority
            sizes="100vw"
            className="jf-hero-image"
          />
        </div>
        <div className="jf-hero-caption">
          <span>Detalhes feitos com carinho</span>
          <span>Momentos que ficam na memória</span>
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
