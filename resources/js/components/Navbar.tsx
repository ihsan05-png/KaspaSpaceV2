import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import logoImg from '../../img/kaspa-space-logo.png';

const openCart = () => window.dispatchEvent(new CustomEvent('ks:open-cart'));

/* ---- Cart button ---- */
function CartButton() {
  const { count } = useCart();
  return (
    <button type="button" className="nav-cart" onClick={openCart} aria-label="Keranjang">
      <Icon.Bag />
      {count > 0 && <span className="nav-cart-badge">{count}</span>}
    </button>
  );
}

/* ---- User menu dropdown ---- */
function UserMenuDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) {
    return (
      <>
        <CartButton />
        <Link className="btn btn-ghost" to="/masuk">Masuk</Link>
        <Link className="btn btn-primary" to="/masuk?tab=daftar">Daftar <Icon.Arrow /></Link>
      </>
    );
  }

  const initials = user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/masuk');
  }

  return (
    <>
      <CartButton />
      <div className="nav-user" ref={ref}>
        <button type="button" className="nav-user-btn" onClick={() => setOpen(o => !o)}>
          <span className="nav-user-avatar">{initials}</span>
          <span className="nav-user-name">{user.name.split(' ')[0]}</span>
          <Icon.ChevDown />
        </button>

        <div className={`nav-menu${open ? ' open' : ''}`}>
          <div className="nav-menu-head">
            <span className="av">{initials}</span>
            <div>
              <div className="nm">{user.name}</div>
              <div className="em">{user.email}</div>
              <div className="nav-menu-tier"><Icon.Crown /> Member</div>
            </div>
          </div>

          <Link className="nav-menu-item" to="/dashboard" onClick={() => setOpen(false)}>
            <Icon.Grid /> Dashboard
          </Link>

          <Link className="nav-menu-item" to="/dashboard?tab=settings" onClick={() => setOpen(false)}>
            <Icon.Cog /> Pengaturan
          </Link>
          {user.role === 'admin' && (
            <Link className="nav-menu-item" to="/admin" onClick={() => setOpen(false)}>
              <Icon.Cog /> Panel Admin
            </Link>
          )}
          <div className="nav-menu-sep" />
          <button type="button" className="nav-menu-item danger" onClick={handleLogout}>
            <Icon.LogOut /> Keluar
          </button>
        </div>
      </div>
    </>
  );
}

/* ---- Main Navbar ---- */
export default function Navbar() {
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { pathname } = useLocation();

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const navCls = (path: string) => `nav-link${pathname === path ? ' active' : ''}`;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-bar">
          <Link to="/" className="logo">
            <img src={logoImg} alt="Kaspa Space" className="logo-img" />
          </Link>

          <div className="nav-links">
            <Link className={navCls('/')} to="/">Beranda</Link>
            <Link className={navCls('/tentang')} to="/tentang">Tentang</Link>
            <div className="nav-mega-wrap" onMouseEnter={openMega} onMouseLeave={scheduleClose}>
              <Link
                className={`nav-link${['/coworking', '/fnb', '/bisnis'].includes(pathname) ? ' active' : ''}`}
                to="/coworking"
              >
                Produk <Icon.Chevron />
              </Link>
              <div className={`mega mega-produk${megaOpen ? ' open' : ''}`}>
                {[
                  { icon: <Icon.Briefcase />, title: 'Coworking Space', desc: 'Share desk, dedicated desk & ruang tim', to: '/coworking' },
                  { icon: <Icon.Coffee />,    title: 'Food & Beverage',  desc: 'Kafe internal + diskon untuk member',  to: '/fnb'       },
                  { icon: <Icon.Award />,     title: 'Business Service', desc: 'PKP, ISO, dan pengurusan izin usaha',  to: '/bisnis'    },
                ].map((m, i) => (
                  <Link key={i} className="mega-item mega-item-span2" to={m.to}>
                    <span className="mega-icon">{m.icon}</span>
                    <div>
                      <p className="mega-title">{m.title}</p>
                      <p className="mega-desc">{m.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <Link className="nav-link" to="/media">Media</Link>
            <Link className={navCls('/kontak')} to="/kontak">Kontak</Link>
          </div>

          <div className="nav-actions">
            <UserMenuDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
}
