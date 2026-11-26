import { useMemo, useState } from "react";
import styles from "../CustomerDashboard.module.css";
import { customerOrders, money, statusLabel } from "../../shared/demoData.js";

const filters = ["All orders", "In progress", "Delivered"];
export default function CustomerOrdersPage() {
  const [filter,setFilter] = useState("All orders");
  const orders = useMemo(() => customerOrders.filter(order => filter === "All orders" || (filter === "Delivered" ? order.status === "delivered" : order.status !== "delivered")), [filter]);
  return <div className={styles.orderPage}>
    <section className={styles.panel}>
      <div className={styles.panelHead}><div><h2>Your orders</h2><p>Keep track of every pizza you've ordered.</p></div><span className={styles.kicker}>{customerOrders.length} DEMO ORDERS</span></div>
      <div className={styles.orderFilters}>{filters.map(item=><button key={item} type="button" onClick={()=>setFilter(item)} className={`${styles.orderFilter} ${filter===item?styles.orderFilterActive:""}`} aria-pressed={filter===item}>{item}</button>)}</div>
      <div className={styles.orders}>{orders.length ? orders.map(o=><article className={styles.order} key={o.id}><div className={styles.orderIcon}>▧</div><div className={styles.orderInfo}><b>{o.id}</b><small>{o.date} · {o.items}</small></div><strong>{money(o.total)}</strong><span className={styles.status}>{statusLabel(o.status)}</span></article>) : <div className={styles.emptyState}>No orders match this filter yet.</div>}</div>
    </section>
    <p className={styles.demoNote}>These are illustrative orders for the dashboard preview. Live order history and tracking will be connected to the customer orders API.</p>
  </div>;
}
