import styles from "../AdminDashboard.module.css";
import { inventoryItems } from "../../shared/demoData.js";
export default function AdminLowStockPage(){
  const lowItems=inventoryItems.filter(item=>item.physical-item.reserved<=item.threshold);
  return <section className={styles.panel}>
    <div className={styles.panelHead}><div><h2>Ingredients requiring attention</h2><p>Available quantities at or below configured reorder thresholds.</p></div><span className={styles.alertPill}>{lowItems.length} active alerts</span></div>
    {lowItems.length ? lowItems.map(item=><article className={styles.alertRow} key={item.name}><span className={styles.alertIcon}>!</span><div><b>{item.name}</b><small>{item.physical-item.reserved} {item.unit} available · reorder threshold {item.threshold} {item.unit}</small></div><span className={styles.low}>Reorder needed</span></article>) : <div className={styles.emptyState}>No ingredients are currently below their reorder thresholds.</div>}
    <p className={styles.demoNote}>These alerts are calculated from illustrative stock data. Live alerts will use backend inventory availability.</p>
  </section>;
}
