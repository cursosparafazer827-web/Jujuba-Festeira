"use server";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
function slugify(s:string){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
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

export async function saveVariant(formData:FormData){
 const {supabase}=await requireAdmin();
 const id=String(formData.get("id")||"").trim();
 const productId=String(formData.get("product_id")||"").trim();
 const name=String(formData.get("name")||"").trim();
 const sku=String(formData.get("sku")||"").trim()||null;
 const price=Number(String(formData.get("price")||"").replace(",","."));
 const sortOrder=Number(formData.get("sort_order")||0);
 const rawAttributes=String(formData.get("attributes")||"{}").trim()||"{}";
 if(!productId||!name||name.length>120||(sku!==null&&sku.length>80)||!Number.isFinite(price)||price<0||price>1000000||!Number.isInteger(sortOrder)||sortOrder<0||sortOrder>100000) redirect("/admin?error=variant_invalid");
 let parsed:unknown;
 try { parsed=JSON.parse(rawAttributes); } catch { redirect("/admin?error=variant_attributes"); }
 if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)) redirect("/admin?error=variant_attributes");
 const attributes=parsed as Record<string,unknown>;
 const {data:product,error:productError}=await supabase.from("products").select("id").eq("id",productId).maybeSingle();
 if(productError||!product) redirect("/admin?error=variant_invalid");
 const payload={product_id:productId,name,sku,price_cents:Math.round(price*100),attributes,is_active:id?formData.get("is_active")==="on":true,sort_order:sortOrder,updated_at:new Date().toISOString()};
 const result=id
  ? await supabase.from("product_variants").update(payload).eq("id",id).eq("product_id",productId).select("id").maybeSingle()
  : await supabase.from("product_variants").insert(payload).select("id").maybeSingle();
 if(result.error){
  if(result.error.code==="23505") redirect("/admin?error=variant_sku");
  redirect("/admin?error=variant_save");
 }
 if(!result.data) redirect("/admin?error=variant_save");
 revalidatePath("/");
 revalidatePath("/admin");
 redirect("/admin?variant_saved=1");
}
export async function deleteVariant(formData:FormData){
 const {supabase}=await requireAdmin();
 const id=String(formData.get("id")||"").trim();
 const productId=String(formData.get("product_id")||"").trim();
 const confirmation=String(formData.get("confirmation")||"").trim();
 if(!id||!productId) redirect("/admin?error=variant_invalid");
 if(confirmation!=="APAGAR") redirect("/admin?error=variant_confirm");
 const {data:variant,error:variantError}=await supabase.from("product_variants").select("id,product_id").eq("id",id).eq("product_id",productId).maybeSingle();
 if(variantError||!variant) redirect("/admin?error=variant_delete");
 const {data:deleted,error}=await supabase.from("product_variants").delete().eq("id",id).eq("product_id",productId).select("id").maybeSingle();
 if(error||!deleted) redirect("/admin?error=variant_delete");
 revalidatePath("/");
 revalidatePath("/admin");
 redirect("/admin?variant_deleted=1");
}
export async function logoutAction(){const {supabase}=await requireAdmin();await supabase.auth.signOut();redirect("/admin/login");}

export async function saveCustomizationField(formData:FormData){
 const {supabase}=await requireAdmin();
 const productId=String(formData.get("product_id")||"").trim();
 const label=String(formData.get("label")||"").trim();
 const fieldType=String(formData.get("field_type")||"");
 const rawOptions=String(formData.get("options")||"");
 const helpText=String(formData.get("help_text")||"").trim();
 const sortOrder=Number(formData.get("sort_order")||0);
 const isRequired=formData.get("is_required")==="on";
 const options=rawOptions.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
 const fieldKey=label.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
 if(!productId||!label||label.length>100||!["select","radio","checkbox"].includes(fieldType)||options.length<2||options.length>30||options.some(value=>value.length>80)||new Set(options.map(value=>value.toLowerCase())).size!==options.length||!Number.isInteger(sortOrder)||sortOrder<0||sortOrder>100000||!fieldKey) redirect("/admin?error=customization_invalid");
 const {data:product,error:productError}=await supabase.from("products").select("id").eq("id",productId).maybeSingle();
 if(productError||!product) redirect("/admin?error=customization_invalid");
 const {data:existing,error:existingError}=await supabase.from("customization_fields").select("id").eq("product_id",productId).eq("field_key",fieldKey).maybeSingle();
 if(existingError) redirect("/admin?error=customization_save");
 if(existing) redirect("/admin?error=customization_duplicate");
 const {error}=await supabase.from("customization_fields").insert({product_id:productId,label,field_key:fieldKey,field_type:fieldType,is_required:isRequired,placeholder:null,help_text:helpText||null,options,sort_order:sortOrder,is_active:true});
 if(error) redirect("/admin?error=customization_save");
 revalidatePath("/");
 revalidatePath("/admin");
 revalidatePath("/produto/[slug]");
 redirect("/admin?customization_saved=1");
}


export async function updateCustomizationField(formData:FormData){
 const {supabase}=await requireAdmin();
 const id=String(formData.get("id")||"").trim();
 const productId=String(formData.get("product_id")||"").trim();
 const label=String(formData.get("label")||"").trim();
 const fieldType=String(formData.get("field_type")||"");
 const rawOptions=String(formData.get("options")||"");
 const helpText=String(formData.get("help_text")||"").trim();
 const sortOrder=Number(formData.get("sort_order")||0);
 const isRequired=formData.get("is_required")==="on";
 const isActive=formData.get("is_active")==="on";
 const options=rawOptions.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
 const fieldKey=label.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
 if(!id||!productId||!label||label.length>100||!["select","radio","checkbox"].includes(fieldType)||options.length<2||options.length>30||options.some(value=>value.length>80)||new Set(options.map(value=>value.toLowerCase())).size!==options.length||!Number.isInteger(sortOrder)||sortOrder<0||sortOrder>100000||!fieldKey) redirect("/admin?error=customization_invalid");
 const {data:existing,error:existingError}=await supabase.from("customization_fields").select("id").eq("product_id",productId).eq("field_key",fieldKey).neq("id",id).maybeSingle();
 if(existingError) redirect("/admin?error=customization_save");
 if(existing) redirect("/admin?error=customization_duplicate");
 const {data:updated,error}=await supabase.from("customization_fields").update({label,field_key:fieldKey,field_type:fieldType,is_required:isRequired,help_text:helpText||null,options,sort_order:sortOrder,is_active:isActive}).eq("id",id).eq("product_id",productId).select("id").maybeSingle();
 if(error||!updated) redirect("/admin?error=customization_save");
 revalidatePath("/");
 revalidatePath("/admin");
 revalidatePath("/produto/[slug]");
 redirect("/admin?customization_saved=1");
}

export async function deleteCustomizationField(formData:FormData){
 const {supabase}=await requireAdmin();
 const id=String(formData.get("id")||"").trim();
 const productId=String(formData.get("product_id")||"").trim();
 const confirmation=String(formData.get("confirmation")||"").trim();
 if(!id||!productId) redirect("/admin?error=customization_delete");
 if(confirmation!=="APAGAR") redirect("/admin?error=customization_confirm");
 const {data:deleted,error}=await supabase.from("customization_fields").delete().eq("id",id).eq("product_id",productId).select("id").maybeSingle();
 if(error||!deleted) redirect("/admin?error=customization_delete");
 revalidatePath("/");
 revalidatePath("/admin");
 revalidatePath("/produto/[slug]");
 redirect("/admin?customization_deleted=1");
}
