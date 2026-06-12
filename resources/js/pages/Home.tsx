import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Products from '../components/Products';
import About from '../components/About';
import Benefits from '../components/Benefits';
import Testimonials from '../components/Testimonials';
import Partners from '../components/Partners';
import News from '../components/News';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { waLink } from '../lib/config';

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Products />
      <About />
      <Benefits />
      <Testimonials />
      <Partners />
      <News />
      <FAQ />
      <Contact />
      <Footer />
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp">
        <Icon.Whatsapp />
      </a>
    </div>
  );
}
