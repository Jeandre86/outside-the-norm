import Projects from "./projects";
import ContactButton from "./contact-button";
const services = [
  {name:"Brand Identity",body:"A clear visual language that brings your brand together. Purposeful, recognisable, and consistent.",tags:["Visual identity","Colour & typography","Brand guidelines"]},
  {name:"Website & App Design",body:"Thoughtful digital experiences. Clear journeys and considered interfaces, designed around the people who use them.",tags:["UX design","UI design","Prototyping"]},
  {name:"Logo Design",body:"One distinctive idea, expressed in a mark. Designed with care to work wherever your brand appears.",tags:["Logo design","Wordmarks","Brand marks"]},
];
export default function Home(){return <div className="site-shell">
  <aside className="side-rail" aria-label="Ontwrp"><a href="#home" aria-label="Ontwrp home" className="brand-symbol"/><span className="rail-caption">DESIGN WITH PURPOSE</span><a href="#contact" className="rail-contact">Let’s talk</a></aside>
  <div className="page-body">
    <section className="hero" id="home">
      <img fetchPriority="high" width={1536} height={1024} className="hero-photo" src="/images/studio-hero.png" alt=""/>
      <header className="header"><a className="wordmark" href="#home">Ontwrp<span>.</span></a><nav aria-label="Main navigation"><a className="nav-home" href="#home">Home</a><a href="#approach">About</a><a href="#work">Work</a><a href="#services">What we do</a><a href="#contact">Contact</a></nav></header>
      <div className="hero-copy"><h1>Designs<br/>that last<span>.</span></h1><p>We craft identities and design digital experiences for brands with the ambition to define the future. No fluff, just pure craft.</p><ContactButton label="Let’s chat"/></div>
      <div className="hero-motif" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div>
    </section>
    <main>
      <section id="approach" className="section philosophy"><p className="eyebrow">WHO WE ARE</p><h2>Our philosophy is simple<span>.</span></h2><div className="split"><p className="statement">We believe design is not about decoration. It is about <span>elimination.</span> Removing the noise until only the absolute truth of a brand remains. This is how we create work that stands firm against time.</p><div className="philosophy-note"><p>Ontwrp is a design company focused on clear identities and considered digital experiences. We bring a brand’s character into focus, then carry it through every visual detail.</p><a href="#services" className="text-link">Explore our expertise <span>+</span></a></div></div></section>
      <div className="discipline-strip"><div><strong>Identity<span>.</span></strong><span>BRANDS WITH CHARACTER</span></div><div><strong>Digital<span>.</span></strong><span>EXPERIENCES WITH PURPOSE</span></div><div><strong>Logos<span>.</span></strong><span>MARKS WITH MEANING</span></div><div><strong>Clarity<span>.</span></strong><span>AT EVERY TOUCHPOINT</span></div></div>
      <section id="services" className="section expertise"><p className="eyebrow">EXPERTISE</p><h2>We build unified identities<span>.</span></h2><div className="services">{services.map((s,i)=><article key={s.name}><span className="number">0{i+1}</span><h3>{s.name}</h3><p>{s.body}</p><div className="tags">{s.tags.map(t=><span key={t}>{t}</span>)}</div></article>)}</div></section>
      <section id="work" className="section work"><div className="section-heading"><div><p className="eyebrow">SELECTED PROJECTS</p><h2>Work with purpose<span>.</span></h2></div><a className="text-link" href="#project-grid">Explore the work</a></div><Projects/></section>
      <section className="section process"><p className="eyebrow">HOW WE WORK</p><h2>A transparent, rigorous path<span>.</span></h2>{[["Discovery & Immersion","We explore your business, your audience, and the challenge before drawing a single line."],["Strategic Direction","We establish the central idea and bring the visual and conceptual direction into alignment."],["Design & Refinement","We translate that direction into a considered identity or digital experience, refining the details together."],["Considered Delivery","We bring the approved design together, ready for your brand’s next chapter."]].map(([a,b],i)=><div className="process-row" key={a}><span className="number">0{i+1}</span><h3>{a}</h3><p>{b}</p></div>)}</section>
      <Projects inProgress/>
      <section className="contact-banner" id="contact"><h2>Ready to build a brand that lasts<span>?</span></h2><p>Tell us what you have in mind.<br/>Let’s give it a clear direction.</p><ContactButton label="Start a project"/><a className="secondary-link" href="#work">View our work</a></section>
    </main>
    <footer><div className="footer-top"><div className="footer-brand"><a className="wordmark" href="#home"><i className="brand-symbol"/>Ontwrp<span>.</span></a><p>A design company crafting clear identities<br/>and considered digital experiences.</p></div><div><h3>COMPANY</h3><a href="#approach">Our philosophy</a><a href="#services">Expertise</a><a href="#work">Our work</a></div><div><h3>LET’S TALK</h3><a href="#contact">Start a project</a><a href="/studio">Studio login</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Ontwrp. All rights reserved.</span><span>BRAND IDENTITY / DIGITAL DESIGN / LOGO DESIGN</span></div></footer>
  </div>
</div>}
