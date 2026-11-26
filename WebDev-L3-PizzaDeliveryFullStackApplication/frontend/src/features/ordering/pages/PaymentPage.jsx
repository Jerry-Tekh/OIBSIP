import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { simulatePaymentSuccess } from "../api/orderingApi.js";
import ApiDataPanel from "../components/ApiDataPanel.jsx";
import styles from "./PaymentPage.module.css";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [checkout] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("crust-checkout-result") || "null"); }
    catch { return null; }
  });
  const [paid, setPaid] = useState(() => checkout?.order?.paymentStatus === "paid");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const order = checkout?.order || {};
  const payment = checkout?.payment || {};

  async function payDemo() {
    if (!checkout || paying || paid) return;
    setPaying(true);
    setError("");
    try {
      const verified = await simulatePaymentSuccess(checkout);
      sessionStorage.setItem("crust-checkout-result", JSON.stringify(verified));
      setPaid(true);
    } catch (requestError) {
      setError(requestError.message || "The demo payment could not be completed.");
    } finally {
      setPaying(false);
    }
  }

  if (!checkout?.order || !checkout?.payment) {
    return <main className={styles.page}><section className={styles.result}><h1>No pending payment found</h1><p>Complete checkout first to create an order and payment attempt.</p><Link to="/dashboard/menu">Return to the menu</Link></section></main>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.result}>
        <span className={styles.kicker}>PAYMENT · DEMO MODE</span>
        <div className={paid ? styles.successIcon : styles.pendingIcon}>{paid ? "✓" : "₦"}</div>
        <h1>{paid ? "Payment confirmed." : "Complete your payment."}</h1>
        <p>{paid ? "The demo payment has been marked successful. No money was charged." : "Your order and payment attempt have been created. Use the demo action below to preview the successful payment state."}</p>
        <div className={styles.orderCard}>
          <div><small>ORDER NUMBER</small><strong>{order.orderNumber}</strong></div>
          <div><small>AMOUNT DUE</small><strong>{new Intl.NumberFormat("en-NG",{style:"currency",currency:order.currency || "NGN"}).format((order.totalMinor || 0)/100)}</strong></div>
          <div><small>PAYMENT PROVIDER</small><strong>{payment.provider}</strong></div>
          <div><small>PAYMENT STATUS</small><strong>{paid ? "succeeded" : payment.status || "pending"}</strong></div>
        </div>
        <ApiDataPanel title="Verify provider payment" method="POST" endpoint="/api/v1/payments/verify" request={{ paymentAttemptId: payment.id, providerOrderId: payment.providerOrderId, providerPaymentId: "demo-provider-payment-id", providerSignature: "demo-signature-placeholder" }} response={{ success: true, data: { paymentStatus: paid ? "succeeded" : "pending", orderId: order.id, orderStatus: order.fulfilmentStatus || "order_received" } }} note="Illustrative contract from the engineering guide. In production, the provider returns payment identifiers and signature evidence. The backend verifies ownership, amount, currency, signature and order association before persisting success." />
        {!paid && <div className={styles.demoNotice}>DEMO ONLY — this does not open a real payment provider and does not charge a card or bank account.</div>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {!paid ? <button className={styles.primary} type="button" disabled={paying} onClick={payDemo}>{paying ? "Processing demo payment…" : "Simulate successful payment"} <span>→</span></button> : <button className={styles.primary} type="button" onClick={() => { sessionStorage.removeItem("crust-order-draft"); sessionStorage.removeItem("crust-checkout-result"); navigate("/dashboard"); }}>Finish and return to dashboard <span>→</span></button>}
        <Link className={styles.back} to="/dashboard/menu">Back to menu</Link>
      </section>
    </main>
  );
}
