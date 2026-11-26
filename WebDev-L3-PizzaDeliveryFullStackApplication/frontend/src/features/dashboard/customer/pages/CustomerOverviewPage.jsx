import { Link, useNavigate } from "react-router-dom";
import styles from "../CustomerDashboard.module.css";
import { customerOrders, money, statusLabel } from "../../shared/demoData.js";

export default function CustomerOverviewPage() {
  const navigate = useNavigate();
  return <div className={styles.page}>
    <section className={styles.welcome}>
      <div className={styles.welcomeCopy}>
        <span>YOUR NEXT FAVOURITE IS WAITING</span>
        <h2>Good food.<br/><em>Good mood.</em></h2>
        <p>Freshly made, beautifully topped and delivered with a little extra love. What are you craving today?</p>
        <button onClick={() => navigate("/dashboard/menu")}>Explore the menu <b>↗</b></button>
      </div>
      <div className={styles.welcomeArt}><img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85" alt="Freshly baked pizza with herbs"/><span>BAKED FRESH<br/>JUST FOR YOU</span></div>
    </section>
    <div className={styles.quickStats}>
      <article className={styles.statCard}><span className={styles.statIcon}>▤</span><div><small>Total orders</small><strong>12</strong><span>Your pizza journey so far</span></div></article>
      <article className={styles.statCard}><span className={styles.statIcon}>♡</span><div><small>Favourite pizza</small><strong>Margherita</strong><span>A classic for a reason</span></div></article>
      <article className={styles.statCard}><span className={styles.statIcon}>✳</span><div><small>Pizza points</small><strong>240 pts</strong><span>More orders, more rewards</span></div></article>
    </div>
    <div className={styles.contentGrid}>
      <section className={styles.panel}>
        <div className={styles.panelHead}><div><h2>Your recent orders</h2><p>A little something to look back on.</p></div><Link to="/dashboard/orders">View all ↗</Link></div>
        <div className={styles.orders}>{customerOrders.slice(0,3).map(o=><article className={styles.order} key={o.id}><div className={styles.orderIcon}>▧</div><div className={styles.orderInfo}><b>{o.id}</b><small>{o.date} · {o.items}</small></div><strong>{money(o.total)}</strong><span className={styles.status}>{statusLabel(o.status)}</span></article>)}</div>
      </section>
      <aside className={styles.tip}><span>✦</span><b>A little treat, just because.</b><p>Build your own pizza with the toppings you love. Your perfect combination is only a few clicks away.</p><Link to="/dashboard/menu">Make it yours ↗</Link></aside>
    </div>
  </div>;
}
