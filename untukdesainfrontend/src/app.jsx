/* global React, ReactDOM, Nav, Hero, QuickSearch, Products, About, Benefits, Testimonials, Partners, News, FAQ, Contact, Footer, Icon */

function App() {
  return (
    <>
      <Nav />
      <Hero />
      <QuickSearch />
      <Products />
      <About />
      <Benefits />
      <Testimonials />
      <Partners />
      <News />
      <FAQ />
      <Contact />
      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["home"] = App;
