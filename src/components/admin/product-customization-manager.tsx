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
    <div className="admin-custom-type-fields">
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
        <label className="field">Opções <span className="admin-custom-hint">Uma opção por linha</span>
          <textarea name="options" rows={4} required defaultValue={defaultOptions} placeholder={"Princesas\nSafari\nFutebol"} />
        </label>
      ) : <input type="hidden" name="options" value="" />}
    </div>
  );
}

function CustomizationFlags({ required, active = true }: { required: boolean; active?: boolean }) {
  return (
    <div className="admin-custom-flags">
      <label><input type="checkbox" name="is_required" defaultChecked={required}/> <span>Resposta obrigatória</span></label>
      <label><input type="checkbox" name="is_active" defaultChecked={active}/> <span>Ativo na loja</span></label>
    </div>
  );
}

export default function ProductCustomizationManager({ productId, fields }: { productId: string; fields: Field[] }) {
  return (
    <details className="admin-customization-manager mt-3 border-t border-pink-100 pt-3">
      <summary className="admin-customization-summary cursor-pointer">
        <span>Personalizações do produto</span><span className="admin-custom-count">{fields.length}</span>
      </summary>
      <div className="admin-customization-content mt-4 space-y-4">
        {fields.map((field, index) => (
          <details key={field.id} className="admin-custom-edit-card">
            <summary className="admin-custom-edit-summary">
              <span className="admin-custom-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <strong className="block break-words">{field.label}</strong>
                <span className="admin-custom-meta">{typeLabels[field.field_type] || field.field_type} · {field.is_required ? "Obrigatório" : "Opcional"}{!field.is_active ? " · Inativo" : ""}</span>
              </span>
              <span className="admin-custom-edit-action">Editar</span>
            </summary>
            <div className="admin-custom-edit-body">
              {field.options?.length ? <p className="admin-custom-current-options"><strong>Opções atuais:</strong> {field.options.join(" · ")}</p> : null}
              <form action={updateCustomizationField} className="admin-custom-form">
                <input type="hidden" name="id" value={field.id} />
                <input type="hidden" name="product_id" value={productId} />
                <label className="field admin-custom-wide">Pergunta<input name="label" required maxLength={100} defaultValue={field.label}/></label>
                <CustomizationTypeFields defaultType={field.field_type} defaultOptions={(field.options || []).join("\n")} />
                <label className="field">Texto apresentado antes da resposta <span className="admin-custom-hint">Opcional</span><input name="placeholder" maxLength={120} defaultValue={field.placeholder || ""} placeholder="Ex.: Escreva o nome da criança"/></label>
                <label className="field">Texto de ajuda <span className="admin-custom-hint">Opcional</span><input name="help_text" maxLength={180} defaultValue={field.help_text || ""} placeholder="Explique como preencher"/></label>
                <CustomizationFlags required={field.is_required} active={field.is_active}/>
                <label className="field">Ordem de apresentação<input name="sort_order" type="number" min="0" max="100000" defaultValue={field.sort_order ?? 0}/></label>
                <button className="btn admin-custom-save">Guardar alterações</button>
              </form>
              <form action={deleteCustomizationField} className="admin-custom-delete-form">
                <input type="hidden" name="id" value={field.id}/>
                <input type="hidden" name="product_id" value={productId}/>
                <label className="field">Confirmação de eliminação <span className="admin-custom-hint">Escreva APAGAR</span><input name="confirmation" required autoComplete="off" placeholder="APAGAR"/></label>
                <button className="btn admin-custom-delete">Apagar personalização</button>
              </form>
            </div>
          </details>
        ))}
        <section className="admin-custom-add-card">
          <div className="admin-custom-add-heading"><span className="admin-custom-add-icon">＋</span><div><h3>Adicionar personalização</h3><p>Define a pergunta e o tipo de resposta que o cliente verá na loja.</p></div></div>
          <form action={saveCustomizationField} className="admin-custom-form">
            <input type="hidden" name="product_id" value={productId} />
            <label className="field admin-custom-wide">Pergunta<input name="label" required maxLength={100} placeholder="Ex.: Qual é o nome da criança?"/></label>
            <CustomizationTypeFields />
            <label className="field">Texto apresentado antes da resposta <span className="admin-custom-hint">Opcional</span><input name="placeholder" maxLength={120} placeholder="Ex.: Escreva o nome da criança"/></label>
            <label className="field">Texto de ajuda <span className="admin-custom-hint">Opcional</span><input name="help_text" maxLength={180} placeholder="Explique como preencher"/></label>
            <div className="admin-custom-flags"><label><input type="checkbox" name="is_required" defaultChecked/> <span>Resposta obrigatória</span></label></div>
            <label className="field">Ordem de apresentação<input name="sort_order" type="number" min="0" max="100000" defaultValue="0"/></label>
            <button className="btn admin-custom-save">Guardar personalização</button>
          </form>
        </section>
      </div>
    </details>
  );
}
