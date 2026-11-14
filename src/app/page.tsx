import Image from "next/image";
import Link from "next/link";
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
  const brandPhoto = (products || [])
    .flatMap((product) => product.product_images || [])
    .find((photo) => photo.image_url)?.image_url;

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

      <section className="jf-about-section" aria-labelledby="jf-about-title">
        <div className="container jf-about-grid">
          <div className="jf-about-visual">
            {brandPhoto ? (
              <Image
                src={brandPhoto}
                alt="Exemplo de produto personalizado da Jujuba Festeira"
                fill
                sizes="(max-width: 760px) 90vw, 44vw"
                className="jf-about-photo"
                unoptimized
              />
            ) : (
              <div className="jf-about-placeholder" aria-hidden="true">
                <Image src="/images/jujuba-logo.png" alt="" width={360} height={158} />
                <span>Criado com carinho, pensado para celebrar</span>
              </div>
            )}
            <span className="jf-about-sticker">Feito com amor</span>
          </div>
          <div className="jf-about-copy">
            <span className="jf-eyebrow">Um pouco sobre nós</span>
            <h2 id="jf-about-title">Pequenos detalhes que transformam grandes momentos.</h2>
            <p>
              Na Jujuba Festeira, cada detalhe é pensado para tornar a sua celebração
              ainda mais especial. Criamos papelaria personalizada e peças cheias de
              carinho para dar vida às suas ideias e guardar boas memórias.
            </p>
            <p>
              Escolha os seus favoritos, conte-nos como imagina a sua festa e vamos
              preparar algo feito especialmente para si.
            </p>
            <Link href="/#catalogo" className="btn jf-about-button">Conheça os nossos produtos</Link>
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
