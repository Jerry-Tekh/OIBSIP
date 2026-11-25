import { useState } from "react";
import { signUp } from "./api/authApi.js";
import styles from "./SignupPage.module.css";

const initial = { name: "", email: "", password: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim() || values.name.trim().length < 2 || values.name.trim().length > 80) errors.name = "Enter a name between 2 and 80 characters.";
  if (!values.email.trim() || values.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.password.length < 12 || values.password.length > 128 || !/[a-z]/.test(values.password) || !/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password) || !/[^A-Za-z0-9]/.test(values.password)) errors.password = "Use 12–128 characters with uppercase, lowercase, a number and a symbol.";
  return errors;
}

export default function SignupPage() {
  const [values,setValues] = useState(initial);
  const [errors,setErrors] = useState({});
  const [showPassword,setShowPassword] = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [message,setMessage] = useState("");
  const [failure,setFailure] = useState("");

  function update(event) {
    const {name,value}=event.target;
    setValues(current=>({...current,[name]:value}));
    setErrors(current=>({...current,[name]:undefined}));
    setFailure("");
  }

  async function submit(event) {
    event.preventDefault();
    const next=validate(values);setErrors(next);setFailure("");setMessage("");
    if(Object.values(next).some(Boolean)) return;
    setSubmitting(true);
    try {
      const result=await signUp({name:values.name.trim(),email:values.email.trim().toLowerCase(),password:values.password});
      setMessage(result?.message || "Your account request has been received. Check your email for the next step.");
    } catch(error) { setFailure(error.message || "We couldn't create your account. Please try again."); }
    finally { setSubmitting(false); }
  }

  return <main className={styles.shell}>
    <section className={styles.story}>
      <a className={styles.logo} href="/"><span>C</span> crust&co.</a>
      <div className={styles.storyCopy}><span className={styles.kicker}>A SEAT AT OUR TABLE</span><h1>Good things<br/>are <em>better</em><br/>shared.</h1><p>Create an account for a smoother order, saved details and a little less waiting between you and your pizza.</p></div>
      <div className={styles.storyImage}><img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1100&q=85" alt="A freshly baked pizza ready to share"/></div>
      <span className={styles.storyFoot}>MADE FRESH. SHARED GENEROUSLY.</span>
    </section>
    <section className={styles.formSide}>
      <header><a href="/" className={styles.back}>← Back to home</a><span>Already have an account? <a href="/signin">Sign in</a></span></header>
      <div className={styles.formWrap}>
        <span className={styles.kicker}>LET'S GET THE GOOD STUFF STARTED</span><h2>Your account.<br/><em>Your kind of pizza.</em></h2><p className={styles.intro}>A few details and you're nearly there.</p>
        {message ? <div className={styles.success} role="status"><b>You're on the list.</b><p>{message}</p><a href="/signin">Go to sign in ↗</a></div> : <form onSubmit={submit} noValidate>
          <div className={styles.field}><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" maxLength={80} placeholder="What should we call you?" value={values.name} onChange={update} aria-invalid={Boolean(errors.name)}/>{errors.name&&<small>{errors.name}</small>}</div>
          <div className={styles.field}><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} placeholder="you@example.com" value={values.email} onChange={update} aria-invalid={Boolean(errors.email)}/>{errors.email&&<small>{errors.email}</small>}</div>
          <div className={styles.field}><label htmlFor="password">Create a password</label><div className={styles.password}><input id="password" name="password" type={showPassword?"text":"password"} autoComplete="new-password" maxLength={128} placeholder="Make it a good one" value={values.password} onChange={update} aria-invalid={Boolean(errors.password)}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-pressed={showPassword}>{showPassword?"Hide":"Show"}</button></div>{errors.password&&<small>{errors.password}</small>}<span className={styles.hint}>At least 12 characters, including upper- and lowercase letters, a number and a symbol.</span></div>
          {failure&&<div className={styles.failure} role="alert">{failure}</div>}
          <button className={styles.submit} disabled={submitting}>{submitting?"Creating your account…":"Create my account"} <span>↗</span></button>
          <p className={styles.terms}>By creating an account, you agree to our terms and acknowledge our privacy policy.</p>
        </form>}
      </div>
      <footer>© {new Date().getFullYear()} Crust & Co. <span>GOOD DOUGH. GOOD PEOPLE.</span></footer>
    </section>
  </main>;
}
