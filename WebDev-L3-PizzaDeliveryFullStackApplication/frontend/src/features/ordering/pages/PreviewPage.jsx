import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublicProduct } from "../api/productsApi.js";
import { previewConfiguration } from "../api/orderingApi.js";
import styles from "./PreviewPage.module.css";
import ApiDataPanel from "../components/ApiDataPanel.jsx";

function formatMoney(minor, currency) {
  if (!Number.isFinite(minor) || !currency) return "—";
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100); }
  catch { return "—"; }
}

export default function PreviewPage() {
  const navigate = useNavigate();
  const [draft] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("crust-order-draft") || "null"); }
    catch { return null; }
  });
  const [pizza, setPizza] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!draft?.items?.length) { setLoading(false); setError("Your configuration has expired. Please build your pizza again."); return; }
    let active = true;
    getPublicProduct(draft.pizzaSlug).then(data => { if(active) setPizza(data?.product || null); }).catch(() => { if(active) setError("This product is no longer available."); });
    previewConfiguration(draft.items)
      .then((data) => { if (active) setPreview(data); })
      .catch((requestError) => { if (active) setError(requestError.message || "We couldn't confirm your price."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [draft]);

  const totals = preview?.totals || preview;
  const currency = totals?.currency || preview?.currency;
  const items = preview?.items || totals?.items || [];

  if (!draft || !draft.pizzaSlug) return <main className={styles.state}><h1>Configuration not found</h1><Link to="/dashboard/menu">Return to menu</Link></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}><Link to={`/dashboard/order/${draft.pizzaSlug}`}>← Edit pizza</Link><Link to="/" className={styles.brand}><span>C</span> crust&co.</Link><span className={styles.step}>03 / 05 <b>PRICE PREVIEW</b></span></header>
      <div className={styles.layout}>
        <section className={styles.product}>
          <img src={pizza?.imageUrl || ""} alt={pizza?.name || "Pizza"}/>
          <span className={styles.kicker}>YOUR CONFIGURATION</span>
          <h1>{pizza?.name || "Your pizza"}</h1><p>{pizza?.description || "Your selected ingredients are included below."}</p>
          <div className={styles.selection}><strong>Selections saved</strong><p>Your chosen ingredients and quantity are included in the preview request.</p></div>
        </section>
        <section className={styles.summary}>
          <span className={styles.kicker}>ALMOST THERE</span>
          <h2>Price preview</h2>
          <p className={styles.intro}>We calculate your price on the server using the current catalog and availability.</p>
          <ApiDataPanel title="Calculate authoritative price preview" method="POST" endpoint="/api/v1/checkout/preview" request={{ items: draft?.items || [] }} response={preview ? { success: true, data: { items: preview.items || [], subtotalMinor: totals?.subtotalMinor, deliveryFeeMinor: totals?.deliveryFeeMinor, discountMinor: totals?.discountMinor, taxMinor: totals?.taxMinor ?? 0, totalMinor: totals?.totalMinor, currency } } : { success: true, data: "Waiting for the server-calculated price preview…" }} note="Preview calculates current prices and ingredient requirements but does not reserve stock. Checkout recalculates everything again." />
          {loading && <div className={styles.status}>Calculating your price…</div>}
          {error && <div className={styles.error} role="alert"><strong>We couldn't confirm this configuration.</strong><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div>}
          {preview && !error && <>
            <div className={styles.confirmed}><span>✓</span><div><strong>Preview received</strong><small>This is the server-calculated preview for your current selection.</small></div></div>
            <div className={styles.lines}>
              {items.map((item, index) => <div className={styles.line} key={item.id || index}><span>{item.name || pizza?.name || "Pizza"} × {item.quantity}</span><strong>{formatMoney(item.lineTotalMinor, currency)}</strong></div>)}
              <div className={styles.line}><span>Subtotal</span><strong>{formatMoney(totals?.subtotalMinor, currency)}</strong></div>
              <div className={styles.line}><span>Delivery fee</span><strong>{formatMoney(totals?.deliveryFeeMinor, currency)}</strong></div>
              <div className={styles.line}><span>Discount</span><strong>−{formatMoney(totals?.discountMinor, currency)}</strong></div>
              <div className={styles.total}><span>Total</span><strong>{formatMoney(totals?.totalMinor, currency)}</strong></div>
            </div>
            <div className={styles.notice}>Availability and pricing are checked again during checkout. This preview does not reserve ingredients.</div>
            <button type="button" className={styles.continue} onClick={() => navigate("/dashboard/checkout")}>Continue to checkout <span>→</span></button>
          </>}
          {!loading && !error && !preview && <div className={styles.error}>The server returned an empty price preview.</div>}
        </section>
      </div>
    </main>
  );
}
