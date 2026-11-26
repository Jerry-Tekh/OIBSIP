import { Link } from "react-router-dom";
import { menuItems } from "../data/menu.js";
import styles from "./CatalogPage.module.css";

export default function CatalogPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}><span>C</span> crust&co.</Link>
        <nav aria-label="Store navigation"><Link to="/">Home</Link><Link to="/login">My account</Link></nav>
        <Link to="/login" className={styles.account}>Sign in</Link>
      </header>

      <section className={styles.hero}>
        <span className={styles.kicker}>THE CRUST & CO. MENU</span>
        <h1>Find your next<br/><em>favourite.</em></h1>
        <p>Made with care, finished in a hot oven, and ready for your table.</p>
        <a href="#pizzas" className={styles.heroLink}>Explore the pizzas <span>↓</span></a>
      </section>

      <section className={styles.menu} id="pizzas">
        <div className={styles.sectionHeading}>
          <div><span className={styles.kicker}>A GOOD PLACE TO START</span><h2>House favourites</h2><p>Choose a pizza to make it your own.</p></div>
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

      <footer className={styles.footer}><Link to="/" className={styles.brand}><span>C</span> crust&co.</Link><p>Good dough. Good people. Good pizza.</p></footer>
    </main>
  );
}
