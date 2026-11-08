import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './landing-footer.css';

const groups = [
  { title: 'Produk', links: [['Knowledge Base', '/app/knowledge'], ['AI Assistant', '/app/assistant'], ['Checklists', '/app/checklists'], ['Compliance', '/app/compliance']] },
  { title: 'Jelajahi', links: [['Overview', '/app'], ['Activity Log', '/app/activity'], ['Pengaturan', '/app/settings']] },
];

export function LandingFooter() {
  return <footer className="landing-footer">
    <div className="landing-footer-top">
      <div className="landing-footer-brand"><Link to="/" className="logo" aria-label="DokuresAI beranda"><img className="logo-mark-image" src="/dokuresai-logo.png" alt="DokuresAI" /><span className="logo-word">Dokures<span>AI</span></span></Link><p>Pengetahuan tim, terhubung dengan pekerjaan sehari-hari. Satu workspace untuk operasional manufaktur yang lebih terarah.</p><span className="footer-demo-label"><i/> Prototype interaktif</span></div>
      {groups.map(group => <nav key={group.title} aria-label={'Footer ' + group.title}><h3>{group.title}</h3>{group.links.map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</nav>)}
      <nav aria-label="Footer tentang"><h3>Tentang</h3><a href="#platform">Platform</a><a href="#workflow">Cara kerja</a><a href="#benefits">Mengapa DokuresAI</a><a href="https://github.com/teguhdev97/opscore" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></nav>
    </div>
    <div className="landing-footer-statement"><p>Knowledge connected.<br className="footer-mobile-break"/> Action <em>simplified.</em></p></div>
    <div className="landing-footer-bottom"><span>© {new Date().getFullYear()} DokuresAI. Every action, properly approved.</span><span>Dirancang untuk tim manufaktur · Indonesia</span></div>
  </footer>;
}
