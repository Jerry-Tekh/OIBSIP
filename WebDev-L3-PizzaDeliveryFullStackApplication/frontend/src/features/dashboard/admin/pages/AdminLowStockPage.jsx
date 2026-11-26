import {useEffect,useState} from "react";
import {getAccessToken} from "../../../auth/api/authApi.js";
import styles from "../AdminDashboard.module.css";
export default function AdminLowStockPage(){
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{const token=getAccessToken(),base=import.meta.env.VITE_API_BASE_URL||"";const response=await fetch(`${base}/api/v1/admin/inventory?page=1&limit=100&status=low`,{credentials:"include",headers:token?{Authorization:`Bearer ${token}`}:{}});const payload=await response.json();if(!response.ok||!payload.success)throw new Error(payload?.error?.message||payload?.message||"Unable to load stock alerts.");if(active)setItems(payload.data.items||[]);}catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false);}})();return()=>{active=false;};},[]);
 return <section className={styles.panel}><div className={styles.panelHead}><div><h2>Ingredients requiring attention</h2><p>Live available quantities at or below their configured reorder thresholds.</p></div><span className={styles.alertPill}>{items.length} active alerts</span></div>
 {error&&<p role="alert" className={styles.demoNote}>{error}</p>}{loading?<div className={styles.emptyState}>Checking stock levels…</div>:items.length?items.map(item=><article className={styles.alertRow} key={item._id}><span className={styles.alertIcon}>!</span><div><b>{item.name}</b><small>{item.availableStock} {item.unit} available · reorder threshold {item.lowStockThreshold} {item.unit}</small></div><span className={styles.low}>Reorder needed</span></article>):<div className={styles.emptyState}>No ingredients are currently below their reorder thresholds.</div>}
 <p className={styles.demoNote}>Alerts are derived from physical stock minus active reservations. Persistent alert records and notification delivery are a later operational milestone.</p></section>;
}
