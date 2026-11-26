import { useRef, useState } from "react";
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
  const [result, setResult] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const idempotencyKey = useRef(null);

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
      // Reuse the same key if the request is retried after a network failure.
      idempotencyKey.current ||= crypto.randomUUID();
      const data = await createCheckout({
        items: draft.items,
        deliveryAddress: Object.fromEntries(Object.entries(address).map(([key, value]) => [key, value.trim()])),
        idempotencyKey: idempotencyKey.current
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
    const paid = order.paymentStatus === "paid";
    async function payDemo() {
      setPaying(true);
      setPaymentError("");
      try { setResult(await simulatePaymentSuccess(result)); }
      catch (e) { setPaymentError(e.message || "Payment simulation failed."); }
      finally { setPaying(false); }
    }
    return <main className={styles.page}><header className={styles.header}><Link to="/dashboard/menu" className={styles.brand}><span>C</span> crust&co.</Link></header><section className={styles.result}><span className={styles.kicker}>{paid ? "DEMO PAYMENT COMPLETE" : "ORDER CREATED · DEMO MODE"}</span><div className={styles.check}>{paid ? "✓" : "◌"}</div><h1>{paid ? "Payment confirmed." : "Your order is ready for payment."}</h1><p>{paid ? "This simulated payment has been marked successful in the demo flow." : "The mock checkout created an order. Continue with the simulated payment below to preview the paid state."}</p><div className={styles.orderCard}><div><small>ORDER NUMBER</small><strong>{order.orderNumber || "Pending confirmation"}</strong></div><div><small>ORDER TOTAL</small><strong>{Number.isFinite(order.totalMinor) && order.currency ? new Intl.NumberFormat(undefined,{style:"currency",currency:order.currency}).format(order.totalMinor/100) : "See order details"}</strong></div><div><small>PAYMENT PROVIDER</small><strong>{payment.provider || "Demo payment simulator"}</strong></div><div><small>PAYMENT STATUS</small><strong>{order.paymentStatus || "pending"}</strong></div></div>{!paid && <><div className={styles.handoff}>DEMO ONLY: no real payment provider is contacted and no money is charged.</div>{paymentError && <div className={styles.error} role="alert">{paymentError}</div>}<button type="button" className={styles.submit} disabled={paying} onClick={payDemo}>{paying ? "Simulating payment…" : "Simulate successful payment"} <span>→</span></button></>}<Link to="/dashboard" className={styles.button}>Go to my account</Link><Link to="/dashboard/menu" className={styles.back}>Order another pizza</Link></section></main>;
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
