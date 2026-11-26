import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {getAccessToken} from "../../../auth/api/authApi.js";
import styles from "../AdminDashboard.module.css";
const rawApiBase=import.meta.env.VITE_API_BASE_URL||"";
const API=rawApiBase.endsWith("/")?rawApiBase.slice(0,-1):rawApiBase;
async function get(path){const token=getAccessToken();const response=await fetch(API+path,{credentials:"include",headers:token?{Authorization:"Bearer "+token}:{}});const payload=await response.json().catch(()=>({}));if(!response.ok||payload.success!==true)throw new Error(payload?.error?.message||payload?.message||"Unable to load operations data.");return payload.data;}
export default function AdminOverviewPage(){
 const navigate=useNavigate();
 const [lowItems,setLowItems]=useState([]);
 const [inventoryTotal,setInventoryTotal]=useState(0);
 const [lowTotal,setLowTotal]=useState(0);
 const [productTotal,setProductTotal]=useState(0);
 const [publishedTotal,setPublishedTotal]=useState(0);
 const [draftTotal,setDraftTotal]=useState(0);
 const [archivedTotal,setArchivedTotal]=useState(0);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{
  const [inventory,low,published,drafts,archived,allProducts]=await Promise.all([
   get("/api/v1/admin/inventory?page=1&limit=1"),
   get("/api/v1/admin/inventory?page=1&limit=6&status=low"),
   get("/api/v1/products/admin?page=1&limit=1&status=published"),
   get("/api/v1/products/admin?page=1&limit=1&status=draft"),
   get("/api/v1/products/admin?page=1&limit=1&status=archived"),
   get("/api/v1/products/admin?page=1&limit=1")
  ]);
  if(active){setInventoryTotal(inventory.pagination?.total||0);setLowItems(low.items||[]);setLowTotal(low.pagination?.total||0);setPublishedTotal(published.pagination?.total||0);setDraftTotal(drafts.pagination?.total||0);setArchivedTotal(archived.pagination?.total||0);setProductTotal(allProducts.pagination?.total||0);}
 }catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[]);
 return <div className={styles.dashboard}>
  {error&&<p role="alert" className={styles.demoNote}>{error}</p>}
  <div className={styles.statGrid}>
   {[
    ["Inventory ingredients",inventoryTotal,"Live inventory records","orange"],
    ["Low-stock ingredients",lowTotal,"Requires replenishment review","red"],
    ["Pizza products",productTotal,"All catalogue records","purple"],
    ["Published products",publishedTotal,"All published products","green"]
   ].map(([label,value,note,tone])=><article className={styles.statCard} key={label}><div className={styles.statTop}><span>{label}</span><i className={styles[tone]}>●</i></div><strong>{loading?"—":value}</strong><div className={styles.statFoot}><span>{note}</span></div></article>)}
  </div>
  <div className={styles.bottomGrid}>
   <section className={styles.panel}><div className={styles.panelHead}><div><h2>Inventory watch</h2><p>Live ingredients currently at or below their reorder threshold</p></div><button className={styles.textButton} onClick={()=>navigate("/admin/inventory")}>Manage stock ↗</button></div>
    {loading?<div className={styles.emptyState}>Loading inventory…</div>:lowItems.length?lowItems.map(item=><div className={styles.stockRow} key={item._id}><div><strong>{item.name}</strong><small>{item.category}</small></div><div className={styles.stockMeter}><span style={{width:"100%"}}/></div><b>{item.availableStock} {item.unit}</b></div>):<div className={styles.emptyState}>No low-stock ingredients require attention.</div>}
    <p className={styles.demoNote}>Showing {lowItems.length} of {lowTotal} low-stock ingredients. Open inventory to review and page through the full list.</p>
   </section>
   <section className={styles.panel}><div className={styles.panelHead}><div><h2>Product publishing</h2><p>Complete server-reported catalogue counts</p></div><button className={styles.textButton} onClick={()=>navigate("/admin/products")}>Manage products ↗</button></div>
    <div className={styles.stockRow}><div><strong>Published</strong><small>Visible or temporarily unavailable</small></div><b>{loading?"—":publishedTotal}</b></div>
    <div className={styles.stockRow}><div><strong>Drafts</strong><small>Not visible to customers</small></div><b>{loading?"—":draftTotal}</b></div>
    <div className={styles.stockRow}><div><strong>Archived</strong><small>Retired catalogue records</small></div><b>{loading?"—":archivedTotal}</b></div>
   </section>
  </div>
  <section className={styles.panel}><div className={styles.panelHead}><div><h2>Order operations</h2><p>Live order reporting is not available yet</p></div><span className={styles.alertPill}>Not connected</span></div><p className={styles.demoNote}>The order model and lifecycle service are still placeholders. This dashboard intentionally does not display fabricated revenue, order totals, customer names or order statuses. Connect the order lifecycle and reporting APIs before enabling live order operations.</p><button className={styles.outlineButton} onClick={()=>navigate("/admin/orders")}>View order workspace</button></section>
 </div>;
}
