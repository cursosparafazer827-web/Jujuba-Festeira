"use client";

import { saveCustomizationField } from "@/app/admin/actions";

type Field = {
  id: string;
  label: string;
  field_key: string;
  field_type: string;
  is_required: boolean;
  options: string[];
  is_active: boolean;
};

export default function ProductCustomizationManager({ productId, fields }: { productId: string; fields: Field[] }) {
  return (
    <details className="mt-3 border-t border-pink-100 pt-3">
      <summary className="cursor-pointer text-sm font-bold text-berry">Personalizações do produto ({fields.length})</summary>
      <div className="mt-3 space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="rounded-lg bg-pink-50/60 p-3 text-sm">
            <p className="font-semibold">{field.label} <span className="font-normal text-stone-500">· {field.field_type}</span> {field.is_required ? "· Obrigatório" : "· Opcional"}</p>
            {field.options?.length ? <p className="mt-1 text-xs text-stone-600">Opções: {field.options.join(", ")}</p> : null}
            {!field.is_active ? <p className="text-xs text-red-600">Inativo</p> : null}
          </div>
        ))}
        <form action={saveCustomizationField} className="grid gap-2 rounded-xl border border-pink-100 p-3">
          <input type="hidden" name="product_id" value={productId} />
          <p className="text-sm font-bold">Adicionar opção de personalização</p>
          <label className="field">Pergunta (ex.: Escolha a cor)<input name="label" required maxLength={100} placeholder="Escolha o tema"/></label>
          <label className="field">Tipo de escolha
            <select name="field_type" defaultValue="select">
              <option value="select">Lista suspensa</option>
              <option value="radio">Escolher uma opção (botões)</option>
              <option value="checkbox">Marcar várias opções</option>
            </select>
          </label>
          <label className="field">Opções (uma por linha)
            <textarea name="options" rows={4} required placeholder={"Patrulha Canina\nPrincesas\nSafari"} />
          </label>
          <label className="field">Texto de ajuda (opcional)<input name="help_text" maxLength={180} placeholder="Escolha o tema da festa"/></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_required" defaultChecked/> Resposta obrigatória</label>
          <label className="field">Ordem de apresentação<input name="sort_order" type="number" min="0" max="100000" defaultValue="0"/></label>
          <button className="btn mt-1">Guardar opções</button>
        </form>
      </div>
    </details>
  );
}
