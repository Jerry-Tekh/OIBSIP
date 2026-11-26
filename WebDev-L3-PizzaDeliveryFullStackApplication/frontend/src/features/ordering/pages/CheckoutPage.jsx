import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCheckout, simulatePaymentSuccess } from "../api/orderingApi.js";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [draft] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("crust-order-draft") || "null"); }
    catch { return null; }
  });
  const [address, setAddress] = useState({ addressLine1: "", city: "", state: "", country: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);\n  const [paying, setPaying] = useState(false);\n  const [paymentError, setPaymentError] = useState("");

  function update(event) {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    for (const [key, value] of Object.entries(address)) {
      if (!value.trim()) nextErrors[key] = "This field is required.";
      else if (value.trim().length > 160) nextErrors[key] = "Please keep this under 160 characters.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !draft?.items?.length) return;

    setSubmitting(true);
    setError("");
    try {
      const data = await createCheckout({
        items: draft.items,
        deliveryAddress: Object.fromEntries(Object.entries(address).map(([key, value]) => [key, value.trim()])),
        idempotencyKey: crypto.randomUUID()
      });
      setResult(data);
    } catch (requestError) {
      setError(requestError.message || "We couldn't place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!draft?.items?.length) return <main className={styles.state}><h1>Your order details have expired.</h1><Link to="/dashboard/menu">Return to menu</Link></main>;

  if (result) {
    const order = result.order || {};
    const payment = result.payment || {};
    return <main className={styles.page}><header className={styles.header}><Link to="/dashboard/menu" className={styles.brand}><span>C</span> crust&co.</Link></header><section className={styles.result}><span className={styles.kicker}>ORDER CREATED</span><div className={styles.check}>✓</div><h1>Your order is with us.</h1><p>We’ve received the checkout response. Payment is currently {order.paymentStatus || "pending"}.</p><div className={styles.orderCard}><div><small>ORDER NUMBER</small><strong>{order.orderNumber || "Pending confirmation"}</strong></div><div><small>ORDER TOTAL</small><strong>{Number.isFinite(order.totalMinor) && order.currency ? new Intl.NumberFormat(undefined,{style:"currency",currency:order.currency}).format(order.totalMinor/100) : "See order details"}</strong></div><div><small>PAYMENT PROVIDER</small><strong>{payment.provider || "Not supplied"}</strong></div></div><p className={styles.handoff}>Payment-provider checkout is the next integration step. This screen will not claim payment success until the provider confirms it and the backend verifies the result.</p><Link to="/dashboard" className={styles.button}>Go to my account</Link></section></main>;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}><Link to="/dashboard/menu" className={styles.back}>← Back to menu</Link><Link to="/" className={styles.brand}><span>C</span> crust&co.</Link><span className={styles.step}>03 / 03 <b>CHECKOUT</b></span></header>
      <div className={styles.layout}>
        <section className={styles.intro}><span className={styles.kicker}>ONE LAST THING</span><h1>Where should<br/>we bring the <em>good stuff?</em></h1><p>Add your delivery address. We’ll confirm the order and availability again before payment.</p><div className={styles.notice}>Your price preview is not a stock reservation. Checkout checks current prices and ingredient availability again.</div></section>
        <form className={styles.form} onSubmit={submit} noValidate>
          <span className={styles.kicker}>DELIVERY DETAILS</span><h2>Your delivery address</h2>
          <label>Address line 1<input name="addressLine1" value={address.addressLine1} onChange={update} maxLength={160} autoComplete="address-line1" placeholder="House number and street" aria-invalid={Boolean(errors.addressLine1)}/>{errors.addressLine1 && <small>{errors.addressLine1}</small>}</label>
          <div className={styles.row}><label>City<input name="city" value={address.city} onChange={update} maxLength={100} autoComplete="address-level2" placeholder="Your city" aria-invalid={Boolean(errors.city)}/>{errors.city && <small>{errors.city}</small>}</label><label>State<input name="state" value={address.state} onChange={update} maxLength={100} autoComplete="address-level1" placeholder="Your state" aria-invalid={Boolean(errors.state)}/>{errors.state && <small>{errors.state}</small>}</label></div>
          <label>Country<input name="country" value={address.country} onChange={update} maxLength={100} autoComplete="country-name" placeholder="Your country" aria-invalid={Boolean(errors.country)}/>{errors.country && <small>{errors.country}</small>}</label>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <button className={styles.submit} disabled={submitting}>{submitting ? "Confirming your order…" : "Confirm order and continue"} <span>→</span></button>
          <p className={styles.footnote}>The server recalculates the total and reserves stock as part of checkout. Do not refresh or submit again while this request is processing.</p>
        </form>
      </div>
    </main>
  );
}
