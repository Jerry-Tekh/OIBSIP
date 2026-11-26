import { Link } from "react-router-dom";
import { menuItems } from "../data/menu.js";
import styles from "./CatalogPage.module.css";

export default function CatalogPage() {
  return (
    <main className={styles.page}>
      <section className={styles.menu} id="pizzas">
        <div className={styles.sectionHeading}>
          <div><span className={styles.kicker}>PICK YOUR PIZZA</span><h2>Browse the menu</h2><p>Choose a pizza. You’ll customize the ingredients and quantity on the next page.</p></div>
          <span className={styles.count}>{menuItems.length} favourites</span>
        </div>
        <div className={styles.grid}>
          {menuItems.map((item) => (
            <article className={styles.card} key={item.slug}>
              <Link to={`/dashboard/order/${item.slug}`} className={styles.imageLink} aria-label={`Customize ${item.name}`}>
                <img src={item.image} alt={item.name} loading="lazy"/>
                <span className={styles.imageAction}>MAKE IT YOURS <b>↗</b></span>
              </Link>
              <div className={styles.cardBody}>
                <span className={styles.tag}>{item.tag}</span>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
                <Link to={`/dashboard/order/${item.slug}`} className={styles.customize}>Customize pizza <span>→</span></Link>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.note}>Menu photography and descriptions are storefront presentation content. Ingredient availability and all order prices are confirmed by the server during configuration preview.</p>
      </section>
    </main>
  );
}
