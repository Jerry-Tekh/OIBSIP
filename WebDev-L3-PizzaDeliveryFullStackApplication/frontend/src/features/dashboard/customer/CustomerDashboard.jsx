import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CatalogPage from "../../ordering/pages/CatalogPage.jsx";
import PizzaBuilderPage from "../../ordering/pages/PizzaBuilderPage.jsx";
import PreviewPage from "../../ordering/pages/PreviewPage.jsx";
import CheckoutPage from "../../ordering/pages/CheckoutPage.jsx";
import DashboardShell from "../shared/DashboardShell.jsx";
import { customerOrders, money, statusLabel } from "../shared/demoData.js";
import styles from "./CustomerDashboard.module.css";
const nav=["Overview","Browse menu","My orders","Saved addresses","Profile"];
export default function CustomerDashboard(){
 const navigate = useNavigate();
 const location = useLocation();
 const orderingPath = location.pathname;
 const orderingView = orderingPath === "/dashboard/menu" ? "menu" : orderingPath === "/dashboard/order/preview" ? "preview" : orderingPath === "/dashboard/checkout" ? "checkout" : orderingPath.startsWith("/dashboard/order/") ? "builder" : null;
 const [selectedSection,setSelectedSection]=useState("Overview");
 const active = orderingView ? "Browse menu" : selectedSection;
 useEffect(()=>{const fn=e=>setSelectedSection(e.detail);window.addEventListener("dashboard:navigate",fn);return()=>window.removeEventListener("dashboard:navigate",fn)},[]);
 const copy={"Browse menu":["Find your next favourite.","Explore the menu and make a pizza your own."],Overview:["Here's what's cooking, Jordan.","Your next favourite slice is never too far away."],"My orders":["Every order, all in one place.","A look at your recent pizza nights."],"Saved addresses":["A few details make delivery feel effortless.","Manage the places you'd like us to deliver."],"Profile":["Your account, your preferences.","Keep your details up to date."]};
 const [title,subtitle]=orderingView === "builder" ? ["Make it your own.","Choose your ingredients and build the pizza you want."]
  : orderingView === "preview" ? ["Review your pizza.","Check availability and the calculated price before checkout."]
  : orderingView === "checkout" ? ["Delivery and payment.","Confirm where your order should go, then continue to payment."]
  : copy[active]||copy.Overview;
 const orderingContent = orderingView === "menu" ? <CatalogPage /> : orderingView === "builder" ? <PizzaBuilderPage /> : orderingView === "preview" ? <PreviewPage /> : orderingView === "checkout" ? <CheckoutPage /> : null;
 const builderSlug = orderingView === "builder" ? orderingPath.split("/").filter(Boolean).at(-1) : null;
 return <DashboardShell role="customer" active={active} navigation={nav} title={title} subtitle={subtitle}>
 {orderingContent ? <div className={styles.orderingWorkspace}>
  <nav className={styles.orderingSteps} aria-label="Pizza ordering steps">
   <Link to="/dashboard/menu" className={orderingView==="menu" ? styles.currentStep : styles.completedStep}><span>01</span><b>Catalog</b></Link>
   <i className={styles.stepDivider}/>
   {builderSlug ? <Link to={`/dashboard/order/${builderSlug}`} className={orderingView==="builder" ? styles.currentStep : styles.completedStep}><span>02</span><b>Customize</b></Link> : <span className={styles.futureStep}><span>02</span><b>Customize</b></span>}
   <i className={styles.stepDivider}/>
   {orderingView==="preview" || orderingView==="checkout" ? <Link to="/dashboard/order/preview" className={orderingView==="preview" ? styles.currentStep : styles.completedStep}><span>03</span><b>Price preview</b></Link> : <span className={styles.futureStep}><span>03</span><b>Price preview</b></span>}
   <i className={styles.stepDivider}/>
   <span className={orderingView==="checkout" ? styles.currentStep : styles.futureStep}><span>04</span><b>Checkout</b></span>
  </nav>
  {orderingContent}
 </div> : active==="Overview" && <div className={styles.page}>
  <section className={styles.welcome}><div><span>GOOD FOOD IS A GOOD IDEA</span><h2>Something lovely<br/>is <em>on its way.</em></h2><p>Order your usual, or make room for a new favourite.</p><button onClick={()=>navigate("/dashboard/menu")}>Order a pizza <b>↗</b></button></div><div className={styles.welcomeArt}><img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85" alt="Freshly baked pizza with herbs"/><span>MADE FRESH<br/>FOR YOU</span></div></section>
  <div className={styles.statGrid}><article><span className={styles.statIcon}>▤</span><small>Total orders</small><strong>12</strong><span>Since you joined</span></article><article><span className={styles.statIcon}>♡</span><small>Favourite order</small><strong>Margherita</strong><span>Your go-to classic</span></article><article><span className={styles.statIcon}>✳</span><small>Pizza points</small><strong>240 pts</strong><span>Keep earning with every order</span></article></div>
  <section className={styles.panel}><div className={styles.panelHead}><div><h2>Your recent orders</h2><p>Good memories, delivered.</p></div><button onClick={()=>setSelectedSection("My orders")}>See all orders ↗</button></div><OrderList/></section>
  <section className={styles.tip}><span>✳</span><div><b>A little something for next time</b><p>Build your own pizza and make it exactly the way you like it.</p></div><button onClick={()=>navigate("/dashboard/menu")}>Browse the menu</button></section>
 </div>}
 {active==="My orders" && <section className={styles.panel}><div className={styles.panelHead}><div><h2>Order history</h2><p>Your recent orders and their latest status</p></div></div><OrderList detailed/></section>}
 {active==="Saved addresses" && <section className={styles.panel}><div className={styles.panelHead}><div><h2>Delivery addresses</h2><p>Demo address data — connect to the customer address API when available</p></div><button className={styles.addButton}>＋ Add address</button></div><div className={styles.address}><span>⌂</span><div><b>Home</b><small>12 Admiralty Way, Lekki Phase 1, Lagos</small><small>Jordan Carter · +234 800 000 0000</small></div><em>DEFAULT</em></div></section>}
 {active==="Profile" && <section className={styles.panel}><div className={styles.panelHead}><div><h2>Personal details</h2><p>These are sample values for the dashboard preview.</p></div></div><div className={styles.profile}><div><label>Full name</label><input defaultValue="Jordan Carter"/></div><div><label>Email address</label><input defaultValue="jordan@example.com" readOnly/></div><div><label>Phone number</label><input defaultValue="+234 800 000 0000"/></div><div><label>Preferred delivery area</label><input defaultValue="Lekki, Lagos"/></div></div><button className={styles.addButton}>Save changes</button></section>}
 <div className={styles.demoNote}>Demo customer dashboard · Account and order changes will be connected to authenticated customer APIs.</div>
 </DashboardShell>
}
function OrderList({detailed=false}){return <div className={styles.orders}>{customerOrders.map(o=><article className={styles.order} key={o.id}><div className={styles.orderIcon}>▧</div><div className={styles.orderInfo}><b>{o.id}</b><small>{o.date} · {o.items}</small></div><strong>{money(o.total)}</strong><span className={`${styles.status} ${styles[o.status]}`}>{statusLabel(o.status)}</span>{detailed&&<button aria-label={`View ${o.id}`}>View details ↗</button>}</article>)}</div>}
