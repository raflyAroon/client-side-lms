// app/page.tsx (Landing Page or Home Page or Public Page)
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePublicData } from '@/context/PublicDataContext';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Hackathon from '../../public/logohackathon.svg';
import MPR from '../../public/logo MPR RI.svg';
import Anagata from '../../public/logo_aa3.svg';
import CodingMu from '../../public/logo_Codingmu.svg';

/* ── CURSOR SPOTLIGHT ── */
function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -999, y: -999 });
  const raf = useRef<number>(0);
  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      if (ref.current) ref.current.style.transform = `translate(${pos.current.x - 250}px,${pos.current.y - 250}px)`;
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', move, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf.current); };
  }, []);
  return (
    <div ref={ref} style={{
      position: 'fixed', top: 0, left: 0, width: 500, height: 500,
      borderRadius: '50%', pointerEvents: 'none', zIndex: 9999,
      background: 'radial-gradient(circle, rgba(0,119,255,0.07) 0%, rgba(0,212,255,0.04) 35%, transparent 70%)',
      willChange: 'transform', mixBlendMode: 'multiply',
    }} />
  );
}

/* ── PARTICLE CANVAS (background utama) ── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf: number;
    const colors = ['#0077ff', '#00d4ff', '#00c896', '#38bdf8'];
    const pts: { x: number; y: number; vx: number; vy: number; r: number; a: number; c: string }[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 55; i++) pts.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5, a: Math.random() * 0.35 + 0.08,
      c: colors[Math.floor(Math.random() * colors.length)],
    });
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
      });
      ctx.globalAlpha = 1;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,150,255,${0.08 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

/* ── DYNAMIC ORBITING DOTS (mengorbit presisi pada setiap lingkaran) ── */
function DynamicOrbitingDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  // Partikel untuk setiap lingkaran - setiap partikel memiliki ring, radius, sudut, kecepatan sudut, warna, dan ukuran
  const particlesRef = useRef<{
    ring: number;      // 0,1,2
    radius: number;    // radius ideal lingkaran (px)
    angle: number;     // sudut saat ini (radian)
    speed: number;     // kecepatan sudut (radian per frame)
    radialOffset: number; // offset radial kecil untuk efek dinamis
    r: number;         // radius titik
    a: number;         // alpha
    color: string;
  }[]>([]);

  // Data untuk masing-masing lingkaran: radius, jumlah partikel, warna, rentang kecepatan
  const ringConfigs = [
    { color: '#0077ff', count: 3, speedRange: [0.008, 0.018], radiusFactor: 5 },      // lingkaran terluar
    { color: '#00d4ff', count: 3, speedRange: [0.012, 0.024], radiusFactor: 1.5 },      // lingkaran tengah
    { color: '#00c896', count: 3, speedRange: [0.018, 0.032], radiusFactor: 0.5 }        // lingkaran dalam
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let centerX = 0, centerY = 0;
    let radii: number[] = [0, 0, 0];

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width;
      canvas.height = height;
      centerX = width / 2;
      centerY = height / 2;
      const maxR = Math.min(width, height) * 0.42;
      radii[0] = maxR;                              // lingkaran terluar
      radii[1] = maxR * 0.69;                       // lingkaran tengah
      radii[2] = maxR * 0.42;                       // lingkaran dalam

      // Re-inisialisasi partikel berdasarkan ukuran baru
      const newParticles: typeof particlesRef.current = [];
      for (let ring = 0; ring < 3; ring++) {
        const config = ringConfigs[ring];
        const r = radii[ring];
        const count = config.count;
        for (let i = 0; i < count; i++) {
          // Sudut awal merata di lingkaran + sedikit offset acak
          const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          // Kecepatan sudut dalam rentang yang ditentukan
          const speed = config.speedRange[0] + Math.random() * (config.speedRange[1] - config.speedRange[0]);
          // Offset radial kecil untuk membuat lintasan tidak terlalu kaku
          const radialOffset = (Math.random() - 0.5) * 6;
          newParticles.push({
            ring,
            radius: r,
            angle,
            speed,
            radialOffset,
            r: Math.random() * 1.6 + 1.2,
            a: Math.random() * 0.4 + 0.45,
            color: config.color,
          });
        }
      }
      particlesRef.current = newParticles;
    };
    resize();
    window.addEventListener('resize', resize);

    // Fungsi untuk mengupdate posisi partikel berdasarkan sudut yang bertambah
    const updatePositions = () => {
      for (let p of particlesRef.current) {
        // update sudut
        p.angle += p.speed;
        // offset radial berosilasi sedikit untuk efek organik
        // biarkan radialOffset konstan atau bisa divariasikan perlahan? p.radialOffset += (Math.random() - 0.5) * 0.05; (terlalu ribet)
        // untuk menjaga efek "mengorbit" tapi tidak kaku, radialOffset bisa berubah sangat lambat
        p.radialOffset += (Math.random() - 0.5) * 0.08;
        p.radialOffset = Math.min(Math.max(p.radialOffset, -9), 9);
      }
    };

    // Gambar partikel dan garis penghubung
    const draw = () => {
      if (!ctx || width === 0) return;
      ctx.clearRect(0, 0, width, height);
      
      // Update sudut semua partikel
      updatePositions();
      
      // Hitung posisi x, y untuk setiap partikel berdasarkan radius dan sudut terbaru
      const positions: { x: number; y: number; ring: number; color: string; r: number; a: number }[] = [];
      for (let p of particlesRef.current) {
        // radius efektif = radius ideal + radial offset
        const effectiveRadius = p.radius + p.radialOffset;
        const x = centerX + Math.cos(p.angle) * effectiveRadius;
        const y = centerY + Math.sin(p.angle) * effectiveRadius;
        positions.push({ x, y, ring: p.ring, color: p.color, r: p.r, a: p.a });
      }
      
      // Gambar garis antar partikel dalam satu lingkaran yang sama, jika jaraknya < 45px
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const p1 = positions[i];
          const p2 = positions[j];
          if (p1.ring !== p2.ring) continue;
          const dx = p1.x - p2.x, dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 45) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = 0.2 * (1 - dist / 45);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }
      
      // Gambar titik-titik partikel
      for (let p of positions) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.a;
        ctx.fill();
        // sedikit efek glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ── COUNTER ── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [n, setN] = useState(0); const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      let s = 0;
      const step = (ts: number) => { if (!s) s = ts; const p = Math.min((ts - s) / 1800, 1); setN(Math.floor((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) requestAnimationFrame(step); else setN(end); };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{n.toLocaleString('id-ID')}{suffix}</span>;
}

/* ── MAIN ── */
export default function LandingPage() {
  const { user } = useAuth();
  const { announcements, faqs, loading } = usePublicData();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [expandedAnn, setExpandedAnn] = useState<number | null>(null);

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 20); const h = document.documentElement.scrollHeight - window.innerHeight; if (h > 0) setScrollPct(Math.min((window.scrollY / h) * 100, 100)); };
    window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('ai')), { threshold: 0.1 });
    document.querySelectorAll('.a').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  const tl = [
    { icon: '👥', g: 'linear-gradient(135deg,#0ea5e9,#0077ff)', date: '20 MEI – 10 JUNI', title: 'Pendaftaran Tim', desc: 'Registrasi regu melalui portal Lomba Coding MPR RI.', w: '100%' },
    { icon: '🎯', g: 'linear-gradient(135deg,#00d4ff,#0ea5e9)', date: '15 – 20 JUNI', title: 'Bootcamp Persiapan', desc: 'Pelatihan intensif materi teknis dan studi kasus nyata.', w: '65%' },
    { icon: '🏆', g: 'linear-gradient(135deg,#00c896,#00d4ff)', date: '25 JUNI', title: 'Hackathon Day', desc: 'Kompetisi coding & inovasi selama 24 jam penuh.', w: '30%' },
    { icon: '✅', g: 'linear-gradient(135deg,#38bdf8,#00c896)', date: '30 JUNI', title: 'Final & Kejuaraan', desc: 'Presentasi finalis dan pengumuman pemenang.', w: '5%' },
  ];
  const stats = [
    { label: 'Peserta Terdaftar', value: 270, suffix: '+', icon: '👥' },
    { label: 'Total Hadiah', value: 100, suffix: 'jt', prefix: 'Rp ', icon: '💰' },
    { label: 'Tim Peserta', value: 250, suffix: '+', icon: '🏅' },
    { label: 'Juri & Fasilitator', value: 20, suffix: '+', icon: '⭐' },
  ];
  const getPreview = (t: string, max = 100) => t.length <= max ? t : t.substring(0, max).trim() + '…';

  return (
    <div className="root">
      <CursorSpotlight />

      {/* NAVBAR */}
      <nav className={`nav ${scrolled ? 'nav-s' : ''}`}>
        <div className="nav-prog"><div style={{ width: `${scrollPct}%` }} className="nav-prog-fill" /></div>
        <div className="nav-in">
          <div className="nav-brand">
            <div className="brand-logo"><Image src={Hackathon} alt="hackathon" width={150} height={32} style={{ objectFit: 'contain' }} /></div>
            <div className="brand-div" />
            <div className="brand-logo"><Image src={MPR} alt="MPR RI" width={52} height={36} style={{ objectFit: 'contain' }} /></div>
            <div className="brand-div" />
            <div className="brand-logo"><Image src={Anagata} alt="Anagata" width={88} height={26} style={{ objectFit: 'contain' }} /></div>
            <div className="brand-div" />
            <div className="brand-logo"><Image src={CodingMu} alt="CodingMu" width={88} height={26} style={{ objectFit: 'contain' }} /></div>
          </div>
          <div className="nav-r">
            {!user ? (
              <div className="nav-btns">
                <Link href="/auth/register" className="nb-out">Daftar</Link>
                <Link href="/auth/login" className="nb-fill">Masuk</Link>
              </div>
            ) : (
              <div className="nav-user">
                <div className="uav">{(user.name || 'P').charAt(0).toUpperCase()}</div>
                <div className="ui"><span className="un">{user.name || 'Peserta'}</span><span className="ur">{user.role === 'admin' ? 'Admin' : user.role === 'juri' ? 'Juri' : 'Peserta'}</span></div>
                <Link href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'juri' ? '/juri/dashboard' : '/peserta/dashboard'} className="nd">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <ParticleCanvas />
        <div className="h-blob h-b1" /><div className="h-blob h-b2" /><div className="h-blob h-b3" />
        <div className="hero-in">
          <div className="hl">
            <div className="h-badge"><span className="h-dot" />SE-JABODETABEK & BANDUNG • 2026</div>
            <h1 className="h-title">
              <span className="ht1">Hackathon</span>
              <span className="ht2">Inovasi Digital</span>
              <span className="ht3"><span className="h-acc">Empat Pilar</span> MPR RI</span>
            </h1>
            <p className="h-sub">Platform kolaborasi pemuda Indonesia membangun solusi teknologi yang memperkuat nilai-nilai kebangsaan. Jadilah bagian dari perubahan! 🚀</p>
            {!user ? (
              <div className="h-cta">
                <Link href="/auth/register" className="cta-p">📝 Daftar Sekarang <span className="cta-arr">→</span></Link>
                <Link href="/auth/login" className="cta-g">🔐 Masuk LMS</Link>
              </div>
            ) : (
              <div className="h-cta">
                <Link href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'juri' ? '/juri/dashboard' : '/peserta/dashboard'} className="cta-p">Dashboard <span className="cta-arr">→</span></Link>
              </div>
            )}
            <div className="scroll-h"><div className="s-track"><div className="s-ball" /></div><span>Scroll ke bawah</span></div>
          </div>
          
          <div className="hr-side">
            {/* CARD dengan gaya bubble glass (putih ke abu-abuan) */}
            <div className="hcard">
              <div className="hc-o hc-o1" /><div className="hc-o hc-o2" />
              <div className="hc-chips">
                <div className="hc-chip">💡 Inovasi</div><div className="hc-chip">🤝 Kolaborasi</div>
                <div className="hc-chip">⚡ Teknologi</div><div className="hc-chip">🌐 Digital</div>
              </div>
              <div className="hc-ctr">
                {/* Lingkaran konsentris statis */}
                <div className="r r1" /><div className="r r2" /><div className="r r3" />
                <DynamicOrbitingDots />
                <div className="hc-core">🏆</div>
              </div>
              <div className="hc-stat hc-st"><strong>1.000+</strong><span>Peserta</span></div>
              <div className="hc-stat hc-sb"><strong>Ratusan Juta</strong><span>Total Hadiah</span></div>
            </div>
          </div>
        </div>
        <div className="wave-bot">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f0f7ff" />
          </svg>
        </div>
      </section>

      {/* STATS, TIMELINE, ANNOUNCEMENTS, FAQ, FOOTER (sama seperti sebelumnya) */}
      <section className="stats-sec">
        <div className="stats-in">
          {stats.map((s, i) => (
            <div key={i} className="stat-card a" style={{ '--d': `${i * 0.09}s` } as React.CSSProperties}>
              <div className="sc-icon">{s.icon}</div>
              <div className="sc-val">{s.prefix || ''}<Counter end={s.value} suffix={s.suffix} /></div>
              <div className="sc-lbl">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="wave-bot">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,20 C480,80 960,0 1440,50 L1440,80 L0,80 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      <section className="tl-sec">
        <div className="tl-b tl-bl" /><div className="tl-b tl-br" />
        <div className="sec-in">
          <div className="sec-head a">
            <span className="eyebrow">📅 Jadwal Kegiatan</span>
            <h2 className="sec-t">Alur Kegiatan</h2>
            <div className="sec-line" />
            <p className="sec-sub">Ikuti setiap tahapan kompetisi dari pendaftaran hingga pengumuman pemenang.</p>
          </div>
          <div className="tl-grid">
            {tl.map((s, i) => (
              <div key={i} className="tl-item a" style={{ '--d': `${i * 0.12}s` } as React.CSSProperties}>
                <div className="tl-dot" style={{ background: s.g }} />
                <div className="tl-card">
                  <div className="tl-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="tl-icon" style={{ background: s.g }}>{s.icon}</div>
                  <div className="tl-date">{s.date}</div>
                  <h3 className="tl-ttl">{s.title}</h3>
                  <p className="tl-desc">{s.desc}</p>
                  <div className="tl-bw"><div className="tl-bar" style={{ background: s.g, width: s.w }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="wave-bot">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,80 1440,20 L1440,80 L0,80 Z" fill="#f0f7ff" />
          </svg>
        </div>
      </section>

      <section className="ann-sec">
        <div className="ann-blob" />
        <div className="sec-in">
          <div className="ann-head a">
            <span className="eyebrow">📢 Terbaru</span>
            <h2 className="sec-t" style={{ textAlign: 'left' }}>Pengumuman</h2>
            <div className="sec-line" style={{ margin: '0 0 0.5rem' }} />
            <p className="sec-sub" style={{ textAlign: 'left' }}>Klik kartu untuk membaca detail pengumuman.</p>
          </div>
          {loading ? (
            <div className="ann-grid">{[1,2,3].map(n=><div key={n} className="sk"><div className="sk-r"><div className="skp w35"/><div className="skp w15"/></div><div className="skb w90"/><div className="skb w75"/></div>)}</div>
          ) : announcements.length === 0 ? (
            <div className="empty"><span>📭</span><p>Belum ada pengumuman.</p></div>
          ) : (
            <div className="ann-grid">
              {announcements.map((ann, idx) => {
                const isEx = expandedAnn === ann.id;
                return (
                  <article key={ann.id} className={`ann-card a ${isEx ? 'ann-open' : ''}`} style={{ '--d': `${idx * 0.09}s` } as React.CSSProperties}>
                    <div onClick={() => setExpandedAnn(isEx ? null : ann.id)} className="ann-cl">
                      <div className="ann-glow" />
                      <div className="ann-top"><span className="ann-date">{new Date(ann.published_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</span><span className="ann-badge">Baru</span></div>
                      <h3 className="ann-ttl">{ann.title}</h3>
                      <p className="ann-prev">{getPreview(ann.content, 100)}</p>
                    </div>
                    <div className={`ann-det ${isEx ? 'ann-det-o' : ''}`}>
                      <div className="ann-det-in"><p>{ann.content}</p></div>
                    </div>
                    <div className="ann-ft" onClick={() => setExpandedAnn(isEx ? null : ann.id)}>
                      <span className="ann-rd">{isEx ? 'Tutup ↑' : 'Baca selengkapnya →'}</span>
                    </div>
                    <div className="ann-stripe" />
                  </article>
                );
              })}
            </div>
          )}
        </div>
        <div className="wave-bot">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C500,80 940,0 1440,60 L1440,80 L0,80 Z" fill="#f8faff" />
          </svg>
        </div>
      </section>

      <section className="faq-sec">
        <div className="faq-b faq-bl" /><div className="faq-b faq-br" />
        <div className="sec-in">
          <div className="faq-layout">
            <div className="faq-left a">
              <span className="eyebrow">❓ FAQ</span>
              <h2 className="sec-t" style={{ textAlign: 'left' }}>Pertanyaan<br />yang Sering<br /><span className="faq-acc">Ditanyakan.</span></h2>
              <p className="sec-sub" style={{ textAlign: 'left', maxWidth: 340, marginTop: '1rem' }}>Temukan jawaban atas pertanyaan umum seputar pendaftaran, kompetisi, dan hadiah.</p>
              <div className="faq-orb">
                <div className="fo fo1" /><div className="fo fo2" /><div className="fo fo3" />
                <div className="fo-c">❓</div>
              </div>
            </div>
            <div className="faq-right">
              {loading ? (
                <div>{[1,2,3,4].map(n=><div key={n} className="sk" style={{height:60,borderRadius:16,marginBottom:12}}><div className="skb w80"/></div>)}</div>
              ) : faqs.length === 0 ? (
                <div className="empty"><span>🤷</span><p>Belum ada FAQ.</p></div>
              ) : (
                <div className="faq-list">
                  {faqs.map((faq, idx) => {
                    const isO = openFaq === faq.id;
                    return (
                      <div key={faq.id} className={`fi a ${isO ? 'fi-o' : ''}`} style={{ '--d': `${idx * 0.07}s` } as React.CSSProperties}>
                        <button className="fb" onClick={() => setOpenFaq(isO ? null : faq.id)}>
                          <div className="fi-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                          <span className="fq">{faq.question}</span>
                          <div className={`fchev ${isO ? 'fco' : ''}`}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></div>
                        </button>
                        <div className={`fbody ${isO ? 'fbody-o' : ''}`}><div className="fans"><p>{faq.answer}</p></div></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="wave-bot">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C400,0 1000,80 1440,20 L1440,80 L0,80 Z" fill="#0a1628" />
          </svg>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-bg" />
        <div className="footer-in">
          <div><Image src={Hackathon} alt="hackathon" width={120} height={36} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1) opacity(0.8)' }} /></div>
          <p className="ft-title">Hackathon Inovasi Digital Empat Pilar MPR RI 2026</p>
          <p className="ft-copy">© 2026 Hackathon Inovasi Digital Empat Pilar MPR RI. All rights reserved.</p>
          <div className="ft-links"><span>📧 support@lombacoding.mpr.go.id</span><span className="fsep">|</span><span>📞 (021) 12345678</span></div>
        </div>
      </footer>

      {/* ══ GLOBAL STYLES ══ */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');
        :root {
          --c: #0077ff; --cy: #00d4ff; --tl: #00c896;
          --t1: #0a1628; --t2: #1e3a5f; --t3: #4a6fa5; --tm: #8ca8cc;
          --bg1: #ffffff; --bg2: #f0f7ff; --bg3: #f8faff;
          --card: #ffffff; --cb: rgba(0,119,255,0.1);
          --br: rgba(0,119,255,0.12);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:#f8faff;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:var(--t1);overflow-x:hidden;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#f0f7ff;} ::-webkit-scrollbar-thumb{background:linear-gradient(var(--c),var(--cy));border-radius:5px;}
        .a{opacity:0;transform:translateY(26px);transition:opacity .65s cubic-bezier(.22,1,.36,1),transform .65s cubic-bezier(.22,1,.36,1);transition-delay:var(--d,0s);}
        .ai{opacity:1;transform:none;}
        .sec-in{max-width:1340px;margin:0 auto;padding:0 2rem;}
        .sec-head{text-align:center;margin-bottom:3.5rem;}
        .eyebrow{display:inline-block;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c);background:rgba(0,119,255,.08);border:1px solid rgba(0,119,255,.18);padding:.35rem 1rem;border-radius:100px;margin-bottom:1rem;}
        .sec-t{font-family:'Clash Display','Plus Jakarta Sans',sans-serif;font-size:clamp(2rem,3.5vw,2.8rem);font-weight:700;color:var(--t1);letter-spacing:-.03em;line-height:1.1;margin-bottom:.75rem;}
        .sec-line{width:44px;height:3px;background:linear-gradient(90deg,var(--c),var(--tl));border-radius:4px;margin:0 auto 1rem;}
        .sec-sub{font-size:.9rem;color:var(--t3);line-height:1.75;max-width:500px;margin:0 auto;}
      `}</style>

      {/* ══ SCOPED STYLES (card abu-abu tanpa border biru) ══ */}
      <style jsx>{`
        .root{min-height:100vh;}

        /* NAVBAR */
        .nav{
          position:sticky;
          top:0;
          z-index:500;
          background:rgba(255,255,255,0.96);
          backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(0,119,255,0.12);
          transition:all 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .nav.nav-s{
          background:rgba(255,255,255,0.25);
          backdrop-filter:blur(16px) saturate(180%);
          border-bottom:2px solid rgba(0,119,255,0.3);
          box-shadow:0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,119,255,0.05) inset;
        }
        .nav-prog{
          position:absolute;
          bottom:0;
          left:0;
          width:100%;
          height:2px;
          background:rgba(0,119,255,.06);
        }
        .nav-prog-fill{
          height:100%;
          background:linear-gradient(90deg,var(--c),var(--tl));
          transition:width .2s;
        }
        .nav-in{
          max-width:1340px;
          margin:0 auto;
          padding:.8rem 2rem;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:1.5rem;
        }
        .nav-brand{
          display:flex;
          align-items:center;
          gap:.875rem;
        }
        .brand-logo{
          display:flex;
          align-items:center;
        }
        .brand-div{
          width:1px;
          height:26px;
          background:rgba(0,0,0,.08);
        }
        .nav-r{
          display:flex;
          align-items:center;
        }
        .nav-btns{
          display:flex;
          gap:.6rem;
          align-items:center;
        }
        .nb-out{
          padding:.48rem 1.1rem;
          border-radius:100px;
          border:1.5px solid rgba(0,119,255,.3);
          color:var(--c);
          font-size:.84rem;
          font-weight:700;
          text-decoration:none;
          transition:all .25s;
        }
        .nb-out:hover{
          background:rgba(0,119,255,.06);
          border-color:var(--c);
        }
        .nb-fill{
          padding:.48rem 1.2rem;
          border-radius:100px;
          background:linear-gradient(135deg,var(--c),var(--cy));
          color:#fff;
          font-size:.84rem;
          font-weight:700;
          text-decoration:none;
          box-shadow:0 2px 14px rgba(0,119,255,.3);
          transition:all .25s;
        }
        .nb-fill:hover{
          transform:translateY(-2px) scale(1.03);
          box-shadow:0 4px 24px rgba(0,119,255,.45);
        }
        .nav-user{
          display:flex;
          align-items:center;
          gap:.75rem;
        }
        .uav{
          width:36px;
          height:36px;
          border-radius:50%;
          background:linear-gradient(135deg,var(--c),var(--cy));
          color:#fff;
          font-weight:800;
          font-size:.9rem;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 0 0 3px rgba(0,119,255,.15);
        }
        .ui{
          text-align:right;
        }
        .un{
          display:block;
          font-weight:700;
          font-size:.84rem;
          color:var(--t1);
        }
        .ur{
          display:block;
          font-size:.68rem;
          color:var(--tm);
        }
        .nd{
          width:36px;
          height:36px;
          border-radius:10px;
          background:#f0f7ff;
          border:1px solid rgba(0,119,255,.15);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--t3);
          text-decoration:none;
          transition:all .25s;
        }
        .nd:hover{
          background:var(--c);
          color:#fff;
          border-color:var(--c);
        }

        /* HERO & CARD */
        .hero{ min-height:calc(100vh - 62px); background:linear-gradient(165deg, #ffffff 0%, #f0f8ff 35%, #e3f0ff 65%, #d6eaff 100%); position:relative; overflow:hidden; display:flex; align-items:center; }
        .h-blob{ position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
        .h-b1{ width:700px; height:700px; background:radial-gradient(circle,rgba(0,119,255,.12),transparent 65%); top:-200px; right:-120px; animation:bfloat 14s ease-in-out infinite; }
        .h-b2{ width:500px; height:500px; background:radial-gradient(circle,rgba(0,200,150,.1),transparent 65%); bottom:-150px; left:-80px; animation:bfloat 18s ease-in-out infinite reverse; }
        .h-b3{ width:380px; height:380px; background:radial-gradient(circle,rgba(0,212,255,.12),transparent 65%); top:30%; left:38%; animation:bfloat 11s ease-in-out infinite 3s; }
        @keyframes bfloat{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(28px,-22px) scale(1.07);}}
        .hero-in{ max-width:1340px; margin:0 auto; padding:5rem 2rem 6rem; display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; position:relative; z-index:1; width:100%; }
        .h-badge{ display:inline-flex; align-items:center; gap:.6rem; background:rgba(0,119,255,.07); border:1px solid rgba(0,119,255,.18); color:var(--c); font-size:.67rem; font-weight:800; letter-spacing:.1em; padding:.4rem 1rem; border-radius:100px; text-transform:uppercase; margin-bottom:1.5rem; animation:fadeDown .6s ease both; }
        .h-dot{ width:7px; height:7px; background:var(--c); border-radius:50%; animation:dpulse 2s infinite; box-shadow:0 0 8px rgba(0,119,255,.5); }
        @keyframes dpulse{0%,100%{transform:scale(1);}50%{transform:scale(1.5);}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:none;}}
        .h-title{ font-family:'Clash Display','Plus Jakarta Sans',sans-serif; font-size:clamp(2.8rem,5vw,4.4rem); font-weight:700; line-height:1.06; letter-spacing:-.04em; margin-bottom:1.25rem; color:var(--t1); }
        .ht1,.ht2,.ht3{ display:block; }
        .ht1{ animation:hIn .7s cubic-bezier(.22,1,.36,1) .1s both; }
        .ht2{ animation:hIn .7s cubic-bezier(.22,1,.36,1) .22s both; }
        .ht3{ animation:hIn .7s cubic-bezier(.22,1,.36,1) .34s both; }
        @keyframes hIn{from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:none;}}
        .h-acc{ background:linear-gradient(90deg,var(--c),var(--tl)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .h-sub{ font-size:1rem; color:var(--t3); line-height:1.8; max-width:500px; margin-bottom:2.25rem; animation:fuUp .7s ease .42s both; }
        @keyframes fuUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        .h-cta{ display:flex; gap:.875rem; flex-wrap:wrap; animation:fuUp .7s ease .52s both; }
        .cta-p{ display:inline-flex; align-items:center; gap:.45rem; padding:.85rem 1.8rem; background:linear-gradient(135deg,var(--c),var(--cy)); color:#fff; border-radius:100px; font-weight:800; font-size:.9rem; text-decoration:none; box-shadow:0 4px 24px rgba(0,119,255,.35); transition:all .3s ease; position:relative; overflow:hidden; }
        .cta-p::after{ content:''; position:absolute; inset:0; background:linear-gradient(135deg,var(--cy),var(--tl)); opacity:0; transition:opacity .3s; }
        .cta-p>*{ position:relative; z-index:1; }
        .cta-p:hover::after{ opacity:1; } .cta-p:hover{ transform:translateY(-3px); box-shadow:0 8px 32px rgba(0,119,255,.45); }
        .cta-arr{ transition:transform .3s; display:inline-block; } .cta-p:hover .cta-arr{ transform:translateX(4px); }
        .cta-g{ display:inline-flex; align-items:center; gap:.45rem; padding:.85rem 1.8rem; background:#fff; border:1.5px solid rgba(0,119,255,.2); color:var(--t2); border-radius:100px; font-weight:700; font-size:.9rem; text-decoration:none; transition:all .25s; box-shadow:0 2px 12px rgba(0,0,0,.04); }
        .cta-g:hover{ border-color:var(--c); color:var(--c); transform:translateY(-2px); }
        .scroll-h{ display:flex; align-items:center; gap:.7rem; margin-top:2.5rem; color:var(--tm); font-size:.73rem; animation:fuUp .7s ease .8s both; }
        .s-track{ width:22px; height:36px; border:1.5px solid rgba(0,119,255,.3); border-radius:12px; display:flex; justify-content:center; padding-top:5px; }
        .s-ball{ width:4px; height:9px; background:linear-gradient(var(--c),var(--tl)); border-radius:4px; animation:sball 1.9s ease-in-out infinite; }
        @keyframes sball{0%,100%{opacity:1;transform:none;}50%{opacity:.3;transform:translateY(8px);}}
        
        /* CARD HERO - Bubble Glass (putih ke abu-abuan tanpa border biru) */
        .hr-side{ position:relative; display:flex; justify-content:flex-end; animation:fuUp .8s ease .2s both; }
        .hcard{
          width:min(400px,100%);
          aspect-ratio:1;
          background: rgba(245, 245, 250, 0.55);
          backdrop-filter: blur(18px) saturate(180%);
          border-radius: 48px;
          border: 1px solid rgba(255, 255, 255, 0.55);
          box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3) inset;
          position:relative;
          overflow:hidden;
          animation:cfloat 7s ease-in-out infinite;
        }
        @keyframes cfloat{0%,100%{transform:translateY(0) rotate(.5deg);}50%{transform:translateY(-13px) rotate(-.5deg);}}
        .hc-o{ position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none; }
        .hc-o1{ width:200px; height:200px; background:rgba(200, 210, 240, 0.25); top:-50px; right:-50px; }
        .hc-o2{ width:180px; height:180px; background:rgba(180, 190, 220, 0.2); bottom:-40px; left:-40px; }
        .hc-chips{ position:absolute; inset:0; pointer-events:none; }
        .hc-chip{ position:absolute; display:flex; align-items:center; gap:.3rem; background:rgba(255, 255, 255, 0.7); backdrop-filter:blur(8px); border-radius:100px; padding:.35rem .8rem; font-size:.7rem; font-weight:700; color:#1e2a3a; box-shadow:0 4px 12px rgba(0,0,0,0.05); border:1px solid rgba(255,255,255,0.8); }
        .hc-chip:nth-child(1){ top:12%; left:4%; animation:fc 5s ease-in-out infinite 0s; }
        .hc-chip:nth-child(2){ top:12%; right:4%; animation:fc 5s ease-in-out infinite -1.25s; }
        .hc-chip:nth-child(3){ bottom:16%; left:4%; animation:fc 5s ease-in-out infinite -2.5s; }
        .hc-chip:nth-child(4){ bottom:16%; right:4%; animation:fc 5s ease-in-out infinite -3.75s; }
        @keyframes fc{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        
        /* Lingkaran konsentris statis */
        .hc-ctr{
          position:absolute;
          top:50%;
          left:50%;
          transform:translate(-50%,-50%);
          width:160px;
          height:160px;
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .r{
          position:absolute;
          border-radius:50%;
          border:1px solid rgba(100, 110, 130, 0.25);
        }
        .r1{ width:160px; height:160px; animation:spin 14s linear infinite; }
        .r2{ width:115px; height:115px; animation:spin 9s linear infinite reverse; }
        .r3{ width:72px; height:72px; animation:spin 6s linear infinite; }
        @keyframes spin{ from{transform:rotate(0);} to{transform:rotate(360deg);} }
        .hc-core{
          width:52px;
          height:52px;
          background:linear-gradient(135deg,var(--c),var(--cy));
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.4rem;
          z-index:2;
          box-shadow:0 6px 28px rgba(0,119,255,0.4),0 0 0 6px rgba(255,255,255,0.3);
        }
        .hc-stat{ position:absolute; background:rgba(255, 255, 255, 0.7); backdrop-filter:blur(8px); border-radius:20px; padding:.55rem 1rem; text-align:center; border:1px solid rgba(255,255,255,0.6); z-index:3; display:flex; flex-direction:column; box-shadow:0 4px 12px rgba(0,0,0,0.05); }
        .hc-stat strong{ font-family:'Clash Display',sans-serif; font-size:1rem; font-weight:700; color:#0f172a; }
        .hc-stat span{ font-size:.65rem; color:#334155; }
        .hc-st{ top:38%; right:2%; } .hc-sb{ bottom:5%; left:50%; transform:translateX(-50%); white-space:nowrap; }

        /* STATS, TIMELINE, ANNOUNCEMENTS, FAQ, FOOTER (sama seperti sebelumnya) */
        .stats-sec{ padding:4rem 0 5rem; background:#f0f7ff; position:relative; overflow:hidden; }
        .stats-in{ max-width:1340px; margin:0 auto; padding:0 2rem; display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; }
        .stat-card{ text-align:center; padding:1.75rem 1.25rem; background:#fff; border:1px solid rgba(0,119,255,.1); border-radius:22px; transition:all .3s ease; cursor:default; box-shadow:0 2px 12px rgba(0,119,255,.06); }
        .stat-card:hover{ transform:translateY(-5px); box-shadow:0 16px 44px rgba(0,119,255,.12); border-color:rgba(0,119,255,.25); }
        .sc-icon{ font-size:1.6rem; margin-bottom:.6rem; display:block; }
        .sc-val{ font-family:'Clash Display',sans-serif; font-size:2rem; font-weight:700; background:linear-gradient(135deg,var(--t1),var(--c)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-.03em; line-height:1; margin-bottom:.3rem; }
        .sc-lbl{ font-size:.78rem; color:var(--tm); font-weight:500; }

        .tl-sec{ padding:7rem 0 6rem; background:#ffffff; position:relative; overflow:hidden; }
        .tl-b{ position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
        .tl-bl{ width:450px; height:450px; background:rgba(0,119,255,.06); left:-120px; top:50%; transform:translateY(-50%); }
        .tl-br{ width:380px; height:380px; background:rgba(0,200,150,.05); right:-100px; bottom:10%; }
        .tl-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; position:relative; }
        .tl-grid::before{ content:''; position:absolute; top:28px; left:12%; right:12%; height:1px; background:linear-gradient(90deg,transparent,rgba(0,119,255,.2),rgba(0,200,150,.2),transparent); }
        .tl-item{ position:relative; }
        .tl-dot{ position:absolute; top:22px; left:50%; transform:translateX(-50%); width:13px; height:13px; border-radius:50%; z-index:1; box-shadow:0 0 0 4px rgba(0,119,255,.1),0 0 14px rgba(0,212,255,.4); }
        .tl-card{ background:#fff; border-radius:22px; padding:2rem 1.5rem 1.5rem; border:1px solid rgba(0,119,255,.1); margin-top:1.75rem; position:relative; overflow:hidden; transition:all .35s cubic-bezier(.22,1,.36,1); cursor:default; box-shadow:0 2px 16px rgba(0,119,255,.05); }
        .tl-card:hover{ transform:translateY(-7px); box-shadow:0 20px 50px rgba(0,119,255,.1); border-color:rgba(0,119,255,.22); }
        .tl-num{ position:absolute; top:1rem; right:1rem; font-family:'Clash Display',sans-serif; font-size:2.8rem; font-weight:700; color:rgba(0,119,255,.05); line-height:1; }
        .tl-icon{ width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.35rem; margin-bottom:1.25rem; box-shadow:0 4px 16px rgba(0,0,0,.12); }
        .tl-date{ font-size:.68rem; font-weight:700; letter-spacing:.07em; color:var(--c); text-transform:uppercase; margin-bottom:.5rem; }
        .tl-ttl{ font-family:'Clash Display',sans-serif; font-size:1.05rem; font-weight:600; color:var(--t1); margin-bottom:.55rem; }
        .tl-desc{ font-size:.83rem; color:var(--t3); line-height:1.6; margin-bottom:1.25rem; }
        .tl-bw{ height:3px; background:rgba(0,119,255,.08); border-radius:4px; overflow:hidden; }
        .tl-bar{ height:100%; border-radius:4px; transition:width 1.4s cubic-bezier(.22,1,.36,1); }

        .ann-sec{ padding:7rem 0 6rem; background:#f0f7ff; position:relative; overflow:hidden; }
        .ann-blob{ position:absolute; width:700px; height:350px; border-radius:50%; background:radial-gradient(ellipse,rgba(0,119,255,.08),transparent 65%); top:0; right:-200px; filter:blur(60px); pointer-events:none; }
        .ann-head{ margin-bottom:2.5rem; }
        .ann-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        .ann-card{ background:#fff; border-radius:22px; padding:1.5rem; border:1px solid rgba(0,119,255,.1); position:relative; overflow:hidden; display:flex; flex-direction:column; gap:.75rem; transition:all .35s cubic-bezier(.2,.9,.4,1.1); cursor:pointer; box-shadow:0 2px 14px rgba(0,119,255,.05); }
        .ann-card:hover{ transform:translateY(-5px); border-color:rgba(0,119,255,.25); box-shadow:0 16px 48px rgba(0,119,255,.1); }
        .ann-open{ border-color:rgba(0,119,255,.3)!important; box-shadow:0 12px 40px rgba(0,119,255,.12)!important; }
        .ann-glow{ position:absolute; top:-50px; right:-50px; width:140px; height:140px; background:radial-gradient(circle,rgba(0,119,255,.08),transparent 65%); border-radius:50%; pointer-events:none; opacity:0; transition:opacity .3s; }
        .ann-card:hover .ann-glow{ opacity:1; }
        .ann-cl{ cursor:pointer; }
        .ann-top{ display:flex; align-items:center; justify-content:space-between; }
        .ann-date{ font-size:.7rem; font-weight:600; color:var(--tm); background:#f0f7ff; padding:.22rem .7rem; border-radius:100px; }
        .ann-badge{ font-size:.6rem; font-weight:800; color:#fff; background:linear-gradient(135deg,var(--c),var(--cy)); padding:.2rem .6rem; border-radius:100px; letter-spacing:.05em; text-transform:uppercase; }
        .ann-ttl{ font-family:'Clash Display',sans-serif; font-size:1rem; font-weight:600; color:var(--t1); line-height:1.35; }
        .ann-prev{ font-size:.84rem; color:var(--t3); line-height:1.6; }
        .ann-det{ display:none; opacity:0; transform:translateY(-8px); transition:opacity .3s,transform .3s; }
        .ann-det-o{ display:block; opacity:1; transform:none; }
        .ann-det-in{ padding-top:.75rem; border-top:1px solid rgba(0,119,255,.1); }
        .ann-det-in p{ font-size:.84rem; color:var(--t2); line-height:1.75; background:#f8fbff; padding:.75rem; border-radius:12px; border:1px solid rgba(0,119,255,.08); }
        .ann-ft{ padding-top:.5rem; border-top:1px solid rgba(0,0,0,.04); cursor:pointer; }
        .ann-rd{ font-size:.8rem; font-weight:700; color:var(--c); }
        .ann-stripe{ position:absolute; top:0; left:0; width:3px; height:100%; background:linear-gradient(180deg,var(--c),var(--tl)); opacity:0; transition:opacity .3s; }
        .ann-card:hover .ann-stripe,.ann-open .ann-stripe{ opacity:1; }

        .faq-sec{ padding:7rem 0 6rem; background:#f8faff; position:relative; overflow:hidden; }
        .faq-b{ position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
        .faq-bl{ width:420px; height:420px; background:rgba(0,200,150,.06); left:-100px; top:10%; }
        .faq-br{ width:380px; height:380px; background:rgba(0,119,255,.07); right:-80px; bottom:10%; }
        .faq-layout{ display:grid; grid-template-columns:1fr 1.5fr; gap:5rem; align-items:start; position:relative; z-index:1; }
        .faq-left{ position:sticky; top:100px; }
        .faq-acc{ background:linear-gradient(90deg,var(--c),var(--tl)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .faq-orb{ position:relative; width:160px; height:160px; margin-top:2.5rem; }
        .fo{ position:absolute; top:50%; left:50%; border-radius:50%; border:1.5px solid; }
        .fo1{ width:160px; height:160px; border-color:rgba(0,119,255,.12); transform:translate(-50%,-50%); animation:spin 12s linear infinite; }
        .fo2{ width:110px; height:110px; border-color:rgba(0,212,255,.18); transform:translate(-50%,-50%); animation:spin 8s linear infinite reverse; }
        .fo3{ width:68px; height:68px; border-color:rgba(0,200,150,.22); transform:translate(-50%,-50%); animation:spin 5s linear infinite; }
        .fo-c{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:44px; height:44px; background:linear-gradient(135deg,var(--c),var(--cy)); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; box-shadow:0 4px 18px rgba(0,119,255,.35); }
        .faq-list{ display:flex; flex-direction:column; gap:.75rem; }
        .fi{ background:#fff; border-radius:18px; border:1px solid rgba(0,119,255,.1); transition:all .3s ease; box-shadow:0 1px 8px rgba(0,119,255,.04); }
        .fi:hover{ border-color:rgba(0,119,255,.2); box-shadow:0 4px 16px rgba(0,119,255,.08); }
        .fi-o{ border-color:rgba(0,119,255,.3)!important; box-shadow:0 8px 28px rgba(0,119,255,.1)!important; }
        .fb{ width:100%; background:none; border:none; cursor:pointer; padding:1.1rem 1.25rem; display:flex; align-items:center; gap:.875rem; text-align:left; font-family:inherit; }
        .fi-icon{ width:32px; height:32px; min-width:32px; background:rgba(0,119,255,.08); border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--c); transition:all .25s; }
        .fi-o .fi-icon{ background:linear-gradient(135deg,var(--c),var(--cy)); color:#fff; }
        .fq{ font-family:'Plus Jakarta Sans',sans-serif; font-size:.93rem; font-weight:600; color:var(--t1); flex:1; line-height:1.4; }
        .fchev{ width:28px; height:28px; min-width:28px; background:#f0f7ff; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--tm); transition:all .35s cubic-bezier(.34,1.2,.64,1); }
        .fco{ background:linear-gradient(135deg,var(--c),var(--cy)); color:#fff; transform:rotate(180deg); }
        .fbody{ display:none; opacity:0; transform:translateY(-8px); transition:opacity .3s,transform .3s; }
        .fbody-o{ display:block; opacity:1; transform:none; }
        .fans{ padding:.25rem 1.25rem 1.25rem 4rem; }
        .fans p{ font-size:.86rem; color:var(--t3); line-height:1.75; }

        .sk{ background:#fff; border-radius:20px; border:1px solid rgba(0,119,255,.08); padding:1.5rem; display:flex; flex-direction:column; gap:.75rem; }
        .sk-r{ display:flex; align-items:center; gap:.5rem; }
        .skp,.skb{ height:13px; border-radius:8px; background:linear-gradient(90deg,#f0f7ff 25%,#e3eeff 50%,#f0f7ff 75%); background-size:200% 100%; animation:sh 1.5s infinite; }
        .skp{ height:22px; border-radius:100px; }
        .w15{ width:15%; }.w35{ width:35%; }.w75{ width:75%; }.w80{ width:80%; }.w90{ width:90%; }
        @keyframes sh{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .empty{ text-align:center; padding:3rem 2rem; background:#f0f7ff; border-radius:20px; border:1.5px dashed rgba(0,119,255,.15); color:var(--tm); }
        .empty span{ font-size:2.5rem; display:block; margin-bottom:.75rem; }
        .wave-bot{ position:absolute; bottom:0; left:0; width:100%; line-height:0; pointer-events:none; }
        .wave-bot svg{ width:100%; height:80px; display:block; }
        .footer{ background:#0a1628; border-top:1px solid rgba(255,255,255,.06); padding:3.5rem 0 2.5rem; position:relative; overflow:hidden; }
        .footer-bg{ position:absolute; inset:0; background:radial-gradient(ellipse at 20% 50%,rgba(0,119,255,.1),transparent 55%),radial-gradient(ellipse at 80% 50%,rgba(0,212,255,.07),transparent 55%); pointer-events:none; }
        .footer-in{ max-width:1340px; margin:0 auto; padding:0 2rem; display:flex; flex-direction:column; align-items:center; gap:.8rem; position:relative; z-index:1; }
        .ft-title{ font-size:.9rem; font-weight:600; color:rgba(255,255,255,.8); }
        .ft-copy{ font-size:.78rem; color:rgba(255,255,255,.4); }
        .ft-links{ display:flex; align-items:center; gap:.75rem; font-size:.78rem; color:rgba(255,255,255,.4); }
        .fsep{ opacity:.3; }

        @media(max-width:1100px){
          .tl-grid{ grid-template-columns:repeat(2,1fr); } .tl-grid::before{ display:none; }
          .ann-grid{ grid-template-columns:repeat(2,1fr); }
          .faq-layout{ grid-template-columns:1fr; gap:2.5rem; } .faq-left{ position:static; }
          .stats-in{ grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:768px){
          .hero-in{ grid-template-columns:1fr; padding:3rem 1.25rem 2.5rem; } .hr-side{ display:none; }
          .h-title{ font-size:2.5rem; } .tl-grid{ grid-template-columns:1fr; } .ann-grid{ grid-template-columns:1fr; }
          .nav-in{ padding:.75rem 1.25rem; } .nav-brand{ gap:.5rem; } .brand-div{ height:22px; }
        }
        @media(max-width:480px){
          .h-title{ font-size:2rem; } .stats-in{ grid-template-columns:repeat(2,1fr); gap:.75rem; } .sc-val{ font-size:1.6rem; }
          .fans{ padding:.25rem 1rem 1rem 2.5rem; } .fi-icon{ width:28px; height:28px; min-width:28px; }
        }
      `}</style>
    </div>
  );
}