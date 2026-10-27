import { useEffect, useRef, useState } from "react";
import { ModuleShell, Panel, Slider, Stat, H, F, canvasCls } from "../ModuleShell";
import { useCanvas, COLORS } from "../useCanvas";
import { MODULES } from "@/lib/modules";

const INTERVALS = [
  { name: "Unison", tr: "Eş ses", a: 1, b: 1 },
  { name: "Oktav", tr: "Oktav", a: 2, b: 1 },
  { name: "Tam Beşli", tr: "Beşli", a: 3, b: 2 },
  { name: "Tam Dörtlü", tr: "Dörtlü", a: 4, b: 3 },
  { name: "Büyük Üçlü", tr: "B. Üçlü", a: 5, b: 4 },
  { name: "Küçük Üçlü", tr: "K. Üçlü", a: 6, b: 5 },
  { name: "Triton", tr: "Triton", a: 45, b: 32 },
];

function Lab() {
  const [idx, setIdx] = useState(2);
  const [base, setBase] = useState(220);
  const [detune, setDetune] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<{ ctx: AudioContext; o1: OscillatorNode; o2: OscillatorNode; g: GainNode } | null>(null);
  const iv = INTERVALS[idx]!;
  const ratio = (iv.a / iv.b) * (1 + detune / 100);
  useEffect(() => { const a = audio.current; if (a) { a.o1.frequency.value = base; a.o2.frequency.value = base * ratio; } }, [base, ratio]);
  useEffect(() => () => { audio.current?.ctx.close(); }, []);
  const toggle = () => {
    if (playing && audio.current) { audio.current.ctx.close(); audio.current = null; setPlaying(false); return; }
    const ctx = new AudioContext(); const g = ctx.createGain(); g.gain.value = 0.08; g.connect(ctx.destination);
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); o1.type = o2.type = "sine";
    o1.frequency.value = base; o2.frequency.value = base * ratio; o1.connect(g); o2.connect(g); o1.start(); o2.start();
    audio.current = { ctx, o1, o2, g }; setPlaying(true);
  };
  const ref = useCanvas((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const lanes = [h * 0.16, h * 0.36, h * 0.58]; const amp = h * 0.07; const k = 0.02; const ph = t * 0.002;
    const wave = (y: number, f: number, col: string, fn?: (x: number) => number) => {
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.beginPath();
      for (let x = 0; x < w * 0.62; x++) { const v = fn ? fn(x) : Math.sin(x * k * f + ph * f); x ? ctx.lineTo(x + 20, y - v * amp) : ctx.moveTo(x + 20, y - v * amp); }
      ctx.stroke(); ctx.shadowBlur = 0;
    };
    wave(lanes[0]!, 1, COLORS.cyan); wave(lanes[1]!, ratio, COLORS.gold);
    wave(lanes[2]!, 1, COLORS.red, (x) => (Math.sin(x * k + ph) + Math.sin(x * k * ratio + ph * ratio)) / 1.3);
    ctx.fillStyle = COLORS.muted; ctx.font = "12px JetBrains Mono";
    ctx.fillText(`f₁ = ${base.toFixed(0)} Hz`, 24, lanes[0]! - amp - 8); ctx.fillText(`f₂ = ${(base * ratio).toFixed(1)} Hz`, 24, lanes[1]! - amp - 8); ctx.fillText("toplam dalga (duyduğun ses)", 24, lanes[2]! - amp - 14);
    // Lissajous
    const cx = w * 0.82, cy = h * 0.4, R = Math.min(w * 0.15, h * 0.3);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i <= 2000; i++) { const s = i / 2000 * Math.PI * 2 * iv.b * (detune ? 6 : 1); const x = cx + R * Math.sin(s + ph * 0.3); const y = cy + R * Math.sin(s * ratio); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.fillText("Lissajous figürü", cx - 52, cy + R + 24);
    // string
    const sy = h * 0.86; ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(20, sy); ctx.lineTo(w - 20, sy); ctx.stroke();
    const cut = 20 + (w - 40) / ratio; ctx.strokeStyle = COLORS.gold; ctx.beginPath(); ctx.moveTo(20, sy); ctx.lineTo(cut, sy); ctx.stroke();
    ctx.fillStyle = COLORS.gold; ctx.beginPath(); ctx.arc(cut, sy, 6, 0, 7); ctx.fill();
    ctx.fillStyle = COLORS.muted; ctx.fillText(`monokord: tel uzunluğu ${iv.b}/${iv.a}`, 24, sy + 24);
  }, [ratio, base, iv, detune]);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <canvas ref={ref} className={canvasCls} />
      <Panel className="space-y-5">
        <div className="grid grid-cols-2 gap-2">{INTERVALS.map((v, i) => <button key={v.name} onClick={() => setIdx(i)} className={`rounded-xl border px-2 py-2 text-left text-xs ${i === idx ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}><div>{v.name}</div><div className="font-mono">{v.a}:{v.b}</div></button>)}</div>
        <Slider label="Temel frekans" value={base} min={110} max={440} onChange={setBase} fmt={(v) => `${v} Hz`} />
        <Slider label="Akort bozma" value={detune} min={-5} max={5} step={0.1} onChange={setDetune} fmt={(v) => `%${v.toFixed(1)}`} />
        <button onClick={toggle} className="w-full rounded-full bg-primary py-2 font-medium text-primary-foreground hover:opacity-90">{playing ? "Sesi durdur" : "Sesi çal 🔊"}</button>
        <Stat label="Frekans oranı" value={ratio.toFixed(4)} />
      </Panel>
    </div>
  );
}

export default function PythagorasLab() {
  return <ModuleShell meta={MODULES[3]!} lab={<Lab />}
    guide={<>
      <H>Nasıl kullanılır?</H>
      <p>Bir aralık seç (Oktav 2:1, Beşli 3:2 …). Üstteki mavi dalga temel sesi, altın dalga ikinci sesi, kırmızı dalga ise kulağına ulaşan toplamı gösterir. Sağdaki Lissajous figürü iki titreşimi birbirine karşı çizer: basit oranlar kapalı, düzenli şekiller üretir.</p>
      <p><b>Sesi çal</b> ile iki sesi aynı anda dinle (kulaklık önerilir). <b>Akort bozma</b> ile oranı hafifçe kaydır: "vuru" (dalgalanma) duyulur ve Lissajous figürü döner, çünkü oran artık basit bir kesir değildir. Alttaki tel, Pisagor'un monokordunda telin hangi noktadan basılacağını gösterir.</p>
    </>}
    proof={<>
      <H>Amaç</H>
      <p>Efsaneye göre Pisagor, demircilerin çekiçlerinin bazen uyumlu bazen uyumsuz sesler çıkardığını fark etti. Monokord deneyiyle şunu buldu: Bir teli yarı uzunluğa indirmek sesi bir oktav yükseltir (2:1), 2/3 uzunluğa indirmek tam beşli verir (3:2).</p>
      <F>f ∝ 1 / L &nbsp;⇒&nbsp; L₁ : L₂ = 3 : 2 ⇔ f₂ : f₁ = 3 : 2</F>
      <H>Neden basit oranlar uyumlu?</H>
      <p>İki sinüs dalgasının toplamı periyodiktir ancak ve ancak frekans oranı rasyonelse. f₂/f₁ = a/b (en sade kesir) ise, birleşik dalganın periyodu T = b/f₁ = a/f₂ olur. a ve b küçükse desen kısa sürede tekrar eder ve beyin bunu "uyumlu" algılar.</p>
      <F>sin(2πf₁t) + sin(2πf₂t) periyodik ⇔ f₂/f₁ ∈ ℚ</F>
      <p>Oran a/b'den biraz saparsa (f₂ = f₁·a/b + Δ), toplam dalganın genliği |Δ| Hz hızında yükselip alçalır: bu <i>vuru</i>dur. Trigonometrik kimlik bunu açıklar: sin A + sin B = 2·sin((A+B)/2)·cos((A−B)/2).</p>
      <p>Pisagor akort sistemi, tüm notaları yalnızca 3:2 oranını tekrar uygulayarak üretir. 12 beşli 7 oktava neredeyse eşittir ama tam değil: (3/2)¹² / 2⁷ ≈ 1.01364 — buna <b>Pisagor koması</b> denir.</p>
    </>} />;
}
