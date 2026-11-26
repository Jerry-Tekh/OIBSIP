import { useNavigate } from "react-router-dom";
import styles from "../CustomerDashboard.module.css";
import { customerOrders, money, statusLabel } from "../../shared/demoData.js";

export default function CustomerOverviewPage() {
  const navigate = useNavigate();
  return <div className={styles.page}>
    <section className={styles.welcome}><div><span>GOOD FOOD IS A GOOD IDEA</span><h2>Something lovely<br/>is <em>on its way.</em></h2><p>Order your usual, or make room for a new favourite.</p><button onClick={() => navigate("/dashboard/menu")}>Order a pizza <b>↗</b></button></div><div className={styles.welcomeArt}><img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85" alt="Freshly baked pizza with herbs"/><span>MADE FRESH<br/>FOR YOU</span></div></section>
    <div className={styles.statGrid}><article><span className={styles.statIcon}>▤</span><small>Total orders</small><strong>12</strong><span>Since you joined</span></article><article><span className={styles.statIcon}>♡</span><small>Favourite order</small><strong>Margherita</strong><span>Your go-to classic</span></article><article><span className={styles.statIcon}>✳</span><small>Pizza points</small><strong>240 pts</strong><span>Keep earning with every order</span></article></div>
    <section className={styles.panel}><div className={styles.panelHead}><div><h2>Your recent orders</h2><p>Good memories, delivered.</p></div><button onClick={() => navigate("/dashboard/orders")}>See all orders ↗</button></div><div className={styles.orders}>{customerOrders.map(o=><article className={styles.order} key={o.id}><div className={styles.orderIcon}>▧</div><div className={styles.orderInfo}><b>{o.id}</b><small>{o.date} · {o.items}</small></div><strong>{money(o.total)}</strong><span className={styles.status}>{statusLabel(o.status)}</span></article>)}</div></section>
  </div>;
}
