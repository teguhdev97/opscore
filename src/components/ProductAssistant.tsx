import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatApiUrl, requestProductReply } from '../lib/product-chat';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronUp, Send, Trash2, X } from 'lucide-react';
import './product-assistant.css';

type Message = { role: 'user' | 'assistant'; text: string; link?: string; label?: string; source?: 'ai' | 'faq' };
type ChatState = { open: boolean; consented: boolean; messages: Message[]; draft: string };
const storageKey = 'opscore-product-assistant-v1';
const welcome: Message = { role: 'assistant', text: 'Halo, saya Novia, asisten DokuresAI. Saya bisa membantu mengenali fitur, menjelaskan alur demo, dan menunjukkan tempat mulai. Apa yang ingin kamu ketahui?' };
const topics = [
  { keywords: /chatgpt|openai|\bgo\b|api|model/i, text: 'Panel ini menggunakan FAQ produk DokuresAI, belum terhubung ke ChatGPT. Langganan ChatGPT Go tidak mencakup penggunaan API. Integrasi penggunaan paket ChatGPT memerlukan dukungan resmi yang belum tersedia di DokuresAI.', link: '/app/settings', label: 'Lihat status integrasi' },
  { keywords: /harga|biaya|bayar|gratis|pricing|paket/i, text: 'Demo DokuresAI dapat dijelajahi tanpa pendaftaran. Harga paket produk belum ditetapkan. Fitur backend dan AI belum aktif pada prototype ini.', link: '/app', label: 'Jelajahi demo' },
  { keywords: /upload|unggah|pdf|dokumen|knowledge|sop/i, text: 'Knowledge Base adalah tempat untuk mencari dan melihat dokumen contoh. Klik Upload dokumen untuk mencoba alurnya. Saat ini upload hanya simulasi: PDF belum disimpan di server, dibaca, atau diindeks oleh AI.', link: '/app/knowledge', label: 'Buka Knowledge Base' },
  { keywords: /checklist|inspeksi|centang|action/i, text: 'Di Checklists, kamu dapat mencoba mencentang langkah inspeksi. Progres demo disimpan di browser yang sama. Pembuatan checklist otomatis dari SOP dan persetujuan oleh Safety Lead masih dalam rencana pengembangan.', link: '/app/checklists', label: 'Coba checklist' },
  { keywords: /rag|sitasi|citation|jawaban|assistant|asisten|\bai\b/i, text: 'AI Assistant memperagakan tanya jawab dengan referensi dokumen. Jawaban di halaman itu masih contoh, bukan hasil pembacaan PDF kamu. Versi yang direncanakan akan mencari potongan SOP dan menyertakan nama file serta nomor halaman.', link: '/app/assistant', label: 'Buka demo AI Assistant' },
  { keywords: /compliance|kepatuhan|audit|activity|aktivitas|laporan/i, text: 'Compliance dan Activity Log menampilkan contoh pemantauan tinjauan dokumen serta aktivitas tim. Angka dan catatannya masih data ilustrasi; belum menjadi bukti kepatuhan atau hasil audit nyata.', link: '/app/compliance', label: 'Lihat demo Compliance' },
  { keywords: /aiven|database|backend|tencent|workbuddy|integrasi|storage/i, text: 'Rencana DokuresAI memakai Aiven PostgreSQL untuk data, Tencent Cloud untuk layanan aplikasi dan penyimpanan, serta WorkBuddy melalui MCP. Prototype yang kamu lihat belum terhubung ke layanan tersebut.', link: '/app/settings', label: 'Lihat pengaturan' },
  { keywords: /login|register|daftar|akun|admin|operator|teknisi|role/i, text: 'Demo ini belum memakai login sungguhan. Profil dan workspace yang terlihat adalah contoh. Versi produk direncanakan membedakan Admin, Safety Lead, dan Operator agar dokumen serta inspeksi bisa dikelola sesuai peran.', link: '/app', label: 'Masuk workspace demo' },
  { keywords: /privasi|privacy|cookie|data|aman|hapus|simpan/i, text: 'Percakapan FAQ, status panel, dan beberapa progres demo disimpan di localStorage browser ini. Panel FAQ tidak mengirim pesan ke server AI. Tombol hapus di atas menghapus percakapan panel. Jangan masukkan dokumen atau informasi rahasia ke prototype.', link: '/app/settings', label: 'Lihat pengaturan demo' },
  { keywords: /mulai|cara|alur|flow|pakai|gunakan|demo|fitur/i, text: 'Mulai dari Knowledge Base untuk melihat SOP contoh, lalu coba AI Assistant, kemudian buka Checklists dan centang langkah inspeksi. Overview memberi ringkasan tampilan. Semua ini demo interaktif; pemrosesan PDF dan AI sungguhan belum aktif.', link: '/app/knowledge', label: 'Mulai dari Knowledge Base' },
  { keywords: /opscore|produk|apa|manfaat|untuk|tentang/i, text: 'DokuresAI adalah prototype workspace pengetahuan dan operasional untuk tim manufaktur. Tujuannya menyatukan SOP, membantu mencari jawaban bersumber, dan mengubah prosedur menjadi checklist inspeksi. Saat ini yang tersedia adalah frontend demo.', link: '/app', label: 'Jelajahi DokuresAI' },
];
function answer(question: string): Message {
  if (/^(halo|hai|hi|hello|pagi|siang|sore|malam)[!.,\s]*$/i.test(question)) return welcome;
  if (/^(makasih|terima kasih|thanks)[!.,\s]*$/i.test(question)) return { role: 'assistant', text: 'Sama-sama! Kamu bisa bertanya tentang fitur, alur demo, atau status pengembangan DokuresAI.' };
  const topic = topics.find(({ keywords }) => keywords.test(question));
  return topic ? { role: 'assistant', text: topic.text, link: topic.link, label: topic.label } : { role: 'assistant', text: 'Informasi itu belum ada di FAQ DokuresAI. Saya belum menggunakan model AI dan tidak bisa menafsirkan semua pertanyaan. Coba tanyakan cara mulai, upload SOP, checklist, atau harga produk.' };
}
function loadState(): ChatState {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved.open === 'boolean' && Array.isArray(saved.messages)) {
      const messages: Message[] = saved.messages.filter((m: Message) => m && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string').slice(-60).map((m: Message) => ({ role: m.role, text: m.text, source: m.source === 'ai' ? 'ai' : 'faq', ...(typeof m.link === 'string' && /^\/app(?:\/|$)/.test(m.link) ? { link: m.link, label: m.label } : {}) }));
      return { open: saved.open, consented: saved.consented === true, messages: messages.length ? messages : [welcome], draft: typeof saved.draft === 'string' ? saved.draft.slice(0, 1000) : '' };
    }
  } catch { /* Storage may be unavailable or from an older version. */ }
  return { open: false, consented: false, messages: [welcome], draft: '' };
}
export function ProductAssistant() {
  const [state, setState] = useState<ChatState>(loadState);
  const [profileOpen, setProfileOpen] = useState(false);
  const [endChatOpen, setEndChatOpen] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const lastQuestion = useRef('');
  const status = useQuery({
    queryKey: ['product-chat-status', chatApiUrl], enabled: Boolean(chatApiUrl) && state.open,
    queryFn: async ({ signal }) => {
      const response = await fetch(`${chatApiUrl}/api/chat/status`, { signal });
      if (!response.ok) throw new Error('Backend unavailable');
      const data = await response.json();
      return data.configured === true;
    }, retry: false, staleTime: 30000,
  });
  const aiReady = Boolean(chatApiUrl) && status.data === true && !status.isError;
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const messages = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { setStorageAvailable(false); }
  }, [state]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (state.open) input.current?.focus(); }, [state.open]);
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY >= Math.max(window.innerHeight, 600));
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => { if (messages.current) messages.current.scrollTop = messages.current.scrollHeight; }, [state.messages, state.open, pending, error]);
  function close() { setProfileOpen(false); setState(s => ({ ...s, open: false })); launcher.current?.focus(); }
  function clear() {
    request.current?.abort(); request.current = null;
    setPending(false); setError(''); lastQuestion.current = '';
    setEndChatOpen(false);
    setState(s => ({ ...s, consented: false, messages: [welcome], draft: '' }));
  }
  function agreeToChat() { setState(s => ({ ...s, consented: true })); }
  async function send(question = state.draft, retry = false) {
    const text = question.trim().slice(0, 1000);
    if (!text || request.current) return;
    const next = retry ? state.messages : [...state.messages, { role: 'user' as const, text }];
    lastQuestion.current = text; setError('');
    setState(s => ({ ...s, draft: '', messages: next.slice(-60) }));
    if (!aiReady) {
      setState(s => ({ ...s, messages: [...s.messages, { ...answer(text), source: 'faq' as const }].slice(-60) }));
      return;
    }
    const controller = new AbortController(); request.current = controller;
    setPending(true);
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const history = next.filter(m => m.role === 'user' || m.source === 'ai');
      const reply = await requestProductReply(history, controller.signal);
      if (request.current === controller) setState(s => ({ ...s, messages: [...s.messages, { role: 'assistant' as const, text: reply, source: 'ai' as const }].slice(-60) }));
    } catch (reason) {
      if (request.current === controller) setError(controller.signal.aborted ? 'Waktu tunggu habis. Coba lagi atau gunakan FAQ.' : reason instanceof Error ? reason.message : 'AI belum dapat menjawab.');
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) { request.current = null; setPending(false); }
    }
  }
  function useFaq() {
    setState(s => ({ ...s, messages: [...s.messages, { ...answer(lastQuestion.current), source: 'faq' as const }].slice(-60) }));
    setError('');
  }
  return <div className="product-chat">
    {state.open && <section id="product-chat-panel" className="product-chat-panel" role="dialog" aria-modal="false" aria-labelledby="product-chat-title" onKeyDown={e => { if (e.key === 'Escape') { if (profileOpen) { setProfileOpen(false); e.stopPropagation(); } else close(); } }}>
      <header className="product-chat-header">
        <button type="button" className="product-chat-avatar-button" aria-label="Lihat foto profil Novia" onClick={() => setProfileOpen(true)}><span className="product-chat-avatar"><img src="/novia-avatar.webp" alt=""/><i aria-label="Online"/></span></button>
        <div><h2 id="product-chat-title">Novia</h2><span className="product-chat-presence"><i/>Asisten AI DokuresAI · Online</span></div>
        <button aria-label="Hapus percakapan" title="Hapus percakapan" onClick={() => setEndChatOpen(true)}><Trash2 size={18}/></button>
        <button aria-label="Tutup chatbot" onClick={close}><X size={21}/></button>
      </header>
      {!state.consented ? <div className="product-chat-consent"><span className="product-chat-consent-avatar"><img src="/novia-avatar.webp" alt=""/></span><span className="product-chat-private">● Obrolan pribadi</span><h3>Yuk, mulai dari<br/>kebutuhanmu.</h3><p>Ceritakan fitur atau kendala operasional yang sedang kamu hadapi.</p><ul><li>Novia membantu menjawab satu pertanyaan setiap giliran.</li><li>Kamu dapat menemukan fitur dan alur DokuresAI.</li><li>Kamu bebas menutup atau menghapus obrolan kapan pun.</li></ul><small>Riwayat percakapan tersimpan di browser ini.</small><button type="button" className="product-chat-agree" onClick={agreeToChat}>Setuju, mulai ngobrol <ArrowUpRight size={20}/></button><span className="product-chat-consent-note">Persetujuan obrolan terpisah dari persetujuan analitik.</span></div> : <>
      <div className="product-chat-mode"><span/> {aiReady ? 'AI produk · Pengetahuan DokuresAI' : status.isFetching ? 'Memeriksa koneksi · FAQ tersedia' : 'FAQ lokal · AI belum terhubung'}</div>
      <div className="product-chat-messages" ref={messages} role="log" aria-live="polite" aria-label="Percakapan bantuan produk">
        {state.messages.map((message, index) => <div key={index} className={'product-chat-message ' + message.role}><p>{message.text}</p>{message.role === 'assistant' && message.source && <small className="product-chat-source">{message.source === 'ai' ? 'Jawaban AI · Periksa kembali informasi penting' : 'FAQ produk'}</small>}{message.link && <Link to={message.link}>{message.label}<ArrowUpRight size={14}/></Link>}</div>)}
        {pending && <div className="product-chat-message assistant" role="status"><p>DokuresAI sedang menjawab…</p></div>}
        {error && <div className="product-chat-error" role="alert"><p>{error}</p><button onClick={() => send(lastQuestion.current, true)}>Coba lagi</button><button onClick={useFaq}>Gunakan FAQ</button></div>}
        {state.messages.length === 1 && <div className="product-chat-prompts">{['Bagaimana cara mulai?', 'Apa fitur DokuresAI?', 'Apakah sudah memakai AI?'].map(q => <button key={q} onClick={() => send(q)}>{q}<ArrowUpRight size={13}/></button>)}</div>}
      </div>
      <form className="product-chat-compose" onSubmit={e => { e.preventDefault(); send(); }}>
        <div><input ref={input} aria-label="Pertanyaan untuk Novia" placeholder="Tanya Novia…" maxLength={1000} value={state.draft} onChange={e => setState(s => ({ ...s, draft: e.target.value }))}/><button type="submit" aria-label="Kirim pertanyaan" disabled={!state.draft.trim() || pending || Boolean(error)}><Send size={20}/></button></div>
        <small>{aiReady ? 'Saat dikirim, pesan dan riwayat terbatas diteruskan ke provider AI. Jangan bagikan informasi rahasia.' : 'FAQ lokal, bukan AI generatif. Pesan baru tidak dikirim ke provider AI.'} {storageAvailable ? 'Riwayat tersimpan di browser ini.' : 'Riwayat hanya untuk sesi ini.'}</small>
      </form>
      </>}
      {endChatOpen && <div className="product-chat-end-overlay" role="presentation" onClick={() => setEndChatOpen(false)}><section className="product-chat-end-dialog" role="dialog" aria-modal="true" aria-labelledby="product-chat-end-title" onClick={e => e.stopPropagation()}><h3 id="product-chat-end-title">Hapus percakapan?</h3><p>Percakapan ini akan dihapus dari tampilan dan kamu akan kembali ke halaman persetujuan chat.</p><div><button type="button" onClick={() => setEndChatOpen(false)}>Batal</button><button type="button" className="danger" onClick={clear}>Hapus chat</button></div></section></div>}
    </section>}
    {profileOpen && <div className="product-chat-profile-overlay" role="presentation" onClick={() => setProfileOpen(false)} onKeyDown={e => { if (e.key === 'Escape') setProfileOpen(false); }}>
      <section className="product-chat-profile-view" role="dialog" aria-modal="false" aria-labelledby="product-chat-profile-title" onClick={e => e.stopPropagation()}>
        <button type="button" className="product-chat-profile-close" aria-label="Tutup foto profil dan kembali ke chat" onClick={() => setProfileOpen(false)}><X size={22}/></button>
        <img className="product-chat-profile-image" src="/novia-profile-panel.png" alt="Novia melambaikan tangan di kantor DokuresAI"/>
        <div className="product-chat-profile-footer">
          <div><strong id="product-chat-profile-title">Novia</strong><span>Asisten AI DokuresAI</span><small><i/> Online</small></div>
          <button type="button" onClick={() => setProfileOpen(false)}>Kembali ke chat</button>
        </div>
      </section>
    </div>}
    {showScroll && <button className="product-chat-scroll-top" aria-label="Kembali ke atas" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><ChevronUp size={20} strokeWidth={2.25}/></button>}
    <button ref={launcher} className={'product-chat-launcher' + (state.open ? ' is-open' : '')} aria-label={state.open ? 'Tutup chat Novia' : 'Tanya Novia'} aria-expanded={state.open} aria-controls="product-chat-panel" onClick={() => state.open ? close() : setState(s => ({ ...s, open: true }))}>
      {state.open ? <X size={25} aria-hidden="true"/> : <><span className="product-chat-launcher-avatar"><img src="/novia-avatar.webp" alt=""/><i aria-label="Online"/></span><span className="product-chat-launcher-label">Tanya Novia</span></>}
    </button>
  </div>;
}
