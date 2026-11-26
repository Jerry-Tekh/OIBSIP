import { Link } from "react-router-dom";
import { menuItems } from "../data/menu.js";
import styles from "./CatalogPage.module.css";
import ApiDataPanel from "../components/ApiDataPanel.jsx";

export default function CatalogPage() {
  return (
    <main className={styles.page}>
      <section className={styles.menu} id="pizzas">
        <div className={styles.sectionHeading}>
          <div><span className={styles.kicker}>PICK YOUR PIZZA</span><h2>Browse the menu</h2><p>Choose a pizza. You’ll customize the ingredients and quantity on the next page.</p></div>
          <span className={styles.count}>{menuItems.length} favourites</span>
        </div>
        <ApiDataPanel title="Pizza product listing (frontend demo fixture)" method="MOCK" endpoint="Not defined in the current engineering guide" request={null} response={{ success: true, data: { pizzas: menuItems.map(({ slug, name, detail, description, image }) => ({ slug, name, description: description || detail, imageUrl: image })) } }} note="Important: this is not an agreed backend API contract. The guide defines GET /api/v1/pizza-options for ingredient choices, but does not specify a pizza product-list endpoint. The cards below are local demo data until that contract is designed." />
        <p className={styles.catalogDataNote}>Demo menu data: pizza names, descriptions and photography are currently frontend fixtures. Your engineering guide defines the ingredient-options API, but does not yet define a separate pizza-products/catalog endpoint. The builder loads its ingredient options from the documented endpoint.</p>
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
