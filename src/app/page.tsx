import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CatalogBrowser from "@/components/catalog-browser";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

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
          <div className="jf-hero-message">
            <span className="jf-eyebrow">Papelaria criativa e personalizada</span>
            <h1>Detalhes feitos com carinho. Momentos que ficam na memória.</h1>
          </div>
          <p>Peças especiais para dar vida às suas ideias e tornar cada celebração ainda mais sua.</p>
        </div>
      </section>

      {products?.some((product) => product.is_featured) ? (
        <section className="jf-featured-section" aria-labelledby="jf-featured-title">
          <div className="container">
            <div className="jf-section-heading">
              <span className="jf-eyebrow">Escolhas especiais</span>
              <h2 id="jf-featured-title">Em destaque</h2>
              <p>Algumas das peças que podem dar um toque especial à sua celebração.</p>
            </div>
            <div className="jf-featured-grid">
              {products.filter((product) => product.is_featured).slice(0, 3).map((product) => {
                const photo = (product.product_images || []).find((item) => item.is_primary && item.image_url)
                  || (product.product_images || []).find((item) => item.image_url);
                return (
                  <article className="jf-featured-card" key={product.id}>
                    <Link href={"/produto/" + product.slug} className="jf-featured-image">
                      {photo?.image_url ? (
                        <Image src={photo.image_url} alt={photo.alt_text || product.name} fill sizes="(max-width: 700px) 90vw, 30vw" />
                      ) : (
                        <div className="jf-featured-placeholder"><span>Feito para celebrar</span></div>
                      )}
                    </Link>
                    <div className="jf-featured-copy">
                      <h3>{product.name}</h3>
                      <p>{product.short_description || "Uma peça especial para personalizar."}</p>
                      <Link href={"/produto/" + product.slug} className="jf-text-link">Conhecer produto <span aria-hidden="true">→</span></Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="jf-featured-action"><Link href="/#catalogo" className="btn btn-light">Ver todo o catálogo</Link></div>
          </div>
        </section>
      ) : null}

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
        <div className="jf-catalog-heading mb-8">
          <span className="jf-eyebrow">Escolha os seus favoritos</span>
          <h2>O nosso catálogo</h2>
          <p>Descubra peças personalizadas para celebrar momentos especiais. Pesquise um produto ou explore as categorias.</p>
        </div>
        <CatalogBrowser categories={categories || []} products={products || []} />
        {!products?.length ? (
          <p className="panel muted mt-6">Estamos a preparar o catálogo. Em breve teremos novidades!</p>
        ) : null}
      </section>

      <section className="jf-how-section" aria-labelledby="jf-how-title">
        <div className="container">
          <div className="jf-section-heading">
            <span className="jf-eyebrow">É simples e especial</span>
            <h2 id="jf-how-title">Como encomendar</h2>
            <p>O caminho para transformar a sua ideia numa peça personalizada começa aqui.</p>
          </div>
          <ol className="jf-how-grid">
            <li><span className="jf-step-number">01</span><h3>Escolha o produto</h3><p>Explore o catálogo e encontre a peça que combina com a sua celebração.</p></li>
            <li><span className="jf-step-number">02</span><h3>Personalize</h3><p>Na página do produto, selecione as opções disponíveis e preencha os dados pedidos.</p></li>
            <li><span className="jf-step-number">03</span><h3>Fale connosco</h3><p>Envie o seu pedido pelo WhatsApp para dar seguimento à encomenda.</p></li>
          </ol>
        </div>
      </section>

      <section className="jf-faq-section" aria-labelledby="jf-faq-title">
        <div className="container jf-faq-layout">
          <div className="jf-faq-intro">
            <span className="jf-eyebrow">Dúvidas frequentes</span>
            <h2 id="jf-faq-title">Antes de escolher, estamos aqui para ajudar.</h2>
            <p>Veja algumas respostas sobre a escolha e personalização dos produtos.</p>
            <Link href="/#catalogo" className="btn">Explorar produtos</Link>
          </div>
          <div className="jf-faq-list">
            <details><summary>Como faço uma encomenda?</summary><p>Escolha um produto, indique as opções de personalização disponíveis e envie o pedido pelo botão de WhatsApp na página do produto.</p></details>
            <details><summary>Posso personalizar os produtos?</summary><p>Sim. As opções disponíveis aparecem na página de cada produto. Preencha os campos solicitados antes de enviar o pedido.</p></details>
            <details><summary>O valor pode mudar conforme as opções?</summary><p>Sim. Quando um produto tem variantes com preços diferentes, o valor apresentado acompanha a opção selecionada.</p></details>
          </div>
        </div>
      </section>

      <SiteFooter whatsapp={whatsapp} />
    </main>
  );
}
