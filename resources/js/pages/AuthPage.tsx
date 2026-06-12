import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/icons';
import { useAuth, ApiError } from '../contexts/AuthContext';
import logoImg from '../../img/kaspa-space-logo.png';

/* ============================================
   LOCAL ICONS
   ============================================ */
type SvgProps = React.SVGProps<SVGSVGElement>;

function LockIcon(p: SvgProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UserIcon(p: SvgProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EyeIcon(p: SvgProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(p: SvgProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ============================================
   PASSWORD STRENGTH
   ============================================ */
const STRENGTH_LABELS = ['Mulai ketik', 'Lemah', 'Cukup', 'Bagus', 'Sangat kuat'];

function computeStrength(pwd: string): number {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  return s;
}

function strengthSegClass(segIndex: number, strength: number): string {
  if (segIndex >= strength) return '';
  if (strength <= 1) return 'weak';
  if (strength <= 2) return 'med';
  return 'strong';
}

/* ============================================
   FIELD ERROR
   ============================================ */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span className="auth-field-error">{msg}</span>;
}

/* ============================================
   LOGIN FORM
   ============================================ */
interface LoginFormProps {
  onSwitchToRegister: () => void;
}

function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      const loggedIn = await login(email, pwd, remember);
      navigate(loggedIn.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      if (err instanceof ApiError) {
        const fe: Record<string, string> = {};
        if (err.data.errors) {
          for (const [k, v] of Object.entries(err.data.errors)) {
            fe[k] = v[0];
          }
        }
        if (Object.keys(fe).length > 0) {
          setFieldErrors(fe);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="auth-heading">Masuk ke <em>Akun</em></h1>
      <p className="auth-sub">
        Belum punya akun?{' '}
        <a className="auth-link" href="#" onClick={e => { e.preventDefault(); onSwitchToRegister(); }}>
          Daftar gratis
        </a>
      </p>

      {generalError && <p className="auth-alert">{generalError}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Email</label>
          <div className={`auth-input-wrap${fieldErrors.email ? ' error' : ''}`}>
            <Icon.Mail />
            <input
              type="email"
              placeholder="email@kaspaspace.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <FieldError msg={fieldErrors.email} />
        </div>

        <div className="auth-field">
          <label>Kata Sandi</label>
          <div className={`auth-input-wrap${fieldErrors.password ? ' error' : ''}`}>
            <LockIcon />
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-pwd-toggle"
              onClick={() => setShowPwd(v => !v)}
              aria-label="Toggle password"
            >
              {showPwd ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <FieldError msg={fieldErrors.password} />
        </div>

        <div className="auth-meta">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            Ingat saya
          </label>
          <a href="#" className="auth-link">Lupa kata sandi?</a>
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Memproses…' : <>Masuk <Icon.Arrow /></>}
        </button>
      </form>
    </>
  );
}

/* ============================================
   REGISTER FORM
   ============================================ */
interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pwd, setPwd] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const strength = computeStrength(pwd);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    if (!terms) {
      setGeneralError('Anda harus menyetujui syarat dan ketentuan.');
      return;
    }

    setLoading(true);

    try {
      const registered = await register(name, email, phone, pwd);
      navigate(registered.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      if (err instanceof ApiError) {
        const fe: Record<string, string> = {};
        if (err.data.errors) {
          for (const [k, v] of Object.entries(err.data.errors)) {
            fe[k] = v[0];
          }
        }
        if (Object.keys(fe).length > 0) {
          setFieldErrors(fe);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="auth-heading">Buat <em>Akun Baru</em></h1>
      <p className="auth-sub">
        Sudah punya akun?{' '}
        <a className="auth-link" href="#" onClick={e => { e.preventDefault(); onSwitchToLogin(); }}>
          Masuk di sini
        </a>
      </p>

      {generalError && <p className="auth-alert">{generalError}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Nama Lengkap</label>
          <div className={`auth-input-wrap${fieldErrors.name ? ' error' : ''}`}>
            <UserIcon />
            <input
              type="text"
              placeholder="Adit Pratama"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <FieldError msg={fieldErrors.name} />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <div className={`auth-input-wrap${fieldErrors.email ? ' error' : ''}`}>
            <Icon.Mail />
            <input
              type="email"
              placeholder="email@kaspaspace.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <FieldError msg={fieldErrors.email} />
        </div>

        <div className="auth-field">
          <label>No. WhatsApp</label>
          <div className={`auth-input-wrap${fieldErrors.phone ? ' error' : ''}`}>
            <Icon.Phone />
            <input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <FieldError msg={fieldErrors.phone} />
        </div>

        <div className="auth-field">
          <label>Kata Sandi</label>
          <div className={`auth-input-wrap${fieldErrors.password ? ' error' : ''}`}>
            <LockIcon />
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Minimal 8 karakter"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-pwd-toggle"
              onClick={() => setShowPwd(v => !v)}
              aria-label="Toggle password"
            >
              {showPwd ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <div className="pwd-strength">
            <div className="pwd-bar">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`pwd-bar-seg ${strengthSegClass(i, strength)}`} />
              ))}
            </div>
            <span className="pwd-label">{STRENGTH_LABELS[strength]}</span>
          </div>
          <FieldError msg={fieldErrors.password} />
        </div>

        <label className="auth-check auth-check-terms">
          <input
            type="checkbox"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
          />
          Saya setuju dengan{' '}
          <a href="#" className="auth-link">Syarat</a>
          {' '}&amp;{' '}
          <a href="#" className="auth-link">Privasi</a>
        </label>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Memproses…' : <>Buat Akun <Icon.Arrow /></>}
        </button>
      </form>
    </>
  );
}

/* ============================================
   PAGE
   ============================================ */
export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'daftar' ? 'register' : 'login'
  );

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  const brandTitle = mode === 'login'
    ? <>Selamat <em>Datang Kembali</em></>
    : <>Bergabung dengan <em>Komunitas Kami</em></>;

  const brandSub = mode === 'login'
    ? 'Masuk untuk booking ruangan, kelola reservasi, dan akses semua benefit member.'
    : 'Daftar gratis dalam 1 menit dan mulai bekerja dari Kaspa Space hari ini juga.';

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand-bg">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
            alt="Coworking space"
          />
        </div>
        <div className="auth-brand-inner">
          <Link className="auth-back" to="/">
            <Icon.ChevLeft /> Kembali ke Beranda
          </Link>

          <div className="auth-brand-content">
            <Link to="/" className="logo">
              <img src={logoImg} alt="Kaspa Space" className="logo-img" />
            </Link>
            <h2 className="auth-brand-title">{brandTitle}</h2>
            <p className="auth-brand-sub">{brandSub}</p>

            <div className="auth-perks">
              <div className="auth-perk">
                <span className="auth-perk-icon"><Icon.Zap /></span>
                <div>
                  <p className="auth-perk-title">Booking Instan</p>
                  <p className="auth-perk-desc">Pesan ruang dalam 4 langkah, konfirmasi otomatis.</p>
                </div>
              </div>
              <div className="auth-perk">
                <span className="auth-perk-icon"><Icon.Users /></span>
                <div>
                  <p className="auth-perk-title">500+ Komunitas</p>
                  <p className="auth-perk-desc">Akses event networking, workshop, dan mentoring.</p>
                </div>
              </div>
              <div className="auth-perk">
                <span className="auth-perk-icon"><Icon.Award /></span>
                <div>
                  <p className="auth-perk-title">Benefit Eksklusif</p>
                  <p className="auth-perk-desc">Diskon F&amp;B 20% dan layanan legalitas eksklusif.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="logo auth-logo-mobile" style={{ justifyContent: 'center' }}>
            <img src={logoImg} alt="Kaspa Space" className="logo-img" />
          </Link>

          <div className="auth-tabs">
            <div className={`auth-tab-slider${mode === 'register' ? ' right' : ''}`} />
            <button
              type="button"
              className={`auth-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => setMode('login')}
            >
              Masuk
            </button>
            <button
              type="button"
              className={`auth-tab${mode === 'register' ? ' active' : ''}`}
              onClick={() => setMode('register')}
            >
              Daftar
            </button>
          </div>

          {mode === 'login'
            ? <LoginForm onSwitchToRegister={() => setMode('register')} />
            : <RegisterForm onSwitchToLogin={() => setMode('login')} />}

          <p className="auth-footer">
            Dilindungi oleh enkripsi end-to-end.{' '}
            <a className="auth-link" href="#">Pelajari keamanan kami</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
