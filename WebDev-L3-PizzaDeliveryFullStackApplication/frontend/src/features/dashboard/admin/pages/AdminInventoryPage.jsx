import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "../../../auth/api/authApi.js";
import styles from "../AdminDashboard.module.css";

const rawApiBase=import.meta.env.VITE_API_BASE_URL||"";\nconst API=rawApiBase.endsWith("/")?rawApiBase.slice(0,-1):rawApiBase;
const units=["g","kg","ml","l","piece","bunch","pack","portion"];
const emptyForm={name:"",sku:"",category:"",unit:"kg",initialStock:"",lowStockThreshold:"",notes:""};
const commonCategories=["Dairy","Meat","Seafood","Vegetables","Fruits","Dry Goods","Flour & Grains","Sauces","Herbs & Spices","Oils","Packaging"];
const commonIngredients=["Mozzarella cheese","Cheddar cheese","Parmesan cheese","Pizza flour","Tomato sauce","Pepperoni","Chicken breast","Beef","Red onions","Green bell pepper","Mushrooms","Black olives","Fresh basil","Oregano","Olive oil"];
function skuSuggestions(name,items){
 const stem=(name||"").normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-zA-Z0-9]/g,"").slice(0,3).toUpperCase()||"ING";
 const used=new Set(items.map(item=>(item.sku||"").toUpperCase()));
 const suggestions=[];
 for(let suffix=1;suggestions.length<3&&suffix<=9999;suffix+=1){
  const candidate=`${stem}-${String(suffix).padStart(3,"0")}`;
  if(!used.has(candidate))suggestions.push(candidate);
 }
 return suggestions;
}
async function api(path,{method="GET",body}={}){
 const token=getAccessToken();const response=await fetch(`${API}/api/v1/admin/inventory${path}`,{method,credentials:"include",headers:{"Accept":"application/json",...(body?{"Content-Type":"application/json"}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
 const payload=await response.json().catch(()=>({}));if(!response.ok||payload.success!==true)throw new Error(payload?.error?.message||payload?.message||"Inventory request failed.");return payload.data;
}
export default function AdminInventoryPage(){
 const [items,setItems]=useState([]);const [pagination,setPagination]=useState({page:1,pages:1,total:0});const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const [query,setQuery]=useState("");const [health,setHealth]=useState("all");const [showCreate,setShowCreate]=useState(false);const [form,setForm]=useState(emptyForm);const [saving,setSaving]=useState(false);
 const [adjusting,setAdjusting]=useState(null);const [adjustment,setAdjustment]=useState({adjustmentType:"restock",quantity:"",reason:""});
 const load=useCallback(async()=>{setLoading(true);setError("");try{const params=new URLSearchParams({page:String(page),limit:"20"});if(query.trim())params.set("search",query.trim());if(health==="low")params.set("status","low");if(health==="healthy")params.set("status","healthy");const data=await api("?"+params);setItems(data.items||[]);setPagination(data.pagination||{page,pages:1,total:0});}catch(e){setError(e.message);}finally{setLoading(false);}},[page,query,health]);
 useEffect(()=>{load();},[load]);
 const visible=items;
 const lowCount=items.filter(i=>i.isLowStock).length;
 const categorySuggestions=[...new Set([...commonCategories,...items.map(item=>item.category).filter(Boolean)])].sort((a,b)=>a.localeCompare(b));
 const ingredientSuggestions=[...new Set([...commonIngredients,...items.map(item=>item.name).filter(Boolean)])].sort((a,b)=>a.localeCompare(b));
 const suggestedSkus=skuSuggestions(form.name,items);
 async function createItem(event){event.preventDefault();setSaving(true);setError("");setNotice("");try{await api("",{method:"POST",body:{...form,initialStock:Number(form.initialStock),lowStockThreshold:Number(form.lowStockThreshold)}});setForm(emptyForm);setShowCreate(false);setNotice("Ingredient created and initial stock movement recorded.");await load();}catch(e){setError(e.message);}finally{setSaving(false);}}
 async function saveAdjustment(event){event.preventDefault();setSaving(true);setError("");setNotice("");try{await api(`/${adjusting._id}/adjustments`,{method:"POST",body:{...adjustment,quantity:Number(adjustment.quantity)}});setAdjusting(null);setAdjustment({adjustmentType:"restock",quantity:"",reason:""});setNotice("Stock adjustment saved and added to the movement ledger.");await load();}catch(e){setError(e.message);}finally{setSaving(false);}}
 return <section className={styles.panel}>
  <div className={styles.panelHead}><div><h2>Ingredient stock</h2><p>Track physical stock, reservations and available quantities.</p></div><button type="button" className={styles.textButton} onClick={()=>setShowCreate(v=>!v)}>{showCreate?"Close":"＋ Add ingredient"}</button></div>
  <div className={styles.filterBar}><div className={styles.filterGroup}>{[["all","All stock"],["low","Low stock"],["healthy","Healthy"]].map(([v,label])=><button key={v} type="button" aria-pressed={health===v} onClick={()=>{setPage(1);setHealth(v);}} className={`${styles.filterButton} ${health===v?styles.filterActive:""}`}>{label}</button>)}</div><input className={styles.searchInput} value={query} onChange={e=>{setPage(1);setQuery(e.target.value);}} placeholder="Search ingredients…" aria-label="Search inventory"/></div>
  {error&&<p role="alert" className={styles.demoNote}>{error}</p>}{notice&&<p role="status" className={styles.demoNote}>{notice}</p>}
  {showCreate&&<form onSubmit={createItem} className={styles.panel} style={{marginBottom:18,background:"#fffaf6"}}>
   <div className={styles.panelHead}><div><h2>Add inventory ingredient</h2><p>Initial stock is recorded as an auditable movement.</p></div></div>
   <div className={styles.filterBar}>
    <label className={styles.suggestionField}>Ingredient name
     <input required minLength="2" maxLength="100" list="inventory-ingredient-suggestions" autoComplete="off" className={styles.searchInput} placeholder="Start typing an ingredient…" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
     <datalist id="inventory-ingredient-suggestions">{ingredientSuggestions.map(name=><option key={name} value={name}/>)}</datalist>
    </label>
    <label className={styles.suggestionField}>SKU <span>(optional)</span>
     <input maxLength="40" list="inventory-sku-suggestions" autoComplete="off" className={styles.searchInput} placeholder="e.g. MOZ-001" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value.toUpperCase()})}/>
     <datalist id="inventory-sku-suggestions">{suggestedSkus.map(sku=><option key={sku} value={sku}/>)}</datalist>
     <small>Suggestions are based on the ingredient name. SKUs must be unique.</small>
    </label>
   </div>
   <div className={styles.filterBar}>
    <label className={styles.suggestionField}>Category
     <input required minLength="2" maxLength="60" list="inventory-category-suggestions" autoComplete="off" className={styles.searchInput} placeholder="Choose or type a category…" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
     <datalist id="inventory-category-suggestions">{categorySuggestions.map(category=><option key={category} value={category}/>)}</datalist>
    </label>
    <label className={styles.suggestionField}>Unit
     <select className={styles.searchInput} value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>{units.map(u=><option key={u}>{u}</option>)}</select>
    </label>
   </div>
   <div className={styles.filterBar}><input required type="number" min="0" step="0.001" className={styles.searchInput} placeholder="Initial physical stock" value={form.initialStock} onChange={e=>setForm({...form,initialStock:e.target.value})}/><input required type="number" min="0" step="0.001" className={styles.searchInput} placeholder="Low-stock threshold" value={form.lowStockThreshold} onChange={e=>setForm({...form,lowStockThreshold:e.target.value})}/></div>
   <input maxLength="500" className={styles.searchInput} placeholder="Notes (optional)" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/><button disabled={saving} className={styles.textButton}>{saving?"Saving…":"Save ingredient"}</button>
  </form>}
  {adjusting&&<form onSubmit={saveAdjustment} className={styles.panel} style={{marginBottom:18,background:"#fffaf6"}}><div className={styles.panelHead}><div><h2>Adjust {adjusting.name}</h2><p>Current physical stock: {adjusting.physicalStock} {adjusting.unit}. Reserved: {adjusting.reservedStock} {adjusting.unit}.</p></div><button type="button" className={styles.textButton} onClick={()=>setAdjusting(null)}>Close</button></div><div className={styles.filterBar}><select className={styles.searchInput} value={adjustment.adjustmentType} onChange={e=>setAdjustment({...adjustment,adjustmentType:e.target.value})}><option value="restock">Restock (+)</option><option value="waste">Waste (−)</option><option value="correction">Set physical count</option></select><input required type="number" min="0.001" step="0.001" className={styles.searchInput} placeholder={adjustment.adjustmentType==="correction"?"New physical stock":"Quantity"} value={adjustment.quantity} onChange={e=>setAdjustment({...adjustment,quantity:e.target.value})}/></div><input required minLength="3" maxLength="300" className={styles.searchInput} placeholder="Reason for this stock change" value={adjustment.reason} onChange={e=>setAdjustment({...adjustment,reason:e.target.value})}/><button disabled={saving} className={styles.textButton}>{saving?"Saving…":"Record adjustment"}</button></form>}
  <div className={styles.tableWrap}><table><thead><tr><th>Ingredient</th><th>Category</th><th>Physical</th><th>Reserved</th><th>Available</th><th>Threshold</th><th>Health</th><th>Action</th></tr></thead><tbody>
  {visible.map(item=><tr key={item._id}><td><b>{item.name}</b><small>{item.sku||"No SKU"}</small></td><td>{item.category}</td><td>{item.physicalStock} {item.unit}</td><td>{item.reservedStock} {item.unit}</td><td><b>{item.availableStock} {item.unit}</b></td><td>{item.lowStockThreshold} {item.unit}</td><td><span className={item.isLowStock?styles.low:styles.healthy}>{item.isLowStock?"Low stock":"Healthy"}</span></td><td><button type="button" className={styles.textButton} onClick={()=>setAdjusting(item)}>Adjust</button></td></tr>)}
  </tbody></table>{loading&&<div className={styles.emptyState}>Loading inventory…</div>}{!loading&&!visible.length&&<div className={styles.emptyState}>No inventory items match those filters.</div>}</div>
  <div className={styles.filterBar}><span className={styles.pageMeta}>{pagination.total||0} ingredients · {lowCount} low-stock items on this page · Page {pagination.page||page} of {Math.max(1,pagination.pages||1)}</span><div className={styles.filterGroup}><button type="button" className={styles.filterButton} disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><button type="button" className={styles.filterButton} disabled={page>=(pagination.pages||1)} onClick={()=>setPage(p=>p+1)}>Next</button></div></div>
 </section>;
}
