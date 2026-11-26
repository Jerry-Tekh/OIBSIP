import { useMemo, useState } from "react";
import styles from "../AdminDashboard.module.css";
import { recentOrders, money, statusLabel } from "../../shared/demoData.js";

const filters = [
  { label: "All orders", value: "all" },
  { label: "New", value: "order_received" },
  { label: "In kitchen", value: "in_kitchen" },
  { label: "Out for delivery", value: "sent_to_delivery" },
  { label: "Delivered", value: "delivered" }
];

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const orders = useMemo(() => recentOrders.filter(order => {
    const matchesStatus = filter === "all" || order.status === filter;
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [order.id, order.customer, order.items].some(value => value.toLowerCase().includes(term));
    return matchesStatus && matchesQuery;
  }), [filter, query]);

  return <section className={styles.panel}>
    <div className={styles.panelHead}>
      <div><h2>Order queue</h2><p>Review customer orders and their current fulfilment stage.</p></div>
      <span className={styles.pageMeta}>{orders.length} shown · demo records</span>
    </div>
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>{filters.map(item => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)} className={`${styles.filterButton} ${filter === item.value ? styles.filterActive : ""}`}>{item.label}</button>)}</div>
      <input className={styles.searchInput} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order, customer or item…" aria-label="Search orders"/>
    </div>
    <div className={styles.tableWrap}><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead><tbody>
      {orders.map(order => <tr key={order.id}><td><b>{order.id}</b></td><td>{order.customer}</td><td>{order.items}</td><td><b>{money(order.amount)}</b></td><td><span className={`${styles.status} ${styles[order.status] || ""}`}>{statusLabel(order.status)}</span></td><td>{order.time}</td></tr>)}
    </tbody></table>{orders.length === 0 && <div className={styles.emptyState}>No demo orders match your search.</div>}</div>
    <p className={styles.demoNote}>Demo order records only. Live order management and status updates require the admin orders API.</p>
  </section>;
}
