"use client";

import { useState } from "react";

type ProductVariant = {
  id: string;
  name: string;
  price_cents: number;
  attributes: Record<string, unknown> | null;
};

type CustomizationField = {
  id: string;
  label: string;
  field_key: string;
  field_type: "text" | "number" | "textarea" | "select" | "radio" | "checkbox";
  options: string[];
  is_required: boolean;
  placeholder: string | null;
  help_text: string | null;
};

type Props = {
  productName: string;
  basePriceCents: number;
  variants: ProductVariant[];
  fields: CustomizationField[];
  whatsapp: string;
};

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function ProductVariantSelector({
  productName,
  basePriceCents,
  variants,
  fields,
  whatsapp,
}: Props) {
  const [selectedId, setSelectedId] = useState("");
  const selected = variants.find((variant) => variant.id === selectedId);
  const price = selected?.price_cents ?? basePriceCents;

  function sendOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (variants.length > 0 && !selected) return;

    const formData = new FormData(event.currentTarget);
    const details = fields
      .map((field) => {
        const value = String(formData.get(field.field_key) || "").trim();
        return value ? `${field.label}: ${value}` : null;
      })
      .filter((value): value is string => Boolean(value));

    const message = [
      `Olá! Gostaria de encomendar: ${productName}.`,
      selected ? `Opção escolhida: ${selected.name}.` : null,
      `Preço apresentado: ${money(price)}.`,
      details.length ? "Dados para personalização:" : null,
      ...details,
    ].filter(Boolean).join("\n");

    const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    window.location.assign(href);
  }

  return (
    <form className="mt-7" onSubmit={sendOrder}>
      {variants.length ? (
        <div id="opcoes">
          <label htmlFor="product-variant" className="mb-2 block text-sm font-bold text-stone-700">
            Escolha uma opção
          </label>
          <select
            id="product-variant"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            required
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

      {fields.length ? (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-base font-bold">Personalize o seu produto</h2>
            <p className="mt-1 text-xs text-stone-500">
              Preencha os dados para prepararmos a sua encomenda.
            </p>
          </div>
          {fields.map((field) => (
            <label key={field.id} className="block text-sm font-semibold text-stone-700">
              {field.label}{field.is_required ? " *" : ""}
              {field.field_type === "textarea" ? (
                <textarea name={field.field_key} required={field.is_required} placeholder={field.placeholder || ""} rows={3} className="mt-2 w-full rounded-xl border border-pink-200 bg-white px-4 py-3 font-normal outline-none focus:border-berry" />
              ) : field.field_type === "select" ? (
                <select name={field.field_key} required={field.is_required} defaultValue="" className="mt-2 w-full rounded-xl border border-pink-200 bg-white px-4 py-3 font-normal outline-none focus:border-berry">
                  <option value="">Selecione uma opção</option>
                  {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : field.field_type === "radio" ? (
                <span className="mt-2 grid gap-2 rounded-xl border border-pink-100 p-3">
                  {(field.options || []).map((option, index) => <label key={option} className="flex items-center gap-2 font-normal"><input type="radio" name={field.field_key} value={option} required={field.is_required && index === 0} />{option}</label>)}
                </span>
              ) : field.field_type === "checkbox" ? (
                <span className="mt-2 grid gap-2 rounded-xl border border-pink-100 p-3">
                  {(field.options || []).map((option) => <label key={option} className="flex items-center gap-2 font-normal"><input type="checkbox" name={field.field_key} value={option} />{option}</label>)}
                </span>
              ) : (
                <input name={field.field_key} type={field.field_type === "number" ? "number" : "text"} min={field.field_type === "number" ? 1 : undefined} required={field.is_required} placeholder={field.placeholder || ""} className="mt-2 w-full rounded-xl border border-pink-200 bg-white px-4 py-3 font-normal outline-none focus:border-berry" />
              )}
              {field.help_text ? (
                <span className="mt-1 block text-xs font-normal text-stone-500">{field.help_text}</span>
              ) : null}
            </label>
          ))}
          <p className="text-xs text-stone-500">* Campos obrigatórios</p>
        </div>
      ) : null}

      <p className="mt-5 text-2xl font-black text-berry">
        {variants.length && !selected ? "Escolha uma opção" : money(price)}
      </p>
      <button
        type="submit"
        className={`btn mt-5 inline-flex ${variants.length && !selected ? "pointer-events-none opacity-50" : ""}`}
        disabled={variants.length > 0 && !selected}
      >
        Consultar pelo WhatsApp
      </button>
    </form>
  );
}
