"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductPhotoCarousel from "@/components/product-photo-carousel";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  base_price_cents: number;
  category_id: string | null;
  is_featured: boolean;
  product_images: { image_url: string | null; alt_text: string | null; is_primary: boolean; sort_order: number }[] | null;
};

type Props = { categories: Category[]; products: Product[] };

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function CatalogBrowser({ categories, products }: Props) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => {
      const matchesCategory = categoryId === "all" || product.category_id === categoryId;
      const matchesSearch =
        !term ||
        product.name.toLocaleLowerCase("pt-BR").includes(term) ||
        (product.short_description || "").toLocaleLowerCase("pt-BR").includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryId]);

  return (
    <>
      <div className="mb-8 space-y-4">
        <label htmlFor="catalog-search" className="sr-only">Pesquisar produtos</label>
        <input
          id="catalog-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Pesquisar produto..."
          className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-berry"
        />
        <div className="flex flex-wrap gap-2" aria-label="Filtrar por categoria">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            aria-pressed={categoryId === "all"}
            className={`rounded-full border px-4 py-2 text-sm ${categoryId === "all" ? "border-berry bg-berry text-white" : "border-pink-200 bg-white"}`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              aria-pressed={categoryId === category.id}
              className={`rounded-full border px-4 py-2 text-sm ${categoryId === category.id ? "border-berry bg-berry text-white" : "border-pink-200 bg-white"}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const photos = product.product_images || [];
            return (
              <article key={product.id} className="panel overflow-hidden p-0">
                <ProductPhotoCarousel photos={photos} productName={product.name} className="h-52" />
                <div className="p-5">
                  {product.is_featured ? <span className="pill">Destaque</span> : null}
                  <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
                  <p className="mt-1 min-h-10 text-sm text-stone-500">
                    {product.short_description || "Personalize este produto para a sua festa."}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <strong className="text-lg text-berry">{money(product.base_price_cents)}</strong>
                    <Link className="btn btn-light text-sm" href={"/produto/" + product.slug}>Ver produto</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="panel py-10 text-center">
          <p className="font-semibold">Não encontrámos produtos.</p>
          <p className="mt-1 text-sm text-stone-500">Tente outro nome ou escolha uma categoria diferente.</p>
          <button
            type="button"
            onClick={() => { setSearch(""); setCategoryId("all"); }}
            className="btn mt-4"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </>
  );
}
