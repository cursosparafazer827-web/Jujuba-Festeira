"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProductImage = {
  id: string;
  storage_path: string | null;
  image_url: string | null;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

type Props = {
  productId: string;
  productName: string;
  initialImages: ProductImage[];
};

const BUCKET = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ProductImageManager({ productId, productName, initialImages }: Props) {
  const [images, setImages] = useState(initialImages);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function uploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setBusy(true);
    setMessage("");
    const supabase = createClient();

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
          throw new Error("Use imagens JPG, PNG, WEBP ou GIF.");
        }
        if (file.size > MAX_FILE_SIZE) {
          throw new Error("Cada imagem pode ter no máximo 5 MB.");
        }

        const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        const storagePath = `${productId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        const isPrimary = images.length === 0;
        const nextOrder = images.reduce((max, image) => Math.max(max, image.sort_order), -1) + 1;
        const { data: inserted, error: insertError } = await supabase
          .from("product_images")
          .insert({
            product_id: productId,
            storage_path: storagePath,
            image_url: publicData.publicUrl,
            alt_text: productName,
            is_primary: isPrimary,
            sort_order: nextOrder,
          })
          .select("id,storage_path,image_url,alt_text,is_primary,sort_order")
          .single();

        if (insertError || !inserted) {
          await supabase.storage.from(BUCKET).remove([storagePath]);
          throw insertError ?? new Error("Não foi possível guardar a fotografia.");
        }
        setImages((current) => [...current, inserted]);
      }

      setMessage("Fotografia(s) adicionada(s) com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar as fotografias.");
    } finally {
      setBusy(false);
    }
  }

  async function makePrimary(imageId: string) {
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error: clearError } = await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    if (clearError) {
      setMessage("Não foi possível alterar a fotografia principal.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId).eq("product_id", productId);
    if (error) {
      setMessage("Não foi possível definir a fotografia principal.");
    } else {
      setImages((current) => current.map((image) => ({ ...image, is_primary: image.id === imageId })));
      setMessage("Fotografia principal atualizada.");
      router.refresh();
    }
    setBusy(false);
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setBusy(true);
    setMessage("");
    const current = images[index];
    const target = images[targetIndex];
    const supabase = createClient();
    const first = await supabase.from("product_images").update({ sort_order: target.sort_order }).eq("id", current.id);
    const second = await supabase.from("product_images").update({ sort_order: current.sort_order }).eq("id", target.id);
    if (first.error || second.error) {
      setMessage("Não foi possível alterar a ordem das fotografias.");
    } else {
      setImages((items) => {
        const copy = [...items];
        [copy[index], copy[targetIndex]] = [copy[targetIndex], copy[index]];
        return copy.map((image, position) => ({ ...image, sort_order: position }));
      });
      setMessage("Ordem das fotografias atualizada.");
      router.refresh();
    }
    setBusy(false);
  }

  async function removeImage(image: ProductImage) {
    if (!window.confirm("Tem a certeza de que pretende remover esta fotografia?")) return;
    setBusy(true);
    setMessage("");
    const supabase = createClient();

    if (image.storage_path) {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([image.storage_path]);
      if (storageError) {
        setMessage("Não foi possível remover o ficheiro. A fotografia foi mantida no catálogo.");
        setBusy(false);
        return;
      }
    }

    const { error } = await supabase.from("product_images").delete().eq("id", image.id).eq("product_id", productId);
    if (error) {
      setMessage("O ficheiro foi removido, mas não foi possível atualizar o catálogo. Atualize a página.");
    } else {
      const remaining = images.filter((item) => item.id !== image.id);
      if (image.is_primary && remaining[0]) {
        const { error: primaryError } = await supabase.from("product_images").update({ is_primary: true }).eq("id", remaining[0].id);
        if (!primaryError) remaining[0] = { ...remaining[0], is_primary: true };
      }
      setImages(remaining);
      setMessage("Fotografia removida.");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="mt-3 border-t border-pink-100 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-berry">Fotografias ({images.length})</p>
        <label className="btn btn-light cursor-pointer text-xs">
          {busy ? "Aguarde..." : "Adicionar fotografias"}
          <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={busy} onChange={uploadFiles} />
        </label>
      </div>
      <p className="muted mt-1 text-xs">JPG, PNG, WEBP ou GIF · até 5 MB por imagem.</p>
      {message ? <p className="mt-2 text-xs text-berry" role="status">{message}</p> : null}
      {images.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div key={image.id} className="overflow-hidden rounded-xl border border-pink-100">
              {image.image_url ? <img src={image.image_url} alt={image.alt_text || productName} className="h-28 w-full object-cover" /> : <div className="flex h-28 items-center justify-center bg-pink-50">Sem imagem</div>}
              <div className="space-y-2 p-2">
                {image.is_primary ? <span className="pill">Principal</span> : <button type="button" disabled={busy} onClick={() => makePrimary(image.id)} className="text-xs font-bold text-berry underline">Definir como principal</button>}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" disabled={busy || index === 0} onClick={() => moveImage(index, -1)} className="font-bold text-stone-600 disabled:opacity-30">←</button>
                  <button type="button" disabled={busy || index === images.length - 1} onClick={() => moveImage(index, 1)} className="font-bold text-stone-600 disabled:opacity-30">→</button>
                  <button type="button" disabled={busy} onClick={() => removeImage(image)} className="ml-auto font-bold text-red-600">Remover</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="muted mt-3 text-sm">Ainda não há fotografias para este produto.</p>}
    </div>
  );
}
