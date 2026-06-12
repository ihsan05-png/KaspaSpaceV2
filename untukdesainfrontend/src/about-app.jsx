/* global React, ReactDOM, Nav, Footer, Icon, AboutSubHero, AboutStory, AboutMV, AboutValues, AboutTimeline, AboutTeam, AboutLocations, AboutCTA */

function AboutApp() {
  return (
    <>
      <Nav />
      <AboutSubHero />
      <AboutStory />
      <AboutMV />
      <AboutValues />
      <AboutTimeline />
      <AboutTeam />
      <AboutLocations />
      <AboutCTA />
      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["about"] = AboutApp;
