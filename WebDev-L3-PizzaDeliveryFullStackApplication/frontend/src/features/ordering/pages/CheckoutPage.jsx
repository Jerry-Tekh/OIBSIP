import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCheckout } from "../api/orderingApi.js";
import ApiDataPanel from "../components/ApiDataPanel.jsx";
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
      idempotencyKey.current ||= crypto.randomUUID();
      const data = await createCheckout({
        items: draft.items,
        deliveryAddress: Object.fromEntries(Object.entries(address).map(([key, value]) => [key, value.trim()])),
        idempotencyKey: idempotencyKey.current
      });
      sessionStorage.setItem("crust-checkout-result", JSON.stringify(data));
      navigate("/dashboard/payment");
    } catch (requestError) {
      setError(requestError.message || "We couldn't place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!draft?.items?.length) return <main className={styles.state}><h1>Your order details have expired.</h1><Link to="/dashboard/menu">Return to menu</Link></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}><Link to="/dashboard/order/preview" className={styles.back}>← Back to price preview</Link><Link to="/" className={styles.brand}><span>C</span> crust&co.</Link><span className={styles.step}>04 / 05 <b>CHECKOUT</b></span></header>
      <div className={styles.layout}>
        <section className={styles.intro}><span className={styles.kicker}>ONE LAST THING</span><h1>Where should<br/>we bring the <em>good stuff?</em></h1><p>Add your delivery address. We’ll confirm the order and availability again before payment.</p><div className={styles.notice}>Your price preview is not a stock reservation. Checkout checks current prices and ingredient availability again.</div></section>
        <form className={styles.form} onSubmit={submit} noValidate>
          <span className={styles.kicker}>DELIVERY DETAILS</span><h2>Your delivery address</h2>
          <ApiDataPanel title="Checkout request contract" method="POST" endpoint="/api/v1/checkout" request={{ headers: { "Idempotency-Key": idempotencyKey.current || "Generated UUID on submit" }, body: { items: draft.items, deliveryAddress: address } }} response={{ success: true, data: { order: { id: "order_id", orderNumber: "PZ-20261126-8F3K7", totalMinor: 1100000, currency: "NGN", fulfilmentStatus: "order_received", paymentStatus: "pending" }, payment: { id: "payment_attempt_id", provider: "provider_name", providerOrderId: "provider_order_id", amountMinor: 1100000, currency: "NGN" } } }} note="The idempotency key is sent in the Idempotency-Key HTTP header. The backend revalidates prices and stock, reserves ingredients, creates the order and payment attempt, then initializes the provider. Example values are illustrative." />
          <label>Address line 1<input name="addressLine1" value={address.addressLine1} onChange={update} maxLength={160} autoComplete="address-line1" placeholder="House number and street" aria-invalid={Boolean(errors.addressLine1)}/>{errors.addressLine1 && <small>{errors.addressLine1}</small>}</label>
          <div className={styles.row}><label>City<input name="city" value={address.city} onChange={update} maxLength={100} autoComplete="address-level2" placeholder="Your city" aria-invalid={Boolean(errors.city)}/>{errors.city && <small>{errors.city}</small>}</label><label>State<input name="state" value={address.state} onChange={update} maxLength={100} autoComplete="address-level1" placeholder="Your state" aria-invalid={Boolean(errors.state)}/>{errors.state && <small>{errors.state}</small>}</label></div>
          <label>Country<input name="country" value={address.country} onChange={update} maxLength={100} autoComplete="country-name" placeholder="Your country" aria-invalid={Boolean(errors.country)}/>{errors.country && <small>{errors.country}</small>}</label>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <button className={styles.submit} disabled={submitting}>{submitting ? "Confirming your order…" : "Confirm order and continue to payment"} <span>→</span></button>
          <p className={styles.footnote}>The server recalculates the total and reserves stock as part of checkout. Do not refresh or submit again while this request is processing.</p>
        </form>
      </div>
    </main>
  );
}
