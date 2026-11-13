"use server";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const statuses=["Pendente","Confirmada","Em produção","Concluída","Entregue","Cancelada"] as const;

export async function createOrder(formData:FormData){
 const {supabase}=await requireAdmin();
 const customerName=String(formData.get("customer_name")||"").trim();
 const customerPhone=String(formData.get("customer_phone")||"").trim();
 const productId=String(formData.get("product_id")||"").trim();
 const variantName=String(formData.get("variant_name")||"").trim();
 const quantity=Number(formData.get("quantity")||1);
 const unitPrice=Number(String(formData.get("unit_price")||"").replace(",","."));
 const customizations=String(formData.get("customizations")||"").trim();
 const notes=String(formData.get("notes")||"").trim();
 if(!customerName||customerName.length>120||!customerPhone||customerPhone.length>40||!productId||!Number.isInteger(quantity)||quantity<1||quantity>10000||!Number.isFinite(unitPrice)||unitPrice<0||unitPrice>1000000) redirect("/admin/encomendas?error=invalid");
 const {data:product,error:productError}=await supabase.from("products").select("id,name").eq("id",productId).maybeSingle();
 if(productError||!product) redirect("/admin/encomendas?error=invalid");
 const unitPriceCents=Math.round(unitPrice*100);
 const {error}=await supabase.from("orders").insert({
  customer_name:customerName,customer_phone:customerPhone,product_name:product.name,
  variant_name:variantName||null,quantity,unit_price_cents:unitPriceCents,
  total_price_cents:unitPriceCents*quantity,
  customizations:customizations?{details:customizations}:{},notes:notes||null
 });
 if(error) redirect("/admin/encomendas?error=save");
 revalidatePath("/admin/encomendas");
 redirect("/admin/encomendas?saved=1");
}

export async function updateOrderStatus(formData:FormData){
 const {supabase}=await requireAdmin();
 const id=String(formData.get("id")||"").trim();
 const status=String(formData.get("status")||"");
 if(!id||!statuses.includes(status as typeof statuses[number])) redirect("/admin/encomendas?error=status");
 const {data,error}=await supabase.from("orders").update({status,updated_at:new Date().toISOString()}).eq("id",id).select("id").maybeSingle();
 if(error||!data) redirect("/admin/encomendas?error=status");
 revalidatePath("/admin/encomendas");
 redirect("/admin/encomendas?updated=1");
}
