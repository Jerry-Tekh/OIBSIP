import { Link } from "react-router-dom";
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
      <div className={styles.announcement}><span>THE GOOD STUFF STARTS WITH GOOD DOUGH</span><span>FRESHLY MADE. NEVER RUSHED.</span></div>
      <header className={styles.header}>
        <Link className={styles.logo} to="/" aria-label="Crust & Co home"><span className={styles.logoMark}>C</span> crust<span>&</span>co.</Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link to="#menu">The menu</Link><Link to="#story">Our way</Link><Link to="#delivery">Delivery</Link>
        </nav>
        <div className={styles.headerActions}>
          <Link className={styles.signIn} to="/signin">Sign in</Link>
          <Link className={styles.signUp} to="/signup">Start an order</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}><i /> GOOD DOUGH. NO SHORTCUTS.</span>
          <span className={styles.heroOverline}>A LITTLE MORE JOY IN EVERY SLICE</span>
          <h1>Pizza worth<br/>slowing <em>down</em><br/>for.</h1>
          <p>Long-fermented dough. Beautifully balanced toppings. A blistering-hot oven. We make the kind of pizza that turns an ordinary evening into the best part of your day.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} to="/signup">Explore the menu</Link>
            <Link className={styles.textButton} to="#story">Our way of making pizza</Link>
          </div>
          <div className={styles.heroNote}><span className={styles.noteStars}>✳</span><span>Small-batch dough <i/> Fresh ingredients <i/> Big-hearted flavour</span></div>
        </div>
        <div className={styles.heroAtmosphere} aria-hidden="true">
          <span className={styles.heroGlow} />
          <span className={styles.heroEyebrow}>HAND-STRETCHED · OVEN-FINISHED · MADE WITH CARE</span>
          <span className={styles.heroSeal}>MADE FRESH<br/>JUST FOR YOU</span>
        </div>
      </section>

      <div className={styles.marquee} aria-label="Good dough, good ingredients, great pizza"><span>GOOD DOUGH</span><i>✳</i><span>GOOD INGREDIENTS</span><i>✳</i><span>GREAT PIZZA</span><i>✳</i><span>GOOD DOUGH</span><i>✳</i><span>GOOD INGREDIENTS</span></div>

      <section className={styles.promise} id="story">
        <div className={styles.promiseVisual}><span className={styles.promiseImageLabel}>THE CRAFT IS IN THE DETAILS</span><span className={styles.promiseBigType}>CRAFT<br/><em>OVER</em><br/>HASTE.</span></div>
        <div className={styles.promiseCopy}><span className={styles.sectionKicker}>A BETTER KIND OF PIZZA NIGHT</span><h2>Not fast food.<br/><em>Good food,</em> made well.</h2><span className={styles.promiseRule}/></div>
        <p>We believe a great pizza starts long before it meets the oven. It starts with dough that gets the time it needs, ingredients we’re proud to put our name to, and people who care about getting the details right.</p>
        <span className={styles.promiseMark}>C<span>&</span>C</span>
      </section>

      <section className={styles.menuSection} id="menu">
        <div className={styles.sectionHeading}><div><span className={styles.sectionKicker}>STRAIGHT FROM OUR KITCHEN</span><h2>The <em>house favourites.</em></h2><p>Made with care. Remembered by the last bite.</p></div><Link to="/signup" className={styles.menuLink}>View all pizzas</Link></div>
        <div className={styles.menuGrid}>
          {menu.map((item) => <article className={styles.menuCard} key={item.name}>
            <Link className={styles.menuImage} to="/signup" aria-label={`Order ${item.name}`}><img src={item.image} alt={item.name}/></Link>
            <div className={styles.cardMeta}><span>{item.tag}</span><span>{item.price}</span></div>
            <h3>{item.name}</h3><p>{item.detail}</p>
          </article>)}
        </div>
        <p className={styles.menuDisclaimer}>A small introduction to the kitchen. Full menu, sizes and add-ons are waiting when you order.</p>
      </section>

      <section className={styles.process} id="delivery">
        <div className={styles.processIntro}><span className={styles.sectionKicker}>FROM OUR KITCHEN TO YOUR DOOR</span><h2>Three little steps<br/>to a <em>good evening.</em></h2><Link to="/signup" className={styles.lightButton}>Let’s get ordering</Link></div>
        <div className={styles.steps}>{steps.map(([number,title,description])=><article className={styles.step} key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
      </section>

      <section className={styles.lastCall}>
        <div className={styles.lastCallImage}><img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=85" alt="Pizza fresh from the oven"/></div>
        <div><span className={styles.sectionKicker}>YOUR NEXT GOOD MEAL IS CLOSE</span><h2>Make tonight<br/>a <em>pizza night.</em></h2><p>Set up your account, find your usual or try something new. We’ll take it from there.</p><Link className={styles.primaryButton} to="/signup">Create your account</Link><small>Already one of us? <Link to="/signin">Sign in here.</Link></small></div>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.logo} to="/"><span className={styles.logoMark}>C</span> crust<span>&</span>co.</Link>
        <p>Good dough. Good people. Good pizza.</p>
        <div><Link to="#menu">Menu</Link><Link to="/signin">Sign in</Link><Link to="/signup">Create account</Link></div>
        <small>© {new Date().getFullYear()} Crust & Co. Made with care.</small>
      </footer>
    </main>
  );
}
