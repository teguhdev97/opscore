import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageCircle, Send, Sparkles, Trash2, X } from 'lucide-react';
import './product-assistant.css';

type Message = { role: 'user' | 'assistant'; text: string; link?: string; label?: string };
type ChatState = { open: boolean; messages: Message[]; draft: string };
const storageKey = 'opscore-product-assistant-v1';
const welcome: Message = { role: 'assistant', text: 'Halo, saya asisten OpsCore. Saya bisa membantu mengenali fitur, menjelaskan alur demo, dan menunjukkan tempat mulai. Apa yang ingin kamu ketahui?' };
const topics = [
  { keywords: /chatgpt|openai|\bgo\b|api|model/i, text: 'Panel ini menggunakan FAQ produk OpsCore, belum terhubung ke ChatGPT. Langganan ChatGPT Go tidak mencakup penggunaan API. Integrasi penggunaan paket ChatGPT memerlukan dukungan resmi yang belum tersedia di OpsCore.', link: '/app/settings', label: 'Lihat status integrasi' },
  { keywords: /harga|biaya|bayar|gratis|pricing|paket/i, text: 'Demo OpsCore dapat dijelajahi tanpa pendaftaran. Harga paket produk belum ditetapkan. Fitur backend dan AI belum aktif pada prototype ini.', link: '/app', label: 'Jelajahi demo' },
  { keywords: /upload|unggah|pdf|dokumen|knowledge|sop/i, text: 'Knowledge Base adalah tempat untuk mencari dan melihat dokumen contoh. Klik Upload dokumen untuk mencoba alurnya. Saat ini upload hanya simulasi: PDF belum disimpan di server, dibaca, atau diindeks oleh AI.', link: '/app/knowledge', label: 'Buka Knowledge Base' },
  { keywords: /checklist|inspeksi|centang|action/i, text: 'Di Checklists, kamu dapat mencoba mencentang langkah inspeksi. Progres demo disimpan di browser yang sama. Pembuatan checklist otomatis dari SOP dan persetujuan oleh Safety Lead masih dalam rencana pengembangan.', link: '/app/checklists', label: 'Coba checklist' },
  { keywords: /rag|sitasi|citation|jawaban|assistant|asisten|\bai\b/i, text: 'AI Assistant memperagakan tanya jawab dengan referensi dokumen. Jawaban di halaman itu masih contoh, bukan hasil pembacaan PDF kamu. Versi yang direncanakan akan mencari potongan SOP dan menyertakan nama file serta nomor halaman.', link: '/app/assistant', label: 'Buka demo AI Assistant' },
  { keywords: /compliance|kepatuhan|audit|activity|aktivitas|laporan/i, text: 'Compliance dan Activity Log menampilkan contoh pemantauan tinjauan dokumen serta aktivitas tim. Angka dan catatannya masih data ilustrasi; belum menjadi bukti kepatuhan atau hasil audit nyata.', link: '/app/compliance', label: 'Lihat demo Compliance' },
  { keywords: /aiven|database|backend|tencent|workbuddy|integrasi|storage/i, text: 'Rencana OpsCore memakai Aiven PostgreSQL untuk data, Tencent Cloud untuk layanan aplikasi dan penyimpanan, serta WorkBuddy melalui MCP. Prototype yang kamu lihat belum terhubung ke layanan tersebut.', link: '/app/settings', label: 'Lihat pengaturan' },
  { keywords: /login|register|daftar|akun|admin|operator|teknisi|role/i, text: 'Demo ini belum memakai login sungguhan. Profil dan workspace yang terlihat adalah contoh. Versi produk direncanakan membedakan Admin, Safety Lead, dan Operator agar dokumen serta inspeksi bisa dikelola sesuai peran.', link: '/app', label: 'Masuk workspace demo' },
  { keywords: /privasi|privacy|cookie|data|aman|hapus|simpan/i, text: 'Percakapan FAQ, status panel, dan beberapa progres demo disimpan di localStorage browser ini. Panel FAQ tidak mengirim pesan ke server AI. Tombol hapus di atas menghapus percakapan panel. Jangan masukkan dokumen atau informasi rahasia ke prototype.', link: '/app/settings', label: 'Lihat pengaturan demo' },
  { keywords: /mulai|cara|alur|flow|pakai|gunakan|demo|fitur/i, text: 'Mulai dari Knowledge Base untuk melihat SOP contoh, lalu coba AI Assistant, kemudian buka Checklists dan centang langkah inspeksi. Overview memberi ringkasan tampilan. Semua ini demo interaktif; pemrosesan PDF dan AI sungguhan belum aktif.', link: '/app/knowledge', label: 'Mulai dari Knowledge Base' },
  { keywords: /opscore|produk|apa|manfaat|untuk|tentang/i, text: 'OpsCore adalah prototype workspace pengetahuan dan operasional untuk tim manufaktur. Tujuannya menyatukan SOP, membantu mencari jawaban bersumber, dan mengubah prosedur menjadi checklist inspeksi. Saat ini yang tersedia adalah frontend demo.', link: '/app', label: 'Jelajahi OpsCore' },
];
function answer(question: string): Message {
  if (/^(halo|hai|hi|hello|pagi|siang|sore|malam)[!.,\s]*$/i.test(question)) return welcome;
  if (/^(makasih|terima kasih|thanks)[!.,\s]*$/i.test(question)) return { role: 'assistant', text: 'Sama-sama! Kamu bisa bertanya tentang fitur, alur demo, atau status pengembangan OpsCore.' };
  const topic = topics.find(({ keywords }) => keywords.test(question));
  return topic ? { role: 'assistant', text: topic.text, link: topic.link, label: topic.label } : { role: 'assistant', text: 'Informasi itu belum ada di FAQ OpsCore. Saya belum menggunakan model AI dan tidak bisa menafsirkan semua pertanyaan. Coba tanyakan cara mulai, upload SOP, checklist, atau harga produk.' };
}
function loadState(): ChatState {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved.open === 'boolean' && Array.isArray(saved.messages)) {
      const messages: Message[] = saved.messages.filter((m: Message) => m && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string').slice(-60).map((m: Message) => ({ role: m.role, text: m.text, ...(typeof m.link === 'string' && /^\/app(?:\/|$)/.test(m.link) ? { link: m.link, label: m.label } : {}) }));
      return { open: saved.open, messages: messages.length ? messages : [welcome], draft: typeof saved.draft === 'string' ? saved.draft.slice(0, 1000) : '' };
    }
  } catch { /* Storage may be unavailable or from an older version. */ }
  return { open: false, messages: [welcome], draft: '' };
}
export function ProductAssistant() {
  const [state, setState] = useState<ChatState>(loadState);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const messages = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { setStorageAvailable(false); }
  }, [state]);
  useEffect(() => { if (state.open) input.current?.focus(); }, [state.open]);
  useEffect(() => { if (messages.current) messages.current.scrollTop = messages.current.scrollHeight; }, [state.messages, state.open]);
  function close() { setState(s => ({ ...s, open: false })); launcher.current?.focus(); }
  function send(question = state.draft) {
    const text = question.trim().slice(0, 1000);
    if (!text) return;
    setState(s => ({ ...s, draft: '', messages: [...s.messages, { role: 'user' as const, text }, answer(text)].slice(-60) }));
  }
  return <div className="product-chat">
    {state.open && <section id="product-chat-panel" className="product-chat-panel" role="dialog" aria-modal="false" aria-labelledby="product-chat-title" onKeyDown={e => { if (e.key === 'Escape') close(); }}>
      <header className="product-chat-header">
        <span className="product-chat-avatar"><Sparkles size={23}/><i/></span>
        <div><h2 id="product-chat-title">Tanya OpsCore</h2><span>Panduan produk · FAQ</span></div>
        <button aria-label="Hapus percakapan" title="Hapus percakapan" onClick={() => setState(s => ({ ...s, messages: [welcome], draft: '' }))}><Trash2 size={18}/></button>
        <button aria-label="Tutup chatbot" onClick={close}><X size={21}/></button>
      </header>
      <div className="product-chat-mode"><span/> FAQ produk aktif · Belum terhubung ke ChatGPT</div>
      <div className="product-chat-messages" ref={messages} role="log" aria-live="polite" aria-label="Percakapan bantuan produk">
        {state.messages.map((message, index) => <div key={index} className={'product-chat-message ' + message.role}><p>{message.text}</p>{message.link && <Link to={message.link}>{message.label}<ArrowUpRight size={14}/></Link>}</div>)}
        {state.messages.length === 1 && <div className="product-chat-prompts">{['Bagaimana cara mulai?', 'Apa fitur OpsCore?', 'Apakah sudah memakai AI?'].map(q => <button key={q} onClick={() => send(q)}>{q}<ArrowUpRight size={13}/></button>)}</div>}
      </div>
      <form className="product-chat-compose" onSubmit={e => { e.preventDefault(); send(); }}>
        <div><input ref={input} aria-label="Pertanyaan tentang OpsCore" placeholder="Tanya tentang OpsCore…" maxLength={1000} value={state.draft} onChange={e => setState(s => ({ ...s, draft: e.target.value }))}/><button type="submit" aria-label="Kirim pertanyaan" disabled={!state.draft.trim()}><Send size={20}/></button></div>
        <small>{storageAvailable ? 'FAQ, bukan AI generatif. Riwayat tersimpan di browser ini.' : 'Penyimpanan browser tidak tersedia. Riwayat hanya untuk sesi ini.'}</small>
      </form>
    </section>}
    <button ref={launcher} className="product-chat-launcher" aria-expanded={state.open} aria-controls="product-chat-panel" onClick={() => state.open ? close() : setState(s => ({ ...s, open: true }))}>
      <span>{state.open ? <X size={23}/> : <MessageCircle size={23}/>}</span>Tanya OpsCore
    </button>
  </div>;
}
