import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicProducts } from "../api/productsApi.js";
import styles from "./CatalogPage.module.css";

const formatPrice = (minor, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format((minor || 0) / 100);

const categoryLabels = {
  classic: "THE CLASSIC",
  signature: "SIGNATURE",
  vegetarian: "VEGETARIAN",
  spicy: "SPICY",
  specialty: "SPECIALTY"
};

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async ({ page = 1, append = false } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");

    try {
      const data = await getPublicProducts({ page, limit: 12 });
      const nextProducts = Array.isArray(data?.products) ? data.products : [];
      setProducts(current => append ? [...current, ...nextProducts] : nextProducts);
      setPagination(data?.pagination || { page, pages: 1, total: nextProducts.length });
    } catch (requestError) {
      setError(requestError.message || "We couldn't load the menu. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const hasMore = pagination.page < pagination.pages;

  return (
    <main className={styles.page}>
      <section className={styles.menu} id="pizzas">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>PICK YOUR PIZZA</span>
            <h2>Browse the menu</h2>
            <p>Choose a pizza. You’ll customize the ingredients and quantity on the next page.</p>
          </div>
          <span className={styles.count}>{pagination.total} {pagination.total === 1 ? "pizza" : "pizzas"} available</span>
        </div>

        {error && (
          <div className={styles.catalogState} role="alert">
            <h3>We couldn't load the menu</h3>
            <p>{error}</p>
            <button type="button" className={styles.retryButton} onClick={() => loadProducts()}>
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className={styles.catalogState} role="status" aria-live="polite">
            <span className={styles.loader} aria-hidden="true" />
            <p>Loading freshly prepared favourites…</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className={styles.catalogState}>
            <h3>Our menu is getting ready</h3>
            <p>There are no pizzas available to order right now. Please check back soon.</p>
          </div>
        )}

        {products.length > 0 && (
          <div className={styles.grid}>
            {products.map(product => (
              <article className={styles.card} key={product._id || product.slug}>
                <Link to={`/dashboard/order/${encodeURIComponent(product.slug)}`} className={styles.imageLink} aria-label={`Customize ${product.name}`}>
                  <img src={product.imageUrl} alt={product.name} loading="lazy"/>
                  <span className={styles.imageAction}>MAKE IT YOURS <b>↗</b></span>
                </Link>
                <div className={styles.cardBody}>
                  <span className={styles.tag}>{categoryLabels[product.category] || "MADE FRESH"}</span>
                  <h3>{product.name}</h3>
                  <p>{product.shortDescription || product.description}</p>
                  <div className={styles.productPrice}>{formatPrice(product.basePriceMinor, product.currency)}</div>
                  <Link to={`/dashboard/order/${encodeURIComponent(product.slug)}`} className={styles.customize}>
                    Customize pizza <span>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && hasMore && (
          <div className={styles.loadMoreWrap}>
            <button type="button" className={styles.retryButton} disabled={loadingMore} onClick={() => loadProducts({ page: pagination.page + 1, append: true })}>
              {loadingMore ? "Loading…" : "Load more pizzas"}
            </button>
          </div>
        )}

        <p className={styles.note}>Menu items and base prices are supplied by our live product catalogue. Final configuration pricing and ingredient availability are confirmed by the server before checkout.</p>
      </section>
    </main>
  );
}
