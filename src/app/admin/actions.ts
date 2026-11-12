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
export async function logoutAction(){const {supabase}=await requireAdmin();await supabase.auth.signOut();redirect("/admin/login");}