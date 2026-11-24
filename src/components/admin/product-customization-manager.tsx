"use client";

import { useState } from "react";
import { saveCustomizationField, updateCustomizationField, deleteCustomizationField } from "@/app/admin/actions";

type Field = {
  id: string;
  label: string;
  field_key: string;
  field_type: string;
  is_required: boolean;
  options: string[];
  is_active: boolean;
  placeholder?: string | null;
  help_text?: string | null;
  sort_order?: number;
};

const optionTypes = ["select", "radio", "checkbox"];
const typeLabels: Record<string, string> = {
  text: "Texto curto",
  number: "Número",
  textarea: "Texto longo",
  select: "Lista suspensa",
  radio: "Escolher uma opção (botões)",
  checkbox: "Marcar várias opções",
};

function CustomizationTypeFields({ defaultType = "select", defaultOptions = "" }: { defaultType?: string; defaultOptions?: string }) {
  const [type, setType] = useState(defaultType);
  return (
    <>
      <label className="field">Tipo de resposta
        <select name="field_type" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="text">Texto curto</option>
          <option value="number">Número</option>
          <option value="textarea">Texto longo</option>
          <option value="select">Lista suspensa</option>
          <option value="radio">Escolher uma opção (botões)</option>
          <option value="checkbox">Marcar várias opções</option>
        </select>
      </label>
      {optionTypes.includes(type) ? (
        <label className="field">Opções (uma por linha)
          <textarea name="options" rows={4} required defaultValue={defaultOptions} placeholder={"Princesas\nSafari\nFutebol"} />
        </label>
      ) : <input type="hidden" name="options" value="" />}
    </>
  );
}

export default function ProductCustomizationManager({ productId, fields }: { productId: string; fields: Field[] }) {
  return (
    <details className="mt-3 border-t border-pink-100 pt-3">
      <summary className="cursor-pointer text-sm font-bold text-berry">Personalizações do produto ({fields.length})</summary>
      <div className="mt-3 space-y-3">
        {fields.map((field) => (
          <details key={field.id} className="rounded-lg bg-pink-50/60 p-3 text-sm">
            <summary className="cursor-pointer font-semibold">{field.label} <span className="font-normal text-stone-500">· {typeLabels[field.field_type] || field.field_type}</span> {field.is_required ? "· Obrigatório" : "· Opcional"} · Editar</summary>
            {field.options?.length ? <p className="mt-2 text-xs text-stone-600">Opções atuais: {field.options.join(", ")}</p> : null}
            {!field.is_active ? <p className="text-xs text-red-600">Inativo</p> : null}
            <form action={updateCustomizationField} className="mt-3 grid gap-2">
              <input type="hidden" name="id" value={field.id} />
              <input type="hidden" name="product_id" value={productId} />
              <label className="field">Pergunta<input name="label" required maxLength={100} defaultValue={field.label}/></label>
              <CustomizationTypeFields defaultType={field.field_type} defaultOptions={(field.options || []).join("\n")} />
              <label className="field">Texto apresentado antes da resposta (opcional)<input name="placeholder" maxLength={120} defaultValue={field.placeholder || ""} placeholder="Ex.: Escreva o nome da criança"/></label>
              <label className="field">Texto de ajuda<input name="help_text" maxLength={180} defaultValue={field.help_text || ""}/></label>
              <label className="flex items-center gap-2"><input type="checkbox" name="is_required" defaultChecked={field.is_required}/> Resposta obrigatória</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={field.is_active}/> Ativo na loja</label>
              <label className="field">Ordem de apresentação<input name="sort_order" type="number" min="0" max="100000" defaultValue={field.sort_order ?? 0}/></label>
              <button className="btn mt-1">Guardar alterações</button>
            </form>
            <form action={deleteCustomizationField} className="mt-3 flex flex-wrap items-end gap-2 border-t border-red-100 pt-3">
              <input type="hidden" name="id" value={field.id}/>
              <input type="hidden" name="product_id" value={productId}/>
              <label className="field flex-1 text-xs text-red-700">Para apagar, escreva APAGAR<input name="confirmation" required autoComplete="off" placeholder="APAGAR"/></label>
              <button className="btn bg-red-600 text-white hover:bg-red-700">Apagar personalização</button>
            </form>
          </details>
        ))}
        <form action={saveCustomizationField} className="grid gap-2 rounded-xl border border-pink-100 p-3">
          <input type="hidden" name="product_id" value={productId} />
          <p className="text-sm font-bold">Adicionar personalização</p>
          <label className="field">Pergunta<input name="label" required maxLength={100} placeholder="Ex.: Qual é o nome da criança?"/></label>
          <CustomizationTypeFields />
          <label className="field">Texto apresentado antes da resposta (opcional)<input name="placeholder" maxLength={120} placeholder="Ex.: Escreva o nome da criança"/></label>
          <label className="field">Texto de ajuda (opcional)<input name="help_text" maxLength={180} placeholder="Explique como preencher"/></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_required" defaultChecked/> Resposta obrigatória</label>
          <label className="field">Ordem de apresentação<input name="sort_order" type="number" min="0" max="100000" defaultValue="0"/></label>
          <button className="btn mt-1">Guardar personalização</button>
        </form>
      </div>
    </details>
  );
}
