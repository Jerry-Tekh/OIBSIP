import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {getAccessToken} from "../../../auth/api/authApi.js";
import styles from "../AdminDashboard.module.css";
const rawApiBase=import.meta.env.VITE_API_BASE_URL||"";
const API=rawApiBase.endsWith("/")?rawApiBase.slice(0,-1):rawApiBase;
async function get(path){const token=getAccessToken();const response=await fetch(API+path,{credentials:"include",headers:token?{Authorization:"Bearer "+token}:{}});const payload=await response.json().catch(()=>({}));if(!response.ok||payload.success!==true)throw new Error(payload?.error?.message||payload?.message||"Unable to load operations data.");return payload.data;}
export default function AdminOverviewPage(){
 const navigate=useNavigate();const [inventory,setInventory]=useState([]),[products,setProducts]=useState([]),[inventoryTotal,setInventoryTotal]=useState(0),[lowTotal,setLowTotal]=useState(0),[productTotal,setProductTotal]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{const [stock,low,productData]=await Promise.all([get("/api/v1/admin/inventory?page=1&limit=100"),get("/api/v1/admin/inventory?page=1&limit=1&status=low"),get("/api/v1/products/admin?page=1&limit=100")]);if(active){setInventory(stock.items||[]);setInventoryTotal(stock.pagination?.total||0);setLowTotal(low.pagination?.total||0);setProducts(productData.products||[]);setProductTotal(productData.pagination?.total||0);}}catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[]);
 const published=products.filter(p=>p.publicationStatus==="published").length,drafts=products.filter(p=>p.publicationStatus==="draft").length,unavailable=products.filter(p=>p.publicationStatus==="published"&&!p.isAvailable).length;
 return <div className={styles.dashboard}>
 {error&&<p role="alert" className={styles.demoNote}>{error}</p>}
 <div className={styles.statGrid}>
  {[["Inventory ingredients",loading?"—":inventoryTotal,"Live inventory records","orange"],["Low-stock ingredients",loading?"—":lowTotal,"Requires replenishment review","red"],["Pizza products",loading?"—":productTotal,"Sellable catalogue records","purple"],["Published products",loading?"—":published,"Published products in loaded catalogue","green"]].map(([label,value,note,tone])=><article className={styles.statCard} key={label}><div className={styles.statTop}><span>{label}</span><i className={styles[tone]}>●</i></div><strong>{value}</strong><div className={styles.statFoot}><span>{note}</span></div></article>)}
 </div>
 <div className={styles.bottomGrid}>
  <section className={styles.panel}><div className={styles.panelHead}><div><h2>Inventory watch</h2><p>Live stock records from the inventory service</p></div><button className={styles.textButton} onClick={()=>navigate("/admin/inventory")}>Manage stock ↗</button></div>
   {loading?<div className={styles.emptyState}>Loading inventory…</div>:inventory.filter(i=>i.isLowStock).slice(0,6).map(i=><div className={styles.stockRow} key={i._id}><div><strong>{i.name}</strong><small>{i.category}</small></div><div className={styles.stockMeter}><span style={{width:"100%"}}/></div><b>{i.availableStock} {i.unit}</b></div>)}
   {!loading&&!inventory.some(i=>i.isLowStock)&&<div className={styles.emptyState}>No low-stock items in the loaded inventory records.</div>}
   <p className={styles.demoNote}>Showing up to 100 inventory records. Low-stock count above is the server-reported total.</p>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><div><h2>Product publishing</h2><p>Publishing status for the first 100 products loaded</p></div><button className={styles.textButton} onClick={()=>navigate("/admin/products")}>Manage products ↗</button></div>
   <div className={styles.stockRow}><div><strong>Published</strong><small>Visible or temporarily unavailable</small></div><b>{published}</b></div>
   <div className={styles.stockRow}><div><strong>Drafts</strong><small>Not visible to customers</small></div><b>{drafts}</b></div>
   <div className={styles.stockRow}><div><strong>Temporarily unavailable</strong><small>Published but hidden from storefront</small></div><b>{unavailable}</b></div>
   <div className={styles.stockRow}><div><strong>Archived</strong><small>Retired catalogue records</small></div><b>{products.filter(p=>p.publicationStatus==="archived").length}</b></div>
  </section>
 </div>
 <section className={styles.panel}><div className={styles.panelHead}><div><h2>Order operations</h2><p>Live order reporting is not available yet</p></div><span className={styles.alertPill}>Not connected</span></div><p className={styles.demoNote}>The order model and lifecycle service are still placeholders. This dashboard intentionally does not display fabricated revenue, order totals, customer names or order statuses. Connect the order lifecycle and reporting APIs before enabling live order operations.</p><button className={styles.outlineButton} onClick={()=>navigate("/admin/orders")}>View order workspace</button></section>
 </div>;
}
