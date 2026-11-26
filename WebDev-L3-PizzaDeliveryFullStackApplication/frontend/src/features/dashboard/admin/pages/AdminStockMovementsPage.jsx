import styles from "../AdminDashboard.module.css";
const rows=[
  ["Mozzarella cheese","Restock","+ 12 kg","Supplier delivery","Today, 10:42 AM"],
  ["Pepperoni","Reservation","− 2 kg","Order allocation","Today, 10:18 AM"],
  ["Pizza flour","Adjustment","+ 5 kg","Stock count correction","Yesterday"],
  ["Fresh basil","Consumption","− 3 bunches","Kitchen preparation","Yesterday"]
];
const typeClass = type => ({Restock:styles.restock,Reservation:styles.reservation,Adjustment:styles.adjustment,Consumption:styles.consumption}[type] || "");
export default function AdminStockMovementsPage(){return <section className={styles.panel}>
  <div className={styles.panelHead}><div><h2>Movement history</h2><p>Review stock changes, their quantities and recorded reasons.</p></div><span className={styles.pageMeta}>{rows.length} sample movements</span></div>
  <div className={styles.tableWrap}><table><thead><tr><th>Ingredient</th><th>Movement</th><th>Quantity</th><th>Reason</th><th>Recorded</th></tr></thead><tbody>{rows.map(row=><tr key={row.join()}><td><b>{row[0]}</b></td><td><span className={`${styles.movementType} ${typeClass(row[1])}`}>{row[1]}</span></td><td><b>{row[2]}</b></td><td>{row[3]}</td><td>{row[4]}</td></tr>)}</tbody></table></div>
  <p className={styles.demoNote}>Illustrative audit history only. Actual stock movements must be read from the inventory movement ledger.</p>
</section>}
