import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./DashboardShell.module.css";

const icons = { Overview:"◫", Orders:"▤", Inventory:"▦", "Stock movements":"↕", "Low-stock alerts":"⚑", "My orders":"▤", "Saved addresses":"⌖", Profile:"◎", Settings:"⚙" };

export default function DashboardShell({ role="admin", active="Overview", navigation=[], title, subtitle, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = role === "admin";
  return (
    <div className={`${styles.app} ${collapsed ? styles.collapsed : ""}`}>
      {mobileOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ""}`}>
        <Link to="/" className={styles.brand}><span className={styles.brandMark}>C</span><span className={styles.brandName}>crust<span>&</span>co.</span></Link>
        <div className={styles.workspace}><span className={styles.workspaceDot}/><span>{isAdmin ? "Operations workspace" : "Your pizza account"}</span></div>
        <div className={styles.navLabel}>WORKSPACE</div>
        <nav className={styles.nav} aria-label={`${role} navigation`}>
          {navigation.map(item => <button key={item} type="button" title={collapsed ? item : undefined} className={`${styles.navItem} ${active===item ? styles.active : ""}`} onClick={() => { window.dispatchEvent(new CustomEvent("dashboard:navigate",{detail:item})); setMobileOpen(false); }}><span className={styles.navIcon}>{icons[item] || "•"}</span><span className={styles.navText}>{item}</span>{item==="Low-stock alerts" && isAdmin && <span className={styles.navCount}>3</span>}</button>)}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.helpCard}><span className={styles.helpIcon}>✳</span><strong>{isAdmin ? "Need a hand?" : "Need a little help?"}</strong><small>{isAdmin ? "Your operations, all in one place." : "We're always happy to help."}</small></div>
          <Link to="/" className={styles.backHome}>↗ <span>Back to storefront</span></Link>
          <div className={styles.userMini}><span className={styles.avatar}>{isAdmin ? "AD" : "JC"}</span><span className={styles.userText}><strong>{isAdmin ? "Alex Morgan" : "Jordan Carter"}</strong><small>{isAdmin ? "Administrator" : "Customer"}</small></span><span className={styles.more}>···</span></div>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topLeft}><button className={styles.menuToggle} onClick={() => setMobileOpen(true)} aria-label="Open navigation">☰</button><button className={styles.collapseToggle} onClick={() => setCollapsed(v=>!v)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>☷</button><span className={styles.crumb}>Workspace <b>/</b> {active}</span></div>
          <div className={styles.topActions}><label className={styles.search}><span>⌕</span><input placeholder="Search anything..." aria-label="Search dashboard"/><kbd>⌘ K</kbd></label><button className={styles.iconButton} aria-label="Notifications">♧<i/></button><span className={styles.topAvatar}>{isAdmin ? "AM" : "JC"}</span></div>
        </header>
        <section className={styles.content}>
          <div className={styles.pageHeading}><div><div className={styles.eyebrow}>{isAdmin ? "CRUST & CO. / OPERATIONS" : "WELCOME BACK"}</div><h1>{title || active}</h1><p>{subtitle}</p></div><div className={styles.headingActions}>{children?.props?.actions}</div></div>
          {children}
        </section>
      </main>
    </div>
  );
}
