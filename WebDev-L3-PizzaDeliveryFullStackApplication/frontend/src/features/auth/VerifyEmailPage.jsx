import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "./api/authApi.js";
import styles from "./VerifyEmailPage.module.css";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState(token ? "verifying" : "invalid");
  const [message, setMessage] = useState(token ? "We're confirming your email address. This will only take a moment." : "This verification link is missing its security token. Please request a new verification email.");

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    verifyEmail(token).then((result) => {
      if (!active) return;
      setMessage(result?.message || "Your email address has been verified. You can now sign in.");
      setState("success");
    }).catch((error) => {
      if (!active) return;
      setMessage(error.message || "We couldn't verify this link. It may have expired or already been used.");
      setState("error");
    });
    return () => { active = false; };
  }, [token]);

  const success = state === "success";
  const verifying = state === "verifying";

  return <main className={styles.page}>
    <section className={styles.card} aria-live="polite">
      <Link to="/" className={styles.brand}><span>C</span> crust&co.</Link>
      <div className={styles.icon + " " + (success ? styles.success : verifying ? styles.pending : styles.failure)} aria-hidden="true">
        {success ? "✓" : verifying ? <span className={styles.spinner} /> : "!"}
      </div>
      <span className={styles.eyebrow}>{success ? "EMAIL CONFIRMED" : verifying ? "ONE MOMENT" : "VERIFICATION ISSUE"}</span>
      <h1>{success ? "You're all set." : verifying ? "Verifying your email." : "We couldn't verify that link."}</h1>
      <p>{message}</p>
      {success ? <Link className={styles.primary} to="/signin">Continue to sign in</Link> : verifying ? <span className={styles.waitText}>Please keep this page open.</span> : <div className={styles.actions}><Link className={styles.primary} to="/signup">Back to sign up</Link><Link className={styles.secondary} to="/signin">Go to sign in</Link></div>}
      <div className={styles.footer}>MADE FRESH. SHARED GENEROUSLY.</div>
    </section>
  </main>;
}
