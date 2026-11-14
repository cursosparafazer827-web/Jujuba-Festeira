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
    const missingRequired = fields.find((field) => field.is_required && (
      field.field_type === "checkbox"
        ? formData.getAll(field.field_key).length === 0
        : !String(formData.get(field.field_key) || "").trim()
    ));
    if (missingRequired) {
      window.alert(`Por favor, preencha: ${missingRequired.label}.`);
      return;
    }
    const details = fields
      .map((field) => {
        const values = field.field_type === "checkbox"
          ? formData.getAll(field.field_key).map((value) => String(value).trim()).filter(Boolean)
          : [String(formData.get(field.field_key) || "").trim()].filter(Boolean);
        return values.length ? `${field.label}: ${values.join(", ")}` : null;
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
    <form className="jf-order-form" onSubmit={sendOrder}>
      {variants.length ? (
        <div id="opcoes" className="jf-option-block">
          <label htmlFor="product-variant" className="jf-form-label">
            Escolha uma opção <span className="jf-required-mark">*</span>
          </label>
          <select
            id="product-variant"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            required
            className="jf-form-control"
          >
            <option value="">Selecione quantidade, tamanho ou cor</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} — {money(variant.price_cents)}
              </option>
            ))}
          </select>
          <p className="jf-field-help">O preço será atualizado conforme a opção escolhida.</p>
        </div>
      ) : null}

      {fields.length ? (
        <div className="jf-customization-block">
          <div className="jf-customization-heading">
            <span className="jf-eyebrow">Do seu jeito</span>
            <h2>Personalize o seu produto</h2>
            <p>Preencha os dados para prepararmos a sua encomenda.</p>
          </div>
          <div className="jf-customization-fields">
            {fields.map((field) => (
              <label key={field.id} className="jf-custom-field">
                <span className="jf-form-label">
                  {field.label}{field.is_required ? <span className="jf-required-mark"> *</span> : null}
                </span>
                {field.field_type === "textarea" ? (
                  <textarea name={field.field_key} required={field.is_required} placeholder={field.placeholder || ""} rows={3} className="jf-form-control jf-textarea" />
                ) : field.field_type === "select" ? (
                  <select name={field.field_key} required={field.is_required} defaultValue="" className="jf-form-control">
                    <option value="">Selecione uma opção</option>
                    {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field.field_type === "radio" ? (
                  <span className="jf-choice-list">
                    {(field.options || []).map((option, index) => <label key={option} className="jf-choice-item"><input type="radio" name={field.field_key} value={option} required={field.is_required && index === 0} /><span>{option}</span></label>)}
                  </span>
                ) : field.field_type === "checkbox" ? (
                  <span className="jf-choice-list">
                    {(field.options || []).map((option) => <label key={option} className="jf-choice-item"><input type="checkbox" name={field.field_key} value={option} /><span>{option}</span></label>)}
                  </span>
                ) : (
                  <input name={field.field_key} type={field.field_type === "number" ? "number" : "text"} min={field.field_type === "number" ? 1 : undefined} required={field.is_required} placeholder={field.placeholder || ""} className="jf-form-control" />
                )}
                {field.help_text ? <span className="jf-field-help">{field.help_text}</span> : null}
              </label>
            ))}
          </div>
          <p className="jf-required-legend">* Campos obrigatórios</p>
        </div>
      ) : null}

      <div className="jf-order-summary">
        <span className="jf-price-caption">Preço apresentado</span>
        <p className="jf-current-price">
          {variants.length && !selected ? "Escolha uma opção" : money(price)}
        </p>
      </div>
      <button
        type="submit"
        className="btn jf-whatsapp-submit"
        disabled={variants.length > 0 && !selected}
      >
        Consultar pelo WhatsApp
      </button>
    </form>
  );
}
