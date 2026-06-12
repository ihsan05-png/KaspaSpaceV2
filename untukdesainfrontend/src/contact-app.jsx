/* global React, ReactDOM, Nav, Footer, Icon, ContactSubHero, ContactMethods, ContactFormSplit, ContactMap, ContactFAQ, AboutLocations */

function ContactApp() {
  return (
    <>
      <Nav />
      <ContactSubHero />
      <ContactMethods />
      <ContactFormSplit />
      <ContactMap />
      <AboutLocations />
      <ContactFAQ />
      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["contact"] = ContactApp;
