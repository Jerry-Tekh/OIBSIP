import { useState } from "react";
import { signIn } from "./api/authApi.js";
import styles from "./LoginPage.module.css";

const EMAIL_MAX = 254;
const PASSWORD_MAX = 128;

function validate(values) {
  const errors = {};
  const email = values.email.trim();

  if (!email) errors.email = "Enter your email address.";
  else if (email.length > EMAIL_MAX) errors.email = "Email must be 254 characters or fewer.";
  else if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) errors.email = "Enter a valid email address.";

  if (!values.password) errors.password = "Enter your password.";
  else if (values.password.length > PASSWORD_MAX) errors.password = "Password must be 128 characters or fewer.";

  return errors;
}

export default function LoginPage() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [signedInUser, setSignedInUser] = useState(null);

  function updateField(event) {
    const { name, value } = event.target;
    setValues(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: undefined }));
    setServerError("");
  }

  function validateField(name) {
    const fieldErrors = validate(values);
    setErrors(current => ({ ...current, [name]: fieldErrors[name] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    setServerError("");

    if (Object.values(fieldErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const result = await signIn({
        email: values.email.trim().toLowerCase(),
        password: values.password
      });
      setSignedInUser(result?.user ?? null);
    } catch (error) {
      setServerError(error.message || "Sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles["login-shell"]}>
      <section className={styles["login-visual"]} aria-label="Freshly baked pizza">
        <div className={styles["visual-topline"]}>
          <a className={styles["brand"] + ' ' + styles["brand-light"]} href="/" aria-label="Pizza House home">
            <span className={styles["brand-mark"]}>P</span>
            <span>pizza<span className={styles["brand-dot"]}>.</span>house</span>
          </a>
          <span className={styles["visual-note"]}>FRESH FROM OUR OVEN</span>
        </div>

        <div className={styles["visual-copy"]}>
          <span className={styles["eyebrow"]}><span /> GOOD FOOD, GOOD MOOD</span>
          <h1>A little slice<br />of <em>happiness.</em></h1>
          <p>Hand-stretched dough, honest ingredients, and the kind of pizza worth slowing down for.</p>
        </div>

        <div className={styles["pizza-photo-wrap"]}>
          <img
            className={styles["pizza-photo"]}
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1500&q=88"
            alt="Freshly baked pizza topped with basil, cheese and tomatoes"
            fetchPriority="high"
          />
          <div className={styles["photo-sticker"]}><span>100%</span><small>made with<br />goodness</small></div>
        </div>

        <div className={styles["visual-footer"]}>
          <span>MADE FRESH. DELIVERED WITH LOVE.</span>
          <span className={styles["footer-spark"]}>✳</span>
        </div>
      </section>

      <section className={styles["login-panel"]}>
        <header className={styles["panel-header"]}>
          <a className={styles["brand"] + ' ' + styles["brand-dark"]} href="/" aria-label="Pizza House home">
            <span className={styles["brand-mark"]}>P</span>
            <span>pizza<span className={styles["brand-dot"]}>.</span>house</span>
          </a>
          <a className={styles["back-link"]} href="/">Back to home <span aria-hidden="true">↗</span></a>
        </header>

        <div className={styles["form-wrap"]}>
          {signedInUser ? (
            <div className={styles["success-state"]} role="status">
              <div className={styles["success-icon"]}>✓</div>
              <span className={styles["eyebrow"]}>YOU'RE SIGNED IN</span>
              <h2>Welcome back{signedInUser.name ? `, ${signedInUser.name.split(" ")[0]}` : ""}.</h2>
              <p>Your next favourite meal is just around the corner.</p>
            </div>
          ) : (
            <>
              <div className={styles["form-intro"]}>
                <span className={styles["eyebrow"]}>YOUR TABLE IS WAITING</span>
                <h2>Good to have<br />you <em>back.</em></h2>
                <p>Sign in to pick up where your cravings left off.</p>
              </div>

              <form className={styles["login-form"]} onSubmit={handleSubmit} noValidate>
                <div className={styles["field-group"]}>
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={EMAIL_MAX}
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={updateField}
                    onBlur={() => validateField("email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    required
                  />
                  {errors.email && <span className={styles["field-error"]} id="email-error">{errors.email}</span>}
                </div>

                <div className={styles["field-group"]}>
                  <div className={styles["label-row"]}>
                    <label htmlFor="password">Password</label>
                    <a className={styles["forgot-link"]} href="/forgot-password">Forgot password?</a>
                  </div>
                  <div className={`${styles["password-control"]} ${errors.password ? styles["has-error"] : ""}`}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      maxLength={PASSWORD_MAX}
                      placeholder="Enter your password"
                      value={values.password}
                      onChange={updateField}
                      onBlur={() => validateField("password")}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      required
                    />
                    <button
                      className={styles["visibility-toggle"]}
                      type="button"
                      onClick={() => setShowPassword(value => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <span className={styles["field-error"]} id="password-error">{errors.password}</span>}
                </div>

                {serverError && <div className={styles["form-alert"]} role="alert">{serverError}</div>}

                <button className={styles["submit-button"]} type="submit" disabled={submitting}>
                  <span>{submitting ? "Signing you in..." : "Sign in"}</span>
                  <span className={styles["button-arrow"]} aria-hidden="true">↗</span>
                </button>
              </form>

              <div className={styles["form-footnote"]}>
                <span className={styles["footnote-icon"]}>✳</span>
                <p>Your details stay private and secure. We only use them to make your experience better.</p>
              </div>
            </>
          )}
        </div>

        <footer className={styles["panel-footer"]}>
          <span>© {new Date().getFullYear()} Pizza House</span>
          <span>GOOD FOOD. BETTER MOMENTS.</span>
        </footer>
      </section>
    </main>
  );
}
