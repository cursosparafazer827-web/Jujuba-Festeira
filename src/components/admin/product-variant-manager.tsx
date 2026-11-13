import { saveVariant, deleteVariant } from "@/app/admin/actions";

type Variant = {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price_cents: number;
  attributes: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
};

type Props = { productId: string; variants: Variant[] };

const money = (cents: number) => (cents / 100).toFixed(2);

export default function ProductVariantManager({ productId, variants }: Props) {
  return (
    <section className="mt-4 border-t border-pink-100 pt-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-berry">Variantes ({variants.length})</h4>
      </div>
      <details>
        <summary className="cursor-pointer text-sm font-semibold text-berry">Gerir variantes</summary>
        <form action={saveVariant} className="mt-3 grid gap-2 rounded-lg bg-pink-50/60 p-3 sm:grid-cols-2">
          <input type="hidden" name="product_id" value={productId} />
          <strong className="text-sm sm:col-span-2">Adicionar variante</strong>
          <label className="field">Nome da variante<input name="name" required maxLength={120} placeholder="Ex.: 20 peças" /></label>
          <label className="field">SKU (opcional)<input name="sku" maxLength={80} placeholder="Código interno" /></label>
          <label className="field">Preço (R$)<input name="price" type="number" min="0" max="1000000" step="0.01" required /></label>
          <label className="field">Ordem<input name="sort_order" type="number" min="0" max="100000" defaultValue={variants.length + 1} /></label>
          <label className="field sm:col-span-2">Atributos em JSON (opcional)<textarea name="attributes" rows={2} defaultValue="{}" placeholder='{"quantity":20}' /></label>
          <button className="btn sm:col-span-2">Adicionar variante</button>
        </form>
        {variants.length ? (
          <div className="mt-3 grid gap-3">
            {variants.map((variant) => (
              <article key={variant.id} className="rounded-lg border border-pink-100 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold">{variant.name} · R$ {money(variant.price_cents)}</p>
                  <span className="pill">{variant.is_active ? "Ativa" : "Inativa"}</span>
                </div>
                <details>
                  <summary className="cursor-pointer text-xs font-semibold text-berry">Editar variante</summary>
                  <form action={saveVariant} className="mt-3 grid gap-2 sm:grid-cols-2">
                    <input type="hidden" name="product_id" value={productId} />
                    <input type="hidden" name="id" value={variant.id} />
                    <label className="field">Nome<input name="name" defaultValue={variant.name} required maxLength={120} /></label>
                    <label className="field">SKU<input name="sku" defaultValue={variant.sku || ""} maxLength={80} /></label>
                    <label className="field">Preço (R$)<input name="price" type="number" min="0" max="1000000" step="0.01" defaultValue={money(variant.price_cents)} required /></label>
                    <label className="field">Ordem<input name="sort_order" type="number" min="0" max="100000" defaultValue={variant.sort_order} /></label>
                    <label className="field sm:col-span-2">Atributos em JSON<textarea name="attributes" rows={2} defaultValue={JSON.stringify(variant.attributes ?? {}, null, 2)} /></label>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="is_active" defaultChecked={variant.is_active} /> Variante ativa na loja</label>
                    <button className="btn sm:col-span-2">Guardar variante</button>
                  </form>
                </details>
                <form action={deleteVariant} className="mt-3 flex flex-wrap items-end gap-2 border-t border-red-100 pt-3">
                  <input type="hidden" name="product_id" value={productId} />
                  <input type="hidden" name="id" value={variant.id} />
                  <label className="field min-w-40 flex-1 text-xs text-red-700">Para confirmar, escreva APAGAR<input name="confirmation" required autoComplete="off" placeholder="APAGAR" /></label>
                  <button className="btn bg-red-600 text-white hover:bg-red-700">Eliminar variante</button>
                </form>
              </article>
            ))}
          </div>
        ) : <p className="muted mt-3 text-sm">Este produto ainda não tem variantes.</p>}
      </details>
    </section>
  );
}
