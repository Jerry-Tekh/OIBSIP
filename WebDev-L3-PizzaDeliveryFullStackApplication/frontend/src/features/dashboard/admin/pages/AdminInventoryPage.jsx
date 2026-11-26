import { useMemo, useState } from "react";
import styles from "../AdminDashboard.module.css";
import { inventoryItems } from "../../shared/demoData.js";

export default function AdminInventoryPage() {
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState("all");
  const items = useMemo(() => inventoryItems.filter(item => {
    const available = item.physical - item.reserved;
    const isLow = available <= item.threshold;
    return (!query || [item.name, item.category].some(value => value.toLowerCase().includes(query.toLowerCase()))) &&
      (health === "all" || (health === "low" ? isLow : !isLow));
  }), [query, health]);
  const lowCount = inventoryItems.filter(item => item.physical - item.reserved <= item.threshold).length;

  return <section className={styles.panel}>
    <div className={styles.panelHead}><div><h2>Ingredient stock</h2><p>Available quantity is physical stock less active reservations.</p></div><span className={styles.pageMeta}>{inventoryItems.length} demo ingredients · {lowCount} need attention</span></div>
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        {[["all","All stock"],["low","Low stock"],["healthy","Healthy"]].map(([value,label])=><button key={value} type="button" aria-pressed={health===value} onClick={()=>setHealth(value)} className={`${styles.filterButton} ${health===value?styles.filterActive:""}`}>{label}</button>)}
      </div>
      <input className={styles.searchInput} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search ingredients…" aria-label="Search inventory"/>
    </div>
    <div className={styles.tableWrap}><table><thead><tr><th>Ingredient</th><th>Category</th><th>Physical</th><th>Reserved</th><th>Available</th><th>Threshold</th><th>Health</th></tr></thead><tbody>
      {items.map(item => { const available = item.physical - item.reserved; const low = available <= item.threshold; return <tr key={item.name}><td><b>{item.name}</b></td><td>{item.category}</td><td>{item.physical} {item.unit}</td><td>{item.reserved} {item.unit}</td><td><b>{available} {item.unit}</b></td><td>{item.threshold} {item.unit}</td><td><span className={low?styles.low:styles.healthy}>{low?"Low stock":"Healthy"}</span></td></tr>; })}
    </tbody></table>{items.length===0&&<div className={styles.emptyState}>No ingredients match those filters.</div>}</div>
    <p className={styles.demoNote}>Illustrative inventory only. Stock adjustments, reservations and restocking will be connected to inventory APIs.</p>
  </section>;
}
