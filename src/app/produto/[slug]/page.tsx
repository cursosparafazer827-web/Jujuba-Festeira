import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductPhotoCarousel from "@/components/product-photo-carousel";
import ProductVariantSelector from "@/components/product-variant-selector";
import SiteHeader from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id,name,slug,short_description,description,base_price_cents,product_images(image_url,alt_text,is_primary,sort_order),product_variants(id,name,price_cents,attributes,is_active,sort_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) notFound();

  const [{ data: customizationFields }, { data: variantsData }] = await Promise.all([
    supabase
      .from("customization_fields")
      .select("id,label,field_key,field_type,is_required,placeholder,help_text,options,sort_order")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("sort_order"),
    Promise.resolve({ data: product.product_variants }),
  ]);

  const photos = (product.product_images || []) as {
    image_url: string | null;
    alt_text: string | null;
    is_primary: boolean;
    sort_order: number;
  }[];
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5544997477331";
  const variants = ((variantsData || []) as {
    id: string;
    name: string;
    price_cents: number;
    attributes: Record<string, unknown> | null;
    is_active: boolean;
    sort_order: number;
  }[])
    .filter((variant) => variant.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const fields = (customizationFields || []) as {
    id: string;
    label: string;
    field_key: string;
    field_type: "text" | "number" | "textarea" | "select" | "radio" | "checkbox";
    options: string[];
    is_required: boolean;
    placeholder: string | null;
    help_text: string | null;
    sort_order: number;
  }[];

  return (
    <main className="site-shell jf-product-page">
      <SiteHeader whatsapp={whatsapp} />

      <div className="container jf-product-container">
        <nav className="jf-product-breadcrumb" aria-label="Caminho de navegação">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <Link href="/#catalogo">Catálogo</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="jf-product-layout">
          <section className="jf-product-gallery" aria-label="Fotografias do produto">
            <div className="jf-product-gallery-heading">
              <span className="jf-eyebrow">Detalhes que encantam</span>
              <span className="jf-gallery-note">Feito com carinho para celebrar</span>
            </div>
            <div className="jf-product-gallery-frame">
              <ProductPhotoCarousel
                photos={photos}
                productName={product.name}
                className="jf-product-carousel"
              />
            </div>
            {photos.length > 1 ? (
              <p className="jf-product-photo-hint">
                Explore as {photos.length} fotografias para ver todos os detalhes.
              </p>
            ) : null}
            <div className="jf-product-trust-note">
              <span aria-hidden="true">✿</span>
              <p>Personalizado especialmente para tornar a sua festa ainda mais especial.</p>
            </div>
          </section>

          <section className="jf-product-details panel">
            <div className="jf-product-brandline">
              <span className="jf-product-brand-dot" aria-hidden="true" />
              Jujuba Festeira
            </div>
            <h1 className="jf-product-heading">{product.name}</h1>
            {product.short_description ? (
              <p className="jf-product-summary">{product.short_description}</p>
            ) : null}
            {product.description ? (
              <div className="jf-product-description whitespace-pre-wrap">
                {product.description}
              </div>
            ) : null}
            <div className="jf-product-divider" />
            <ProductVariantSelector
              productName={product.name}
              basePriceCents={product.base_price_cents}
              variants={variants}
              fields={fields}
              whatsapp={whatsapp}
            />
            <p className="jf-product-whatsapp-note">
              O seu pedido será enviado diretamente pelo WhatsApp. Não há pagamento online nesta etapa.
            </p>
          </section>
        </div>
      </div>

      <footer className="jf-product-footer">
        <p>Jujuba Festeira</p>
        <span>Feito com carinho para celebrar os seus melhores momentos.</span>
      </footer>
    </main>
  );
}
