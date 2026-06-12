/* global React, ReactDOM, Icon */
const { useState: useAuthState } = React;

/* Extra icons */
const AuthIcon = {
  Mail: Icon.Mail,
  Lock: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  User: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Phone: Icon.Phone,
  Eye: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Google: (p) => <svg width="20" height="20" viewBox="0 0 24 24" {...p}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a6.5 6.5 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
};

/* ============================================
   AUTH PAGE
   ============================================ */
function AuthPage() {
  const [mode, setMode] = useAuthState("login");
  const [showPwd, setShowPwd] = useAuthState(false);
  const [pwd, setPwd] = useAuthState("");
  const [email, setEmail] = useAuthState("");
  const [name, setName] = useAuthState("");
  const [phone, setPhone] = useAuthState("");

  const doLogin = (e) => {
    e.preventDefault();
    window.KaspaSession.login(email ? { email } : null);
    window.location.href = "#/dashboard";
  };
  const doRegister = (e) => {
    e.preventDefault();
    window.KaspaSession.login({
      name: name || "Member Baru",
      email: email || "member@kaspaspace.com",
      phone: phone || "",
    });
    window.location.href = "#/dashboard";
  };
  const useDemo = () => {
    window.KaspaSession.login();
    window.location.href = "#/dashboard";
  };

  // Simple password strength meter
  const strength = (() => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^a-zA-Z0-9]/.test(pwd)) s++;
    return s;
  })();
  const strengthLabel = ["Mulai ketik", "Lemah", "Cukup", "Bagus", "Sangat kuat"][strength];

  return (
    <div className="auth-page">
      {/* Brand panel */}
      <aside className="auth-brand">
        <div className="auth-brand-bg">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
            alt="Coworking space"
          />
        </div>
        <div className="auth-brand-inner">
          <a className="auth-back" href="#/home">
            <Icon.ChevLeft /> Kembali ke Beranda
          </a>

          <div className="auth-brand-content">
            <a href="#/home" className="logo">
              <span className="logo-mark">Kaspa</span>
              <span className="logo-sub">Space</span>
            </a>
            <h2 className="auth-brand-title">
              {mode === "login" ? <>Selamat <em>Datang Kembali</em></> : <>Bergabung dengan <em>Komunitas Kami</em></>}
            </h2>
            <p className="auth-brand-sub">
              {mode === "login"
                ? "Masuk untuk booking ruangan, kelola reservasi, dan akses semua benefit member."
                : "Daftar gratis dalam 1 menit dan mulai bekerja dari Kaspa Space hari ini juga."}
            </p>

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
                  <p className="auth-perk-desc">Diskon F&B 20%, kopi gratis, dan layanan legalitas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <div className="auth-form-side">
        <div className="auth-card">
          <a href="#/home" className="logo auth-logo-mobile" style={{ justifyContent: "center" }}>
            <span className="logo-mark">Kaspa</span>
            <span className="logo-sub">Space</span>
          </a>

          {/* Tabs */}
          <div className="auth-tabs">
            <div className={`auth-tab-slider ${mode === "register" ? "right" : ""}`}></div>
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
              Masuk
            </button>
            <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>
              Daftar
            </button>
          </div>

          {mode === "login" ? (
            <>
              <h1 className="auth-heading">Masuk ke <em>Akun</em></h1>
              <p className="auth-sub">Belum punya akun? <a className="auth-link" href="#" onClick={(e) => { e.preventDefault(); setMode("register"); }}>Daftar gratis</a></p>

              <div className="auth-demo">
                <div className="auth-demo-txt">
                  <strong>Coba sebagai pembeli</strong>
                  <span>Akun demo lengkap dengan riwayat pesanan & diskon loyalitas.</span>
                </div>
                <button type="button" className="auth-demo-btn" onClick={useDemo}>Masuk Demo</button>
              </div>

              <form className="auth-form" onSubmit={doLogin}>
                <div className="auth-field">
                  <label>Email</label>
                  <div className="auth-input-wrap">
                    <AuthIcon.Mail />
                    <input type="email" placeholder="adit@demo.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Kata Sandi</label>
                  <div className="auth-input-wrap">
                    <AuthIcon.Lock />
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      value={pwd}
                      onChange={e => setPwd(e.target.value)}
                    />
                    <button type="button" className="auth-pwd-toggle" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password">
                      {showPwd ? <AuthIcon.EyeOff /> : <AuthIcon.Eye />}
                    </button>
                  </div>
                </div>

                <div className="auth-meta">
                  <label className="auth-check">
                    <input type="checkbox" defaultChecked />
                    Ingat saya
                  </label>
                  <a href="#" className="auth-link">Lupa kata sandi?</a>
                </div>

                <button type="submit" className="auth-submit">
                  Masuk <Icon.Arrow />
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="auth-heading">Buat <em>Akun Baru</em></h1>
              <p className="auth-sub">Sudah punya akun? <a className="auth-link" href="#" onClick={(e) => { e.preventDefault(); setMode("login"); }}>Masuk di sini</a></p>

              <form className="auth-form" onSubmit={doRegister}>
                <div className="auth-field">
                  <label>Nama Lengkap</label>
                  <div className="auth-input-wrap">
                    <AuthIcon.User />
                    <input type="text" placeholder="Adit Pratama" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Email</label>
                  <div className="auth-input-wrap">
                    <AuthIcon.Mail />
                    <input type="email" placeholder="email@kaspaspace.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="auth-field">
                  <label>No. WhatsApp</label>
                  <div className="auth-input-wrap">
                    <AuthIcon.Phone />
                    <input type="tel" placeholder="+62 812 3456 7890" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Kata Sandi</label>
                  <div className="auth-input-wrap">
                    <AuthIcon.Lock />
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={pwd}
                      onChange={e => setPwd(e.target.value)}
                    />
                    <button type="button" className="auth-pwd-toggle" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password">
                      {showPwd ? <AuthIcon.EyeOff /> : <AuthIcon.Eye />}
                    </button>
                  </div>
                  <div className="pwd-strength">
                    <div className="pwd-bar">
                      {[0,1,2,3].map(i => (
                        <div
                          key={i}
                          className={`pwd-bar-seg ${
                            i < strength
                              ? (strength <= 1 ? "weak" : strength <= 2 ? "med" : "strong")
                              : ""
                          }`}
                        ></div>
                      ))}
                    </div>
                    <span className="pwd-label">{strengthLabel}</span>
                  </div>
                </div>

                <label className="auth-check" style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
                  <input type="checkbox" />
                  Saya setuju dengan <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); window.openLegal("terms"); }}>Syarat</a> & <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); window.openLegal("privacy"); }}>Privasi</a>
                </label>

                <button type="submit" className="auth-submit">
                  Buat Akun <Icon.Arrow />
                </button>
              </form>
            </>
          )}

          <p className="auth-footer">
            Dilindungi oleh enkripsi end-to-end. <a className="auth-link" href="#" onClick={(e) => { e.preventDefault(); window.openLegal("security"); }}>Pelajari keamanan kami</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

(window.KaspaPages = window.KaspaPages || {})["auth"] = AuthPage;
