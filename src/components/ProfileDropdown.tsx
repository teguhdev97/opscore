import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Languages, LogOut, Monitor, Moon, Settings, Sun, UserRound } from 'lucide-react';
import { apiClient } from '../lib/api';
import './profile-dropdown.css';

export function getAccount() {
  try {
    const value = JSON.parse(localStorage.getItem('opscore-user') || '{}');
    const email = typeof value.email === 'string' ? value.email : '';
    const name = typeof value.name === 'string' && value.name.trim() ? value.name : email.split('@')[0] || 'Pengguna';
    return { name, email, role: typeof value.role === 'string' ? value.role : 'user', initials: name.split(/[\s._-]+/).slice(0, 2).map((word: string) => word[0]).join('').toUpperCase() };
  } catch {
    return { name: 'Pengguna', email: '', role: 'user', initials: 'U' };
  }
}

type Theme = 'light' | 'dark' | 'system';

export function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('opscore-theme');
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('opscore-language') === 'en' ? 'en' : 'id');
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const account = getAccount();
  const english = language === 'en';

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => { document.documentElement.dataset.theme = theme === 'system' ? media.matches ? 'dark' : 'light' : theme; };
    apply();
    localStorage.setItem('opscore-theme', theme);
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  useEffect(() => { localStorage.setItem('opscore-language', language); }, [language]);
  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return <div className="account-dropdown" ref={container} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <button ref={trigger} className="account-trigger" aria-label={english ? 'Open account menu' : 'Buka menu akun'} aria-expanded={open} aria-controls="account-dropdown-panel" onClick={() => setOpen(value => !value)}>
      <span className="user-avatar small">{account.initials}</span>
    </button>
    {open && <section id="account-dropdown-panel" className="account-panel" aria-label={english ? 'Account menu' : 'Menu akun'}>
      <div className="account-summary"><span className="account-avatar">{account.initials}</span><div><strong>{account.name}</strong><span>{account.email}</span></div></div>
      <p className="account-role">{account.role === 'admin' ? 'Admin' : english ? 'User' : 'Pengguna'} <span>· {english ? 'Workspace access' : 'Akses workspace'}</span></p>
      <div className="account-group">
        <Link ref={firstLink} to="/app/profile"><UserRound size={20}/>{english ? 'Profile' : 'Profil'}</Link>
        <Link to="/app/settings"><Settings size={20}/>{english ? 'Settings' : 'Pengaturan'}</Link>
      </div>
      <fieldset className="account-options"><legend>{english ? 'Theme' : 'Tema'}</legend>
        {([{ value: 'light', icon: Sun, label: english ? 'Light' : 'Terang' }, { value: 'dark', icon: Moon, label: english ? 'Dark' : 'Gelap' }, { value: 'system', icon: Monitor, label: english ? 'System' : 'Sistem' }] as const).map(({ value, icon: Icon, label }) => <label key={value}><input type="radio" name="account-theme" value={value} checked={theme === value} onChange={() => setTheme(value)}/><Icon size={20}/>{label}</label>)}
      </fieldset>
      <fieldset className="account-options"><legend><Languages size={17}/>{english ? 'Language' : 'Bahasa'}</legend>
        {[['id', 'Bahasa Indonesia'], ['en', 'English']].map(([value, label]) => <label key={value}><input type="radio" name="account-language" value={value} checked={language === value} onChange={() => setLanguage(value)}/>{label}</label>)}
      </fieldset>
      <div className="account-group account-exit"><button onClick={() => { apiClient.clearToken(); localStorage.removeItem('opscore-user'); navigate('/auth/login', { replace: true }); }}><LogOut size={20}/>{english ? 'Log out' : 'Keluar'}</button></div>
    </section>}
  </div>;
}

export function AccountProfile() {
  const account = getAccount();
  return <section className="panel account-page"><h1>Profil akun</h1><p>Informasi akun yang sedang masuk ke DokuresAI.</p><span className="account-avatar">{account.initials}</span><dl><dt>Nama tampilan</dt><dd>{account.name}</dd><dt>Email</dt><dd>{account.email || 'Belum tersedia'}</dd><dt>Peran</dt><dd>{account.role}</dd></dl><Link className="btn outline" to="/app/settings">Pengaturan workspace</Link></section>;
}
