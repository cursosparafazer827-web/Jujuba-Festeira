"use client";

import { useState } from "react";

type ProductVariant = {
  id: string;
  name: string;
  price_cents: number;
  attributes: Record<string, unknown> | null;
};

type Props = {
  productName: string;
  basePriceCents: number;
  variants: ProductVariant[];
  whatsapp: string;
};

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function ProductVariantSelector({
  productName,
  basePriceCents,
  variants,
  whatsapp,
}: Props) {
  const [selectedId, setSelectedId] = useState("");
  const selected = variants.find((variant) => variant.id === selectedId);
  const price = selected?.price_cents ?? basePriceCents;
  const message = selected
    ? `Olá! Gostaria de encomendar: ${productName}. Opção escolhida: ${selected.name}. Preço apresentado: ${money(selected.price_cents)}.`
    : `Olá! Gostaria de saber mais sobre: ${productName}.`;
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <div className="mt-7">
      {variants.length ? (
        <div id="opcoes">
          <label htmlFor="product-variant" className="mb-2 block text-sm font-bold text-stone-700">
            Escolha uma opção
          </label>
          <select
            id="product-variant"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm outline-none focus:border-berry"
          >
            <option value="">Selecione quantidade, tamanho ou cor</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} — {money(variant.price_cents)}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-stone-500">
            O preço será atualizado conforme a opção escolhida.
          </p>
        </div>
      ) : null}
      <p className="mt-5 text-2xl font-black text-berry">
        {variants.length && !selected ? "Escolha uma opção" : money(price)}
      </p>
      <a
        className={`btn mt-5 inline-flex ${variants.length && !selected ? "pointer-events-none opacity-50" : ""}`}
        href={variants.length && !selected ? "#opcoes" : href}
        aria-disabled={variants.length > 0 && !selected}
        onClick={(event) => {
          if (variants.length > 0 && !selected) event.preventDefault();
        }}
        target="_blank"
        rel="noreferrer"
      >
        {variants.length && !selected ? "Selecione uma opção" : "Consultar pelo WhatsApp"}
      </a>
    </div>
  );
}
