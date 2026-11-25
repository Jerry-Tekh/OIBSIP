import styles from "./HomePage.module.css";

const menu = [
  { name: "The Margherita", detail: "San Marzano tomato · fior di latte · basil", price: "₦8,500", tag: "THE CLASSIC", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85" },
  { name: "Smoky Pepperoni", detail: "Spiced pepperoni · mozzarella · house tomato", price: "₦11,500", tag: "A CROWD FAVOURITE", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=85" },
  { name: "Garden Afterglow", detail: "Roasted peppers · olives · mushrooms · herbs", price: "₦10,000", tag: "MEAT-FREE", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85" }
];

const steps = [
  ["01", "Find your favourite", "Take a look through the menu. There’s something for the familiar mood and the curious one."],
  ["02", "Make it yours", "Choose your size, add a little extra, and tell us where the good food should find you."],
  ["03", "Put the kettle on", "We get it into the oven and keep you in the loop until it reaches your door."]
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.logo} href="/" aria-label="Crust & Co home"><span className={styles.logoMark}>C</span> crust<span>&</span>co.</a>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#menu">The menu</a><a href="#story">Our way</a><a href="#delivery">Delivery</a>
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.signIn} href="/signin">Sign in</a>
          <a className={styles.signUp} href="/signup">Create account <span>↗</span></a>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}><i /> GOOD DOUGH. NO SHORTCUTS.</span>
          <h1>Some days<br/>just call for<br/><em>really good</em><br/>pizza.</h1>
          <p>Slow-made dough, bright ingredients and a proper hot oven. The little things make the whole slice.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="/signup">Order something lovely <span>↗</span></a>
            <a className={styles.textButton} href="#menu">Take a look at the menu <span>↓</span></a>
          </div>
          <div className={styles.heroNote}><span className={styles.noteStars}>★★★★★</span><span>Made fresh when you order. Always.</span></div>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.sunDisc} />
          <div className={styles.heroImageFrame}>
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1500&q=90" alt="Freshly baked pizza with basil, melted cheese and tomato" fetchPriority="high"/>
          </div>
          <div className={styles.roundStamp}><span>FRESH</span><b>✳</b><span>FROM OUR OVEN</span></div>
          <span className={styles.artCaption}>A GOOD THING, ROUND.</span>
        </div>
        <div className={styles.heroBottom}><span>HAND-STRETCHED · OVEN-FINISHED · MADE WITH CARE</span><span>01 / 03</span></div>
      </section>

      <section className={styles.promise} id="story">
        <div><span className={styles.sectionKicker}>A BETTER KIND OF PIZZA NIGHT</span><h2>Not fast food.<br/><em>Good food,</em> made well.</h2></div>
        <p>We believe a great pizza starts long before it meets the oven. It starts with dough that gets the time it needs, ingredients we’re proud to put our name to, and people who care about getting the details right.</p>
        <span className={styles.promiseMark}>C<span>&</span>C</span>
      </section>

      <section className={styles.menuSection} id="menu">
        <div className={styles.sectionHeading}><div><span className={styles.sectionKicker}>A FEW HOUSE FAVOURITES</span><h2>Meet your <em>next slice.</em></h2></div><a href="/signup" className={styles.menuLink}>Explore the menu <span>↗</span></a></div>
        <div className={styles.menuGrid}>
          {menu.map((item, index) => <article className={styles.menuCard} key={item.name}>
            <a className={styles.menuImage} href="/signup" aria-label={`Order ${item.name}`}><img src={item.image} alt={item.name}/><span className={styles.cardNumber}>0{index+1}</span></a>
            <div className={styles.cardMeta}><span>{item.tag}</span><span>{item.price}</span></div>
            <h3>{item.name}</h3><p>{item.detail}</p>
          </article>)}
        </div>
        <p className={styles.menuDisclaimer}>A small introduction to the kitchen. Full menu, sizes and add-ons are waiting when you order.</p>
      </section>

      <section className={styles.process} id="delivery">
        <div className={styles.processIntro}><span className={styles.sectionKicker}>FROM OUR KITCHEN TO YOUR DOOR</span><h2>Three little steps<br/>to a <em>good evening.</em></h2><a href="/signup" className={styles.lightButton}>Let’s get ordering <span>↗</span></a></div>
        <div className={styles.steps}>{steps.map(([number,title,description])=><article className={styles.step} key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><b>↗</b></article>)}</div>
      </section>

      <section className={styles.lastCall}>
        <div className={styles.lastCallImage}><img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=85" alt="Pizza fresh from the oven"/></div>
        <div><span className={styles.sectionKicker}>YOUR NEXT GOOD MEAL IS CLOSE</span><h2>Make tonight<br/>a <em>pizza night.</em></h2><p>Set up your account, find your usual or try something new. We’ll take it from there.</p><a className={styles.primaryButton} href="/signup">Create your account <span>↗</span></a><small>Already one of us? <a href="/signin">Sign in here.</a></small></div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.logo} href="/"><span className={styles.logoMark}>C</span> crust<span>&</span>co.</a>
        <p>Good dough. Good people. Good pizza.</p>
        <div><a href="#menu">Menu</a><a href="/signin">Sign in</a><a href="/signup">Create account</a></div>
        <small>© {new Date().getFullYear()} Crust & Co. Made with care.</small>
      </footer>
    </main>
  );
}
