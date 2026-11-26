import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { findMenuItem } from "../data/menu.js";
import { getPizzaOptions } from "../api/orderingApi.js";
import styles from "./PizzaBuilderPage.module.css";

const CATEGORIES = ["base", "sauce", "cheese", "vegetable"];

export default function PizzaBuilderPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const pizza = findMenuItem(slug);
  const [options, setOptions] = useState([]);
  const [savedDraft] = useState(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem("crust-order-draft") || "null");
      return value?.pizzaSlug === slug ? value : null;
    } catch { return null; }
  });
  const [selection, setSelection] = useState(() => savedDraft?.items?.[0]?.configuration || { baseId: "", sauceId: "", cheeseId: "", vegetableIds: [] });
  const [quantity, setQuantity] = useState(() => Math.min(20, Math.max(1, Number(savedDraft?.items?.[0]?.quantity) || 1)));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPizzaOptions()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data?.options) ? data.options : Array.isArray(data) ? data : [];
        setOptions(list);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "We couldn't load the pizza options.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const grouped = useMemo(() => Object.fromEntries(
    CATEGORIES.map((category) => [category, options.filter((option) => option.category === category)])
  ), [options]);

  useEffect(() => {
    if (!pizza) return;
    sessionStorage.setItem("crust-order-draft", JSON.stringify({
      pizzaSlug: slug,
      items: [{ configuration: selection, quantity }]
    }));
  }, [pizza, slug, selection, quantity]);

  const requiredComplete = Boolean(selection.baseId && selection.sauceId && selection.cheeseId);
  const selectedOptions = useMemo(() => options.filter((option) =>
    [selection.baseId, selection.sauceId, selection.cheeseId, ...selection.vegetableIds].includes(option.id)
  ), [options, selection]);

  function chooseSingle(category, id) {
    const field = category === "base" ? "baseId" : category === "sauce" ? "sauceId" : "cheeseId";
    setSelection((current) => ({ ...current, [field]: id }));
  }

  function toggleVegetable(id) {
    setSelection((current) => ({
      ...current,
      vegetableIds: current.vegetableIds.includes(id)
        ? current.vegetableIds.filter((value) => value !== id)
        : [...current.vegetableIds, id]
    }));
  }

  function continueToPreview() {
    if (!requiredComplete) return;
    sessionStorage.setItem("crust-order-draft", JSON.stringify({
      pizzaSlug: slug,
      items: [{ configuration: selection, quantity }]
    }));
    navigate("/dashboard/order/preview");
  }

  if (!pizza) return <main className={styles.statePage}><h1>We couldn't find that pizza.</h1><Link to="/dashboard/menu">Back to the menu</Link></main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}><Link to="/dashboard/menu" className={styles.back}>← Back to menu</Link><Link to="/" className={styles.brand}><span>C</span> crust&co.</Link><span className={styles.step}>01 / 03 <b>MAKE IT YOURS</b></span></header>
      <div className={styles.layout}>
        <section className={styles.product}>
          <img className={styles.productImage} src={pizza.image} alt={pizza.name}/>
          <span className={styles.kicker}>MADE FRESH AT CRUST & CO.</span>
          <h1>{pizza.name}</h1><p>{pizza.description}</p>
          <div className={styles.productFoot}><span>✳</span> Choose your ingredients, then we’ll confirm availability and price.</div>
        </section>

        <section className={styles.builder}>
          <div className={styles.builderHeading}><div><span className={styles.kicker}>YOUR PIZZA, YOUR WAY</span><h2>Build your pizza</h2><p>Choose the ingredients for your order.</p></div><span className={styles.required}>* Required choices</span></div>
          {loading && <div className={styles.notice}>Loading available ingredients…</div>}
          {error && <div className={styles.error} role="alert">{error}<p>The catalog options endpoint must be available before this builder can be used.</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div>}
          {!loading && !error && options.length === 0 && <div className={styles.notice}>No pizza options are currently published. Please check back shortly.</div>}

          {!loading && !error && CATEGORIES.map((category) => {
            const items = grouped[category];
            const multiple = category === "vegetable";
            const selected = multiple ? selection.vegetableIds : [selection[category === "base" ? "baseId" : category === "sauce" ? "sauceId" : "cheeseId"]];
            return (
              <section className={styles.optionGroup} key={category}>
                <div className={styles.groupHeading}><h3>{category === "vegetable" ? "Vegetables" : category[0].toUpperCase() + category.slice(1)}</h3><span>{multiple ? "Choose any available" : "Choose one"}</span></div>
                {items.length === 0 ? <p className={styles.empty}>No {category} options are available at the moment.</p> : (
                  <div className={styles.options}>
                    {items.map((option) => {
                      const active = selected.includes(option.id);
                      return <button type="button" key={option.id} disabled={!option.isAvailable} aria-pressed={active} className={`${styles.option} ${active ? styles.selected : ""}`} onClick={() => multiple ? toggleVegetable(option.id) : chooseSingle(category, option.id)}>
                        {option.imageUrl ? <img src={option.imageUrl} alt="" loading="lazy"/> : <span className={styles.optionPlaceholder}>{category === "base" ? "◉" : category === "sauce" ? "◍" : category === "cheese" ? "✳" : "❋"}</span>}
                        <span className={styles.optionText}><strong>{option.name}</strong>{option.description && <small>{option.description}</small>}</span>
                        <span className={styles.optionStatus}>{!option.isAvailable ? "Unavailable" : active ? "Selected" : "Select"}</span>
                      </button>;
                    })}
                  </div>
                )}
              </section>
            );
          })}

          <div className={styles.quantity}><div><strong>Quantity</strong><small>How many of this pizza?</small></div><div className={styles.quantityControl}><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><output>{quantity}</output><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(20, value + 1))}>+</button></div></div>
          <div className={styles.selectionSummary}><strong>Your selections</strong><p>{selectedOptions.length ? selectedOptions.map((option) => option.name).join(" · ") : "Your selected ingredients will appear here."}</p></div>
          <button className={styles.continue} type="button" disabled={loading || Boolean(error) || !requiredComplete} onClick={continueToPreview}>Review configuration <span>→</span></button>
          <p className={styles.helper}>Prices and ingredient availability are confirmed by our server on the next step.</p>
        </section>
      </div>
    </main>
  );
}
