import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AdminIcon } from './AdminIcons';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../../img/kaspa-space-logo.png';

const NAV_ITEMS = [
  { to: '/admin',          label: 'Dashboard',  icon: 'Dashboard', end: true },
  { to: '/admin/produk',   label: 'Produk',     icon: 'Tag'   },
  { to: '/admin/ruangan',  label: 'Ruangan',    icon: 'Door'  },
  { to: '/admin/booking',  label: 'Booking',    icon: 'Ticket' },
  { to: '/admin/diskon',   label: 'Diskon',     icon: 'Tag'    },
  { to: '/admin/ulasan',   label: 'Ulasan',     icon: 'Star'   },
  { to: '/admin/artikel',  label: 'Artikel',    icon: 'Ticket' },
  { to: '/admin/member',   label: 'Akun',       icon: 'Users'  },
  { to: '/admin/laporan',  label: 'Laporan',    icon: 'Chart'  },
];

const SETTING_ITEMS = [
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: 'Cog' },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/masuk', { replace: true });
    else if (user.role !== 'admin') navigate('/', { replace: true });
  }, [user, loading, navigate]);

  async function handleLogout() {
    await logout();
    navigate('/masuk');
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <div className="admin-body">
      <div className="admin-shell">
        <aside className="admin-side">
          <a className="admin-logo" href="/admin">
            <img src={logoImg} alt="Kaspa Space" className="logo-img" />
            <span className="admin-logo-badge">Admin</span>
          </a>

          <nav className="admin-nav">
            <div className="admin-nav-section">Menu Utama</div>
            {NAV_ITEMS.map(({ to, label, icon, end }) => {
              const Icon = AdminIcon[icon as keyof typeof AdminIcon];
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `admin-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <span className="admin-nav-icon">
                    <Icon />
                  </span>
                  {label}
                </NavLink>
              );
            })}

            <div className="admin-nav-section">Sistem</div>
            {SETTING_ITEMS.map(({ to, label, icon }) => {
              const Icon = AdminIcon[icon as keyof typeof AdminIcon];
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `admin-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <span className="admin-nav-icon">
                    <Icon />
                  </span>
                  {label}
                </NavLink>
              );
            })}
          </nav>

          <div className="admin-side-foot">
            <div className="admin-avatar">{initials}</div>
            <div>
              <p className="admin-name">{user?.name ?? 'Admin'}</p>
              <p className="admin-role">{user?.email ?? ''}</p>
            </div>
            <button
              type="button"
              title="Keluar"
              onClick={handleLogout}
            >
              <AdminIcon.LogOut />
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar-search">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input placeholder="Cari ruangan, member, booking..." />
            </div>

            <button type="button" className="admin-topbar-btn" title="Notifikasi">
              <AdminIcon.Bell />
              <span className="dot" />
            </button>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
