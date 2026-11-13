"use server";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
function slugify(s:string){return s.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
export async function saveProduct(formData:FormData){
 const {supabase}=await requireAdmin();
 const id=String(formData.get("id")||""); const name=String(formData.get("name")||"").trim(); const price=Number(String(formData.get("price")||"").replace(",",".")); const categoryId=String(formData.get("category_id")||"");
 if(!name||!Number.isFinite(price)||price<0||price>1000000) redirect("/admin?error=invalid");
 const payload={name,slug:slugify(String(formData.get("slug")||name)),short_description:String(formData.get("short_description")||"").trim()||null,description:String(formData.get("description")||"").trim()||null,base_price_cents:Math.round(price*100),category_id:categoryId||null,is_active:formData.get("is_active")==="on",is_featured:formData.get("is_featured")==="on",updated_at:new Date().toISOString()};
 const result=id?await supabase.from("products").update(payload).eq("id",id):await supabase.from("products").insert(payload);
 if(result.error) redirect("/admin?error=save");
 revalidatePath("/");revalidatePath("/admin");redirect("/admin?saved=1");
}
export async function toggleProduct(formData:FormData){const {supabase}=await requireAdmin();const id=String(formData.get("id")||"");const active=String(formData.get("active"))==="true";if(!id)redirect("/admin?error=invalid");const {error}=await supabase.from("products").update({is_active:active,updated_at:new Date().toISOString()}).eq("id",id);if(error)redirect("/admin?error=save");revalidatePath("/");revalidatePath("/admin");redirect("/admin?saved=1");}
export async function deleteProduct(formData:FormData){
 const {supabase}=await requireAdmin();
 const id=String(formData.get("id")||"").trim();
 const confirmation=String(formData.get("confirmation")||"").trim();
 if(!id) redirect("/admin?error=invalid");
 if(confirmation!=="APAGAR") redirect("/admin?error=confirm_delete");
 const {data:product,error:productError}=await supabase.from("products").select("id,is_active").eq("id",id).maybeSingle();
 if(productError||!product) redirect("/admin?error=delete");
 if(product.is_active) redirect("/admin?error=active_delete");
 const relatedTables=["product_variants","product_images","customization_fields","product_options"] as const;
 const checks=await Promise.all(relatedTables.map(table=>supabase.from(table).select("id",{count:"exact",head:true}).eq("product_id",id)));
 if(checks.some(check=>check.error)) redirect("/admin?error=delete");
 if(checks.some(check=>(check.count||0)>0)) redirect("/admin?error=has_dependencies");
 const {data:deleted,error}=await supabase.from("products").delete().eq("id",id).eq("is_active",false).select("id").maybeSingle();
 if(error||!deleted) redirect("/admin?error=delete");
 revalidatePath("/");revalidatePath("/admin");redirect("/admin?deleted=1");
}
export async function logoutAction(){const {supabase}=await requireAdmin();await supabase.auth.signOut();redirect("/admin/login");}