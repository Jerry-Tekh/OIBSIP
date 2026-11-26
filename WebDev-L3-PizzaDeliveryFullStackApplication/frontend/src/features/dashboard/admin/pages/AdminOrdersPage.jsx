import {useNavigate} from "react-router-dom";
import styles from "../AdminDashboard.module.css";
export default function AdminOrdersPage(){
 const navigate=useNavigate();
 return <section className={styles.panel}>
  <div className={styles.panelHead}><div><h2>Order management</h2><p>Customer order review and fulfilment operations</p></div><span className={styles.alertPill}>Not connected</span></div>
  <div className={styles.emptyState}>Live order management is not implemented yet.</div>
  <p className={styles.demoNote}>This workspace previously displayed hard-coded sample orders. Those fabricated records have been removed. The backend order model and lifecycle service are placeholders, so real order lists, customer details, payment totals, status changes and revenue reporting must wait until the order APIs are implemented.</p>
  <button type="button" className={styles.outlineButton} onClick={()=>navigate("/admin/products")}>Manage pizza products</button>
 </section>;
}