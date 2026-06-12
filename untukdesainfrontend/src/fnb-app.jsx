/* global React, ReactDOM, Nav, Footer, Icon, FnBHero, FnBPromo, FnBMenu, FnBInfo, FnBHowTo */

function FnBApp() {
  return (
    <>
      <Nav />
      <FnBHero />
      <FnBPromo />
      <FnBMenu />
      <FnBInfo />
      <FnBHowTo />
      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["fnb"] = FnBApp;
