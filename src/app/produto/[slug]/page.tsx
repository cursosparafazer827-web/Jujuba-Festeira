import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductPhotoCarousel from "@/components/product-photo-carousel";

export const dynamic = "force-dynamic";

const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id,name,slug,short_description,description,base_price_cents,product_images(image_url,alt_text,is_primary,sort_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) notFound();

  const photos = (product.product_images || []) as { image_url: string | null; alt_text: string | null; is_primary: boolean; sort_order: number }[];
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5544997477331";
  const message = encodeURIComponent("Olá! Gostaria de saber mais sobre: " + product.name);

  return (
    <main className="container min-h-screen py-8">
      <Link href="/" className="text-sm font-bold text-berry hover:underline">← Voltar ao catálogo</Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:items-start">
        <div>
          <ProductPhotoCarousel photos={photos} productName={product.name} className="h-[360px] rounded-2xl sm:h-[480px]" />
          {photos.length > 1 ? <p className="mt-3 text-center text-sm text-stone-500">Use as setas ou os pontos para ver todas as {photos.length} fotografias.</p> : null}
        </div>
        <section className="panel">
          <p className="text-xs font-bold uppercase tracking-widest text-berry">Jujuba Festeira</p>
          <h1 className="mt-3 text-3xl font-black">{product.name}</h1>
          {product.short_description ? <p className="mt-4 text-stone-600">{product.short_description}</p> : null}
          {product.description ? <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-stone-700">{product.description}</div> : null}
          <p className="mt-7 text-2xl font-black text-berry">{money(product.base_price_cents)}</p>
          <a className="btn mt-5 inline-flex" href={`https://wa.me/${whatsapp}?text=${message}`} target="_blank" rel="noreferrer">Consultar pelo WhatsApp</a>
        </section>
      </div>
    </main>
  );
}
