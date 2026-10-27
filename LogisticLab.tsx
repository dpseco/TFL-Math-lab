import { useMemo, useRef, useState } from "react";
import { ModuleShell, Panel, Slider, Stat, H, F, canvasCls } from "../ModuleShell";
import { useCanvas, COLORS } from "../useCanvas";
import { MODULES } from "@/lib/modules";

export function logistic(r: number, x0: number, n: number) { const a = [x0]; for (let i = 1; i < n; i++) a.push(r * a[i - 1]! * (1 - a[i - 1]!)); return a; }

function Lab() {
  const [r, setR] = useState(3.2);
  const [x0, setX0] = useState(0.2);
  const [eps, setEps] = useState(true);
  const series = useMemo(() => logistic(r, x0, 80), [r, x0]);
  const series2 = useMemo(() => logistic(r, x0 + 0.0001, 80), [r, x0]);
  const bif = useRef<{ w: number; h: number; img: HTMLCanvasElement } | null>(null);
  const ref = useCanvas((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const half = w >= 700 ? w / 2 : w; const th = w >= 700 ? h : h / 2;
    // time series
    const pad = 30;
    ctx.strokeStyle = COLORS.dim; ctx.strokeRect(pad, pad, half - 2 * pad, th - 2 * pad);
    const X = (i: number) => pad + (half - 2 * pad) * i / 79; const Y = (v: number) => th - pad - (th - 2 * pad) * v;
    const line = (s: number[], col: string) => { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); s.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))); ctx.stroke(); };
    if (eps) line(series2, COLORS.red);
    line(series, COLORS.gold);
    series.forEach((v, i) => { ctx.fillStyle = COLORS.gold; ctx.fillRect(X(i) - 1.5, Y(v) - 1.5, 3, 3); });
    ctx.fillStyle = COLORS.muted; ctx.font = "12px JetBrains Mono"; ctx.fillText("xₙ — zaman serisi", pad + 6, pad + 16);
    // bifurcation
    const bx = w >= 700 ? half : 0, by = w >= 700 ? 0 : th, bw = w >= 700 ? half : w;
    if (!bif.current || bif.current.w !== bw || bif.current.h !== th) {
      const c = document.createElement("canvas"); c.width = bw; c.height = th; const g = c.getContext("2d")!;
      g.fillStyle = "oklch(0.82 0.14 80 / 0.12)";
      for (let px = 0; px < bw - 2 * pad; px++) {
        const rr = 2.5 + 1.5 * px / (bw - 2 * pad); let x = 0.5;
        for (let i = 0; i < 300; i++) x = rr * x * (1 - x);
        for (let i = 0; i < 200; i++) { x = rr * x * (1 - x); g.fillRect(pad + px, th - pad - (th - 2 * pad) * x, 1, 1); }
      }
      bif.current = { w: bw, h: th, img: c };
    }
    ctx.drawImage(bif.current.img, bx, by);
    ctx.strokeStyle = COLORS.dim; ctx.strokeRect(bx + pad, by + pad, bw - 2 * pad, th - 2 * pad);
    if (r >= 2.5) { const mx = bx + pad + (bw - 2 * pad) * (r - 2.5) / 1.5; ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(mx, by + pad); ctx.lineTo(mx, by + th - pad); ctx.stroke(); }
    ctx.fillStyle = COLORS.muted; ctx.fillText("Çatallanma diyagramı (r: 2.5 → 4)", bx + pad + 6, by + pad + 16);
  }, [series, series2, r, eps]);
  const tail = series.slice(-16).map((v) => v.toFixed(3));
  const period = new Set(tail).size;
  const regime = r < 1 ? "Yok oluş" : r < 3 ? "Sabit denge" : r < 3.5699 ? `Periyodik (${period} döngü)` : "Kaos";
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <canvas ref={ref} className={canvasCls} />
      <Panel className="space-y-5">
        <Slider label="Büyüme oranı r" value={r} min={0} max={4} step={0.001} onChange={setR} fmt={(v) => v.toFixed(3)} />
        <Slider label="Başlangıç nüfusu x₀" value={x0} min={0.01} max={0.99} step={0.01} onChange={setX0} fmt={(v) => v.toFixed(2)} />
        <div className="flex flex-wrap gap-2">{[2.8, 3.2, 3.5, 3.83, 3.99].map((v) => <button key={v} onClick={() => setR(v)} className="rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary hover:text-primary">{v}</button>)}</div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={eps} onChange={(e) => setEps(e.target.checked)} /> x₀ + 0.0001 ile karşılaştır (kırmızı)</label>
        <Stat label="Rejim" value={regime} />
        <Stat label="x₈₀" value={series[79]!.toFixed(6)} />
      </Panel>
    </div>
  );
}

export default function LogisticLab() {
  return <ModuleShell meta={MODULES[4]!} lab={<Lab />}
    guide={<>
      <H>Nasıl kullanılır?</H>
      <p><b>r</b> kaydırıcısı nüfusun büyüme hızını, <b>x₀</b> ise başlangıçtaki nüfus oranını (0 ile 1 arası) belirler. Sol grafik nüfusun yıllar içinde nasıl değiştiğini, sağdaki çatallanma diyagramı ise her r değeri için uzun vadede nüfusun hangi değerlere yerleştiğini gösterir. Mavi çizgi şu anki r'ni işaretler.</p>
      <p>r'yi yavaşça artır: önce tek bir dengeye oturur, r = 3'te 2 değer arasında salınır, 3.449'da 4'e, sonra 8'e… ve 3.57'den sonra kaos başlar. Kırmızı eğri, başlangıcı yalnızca 0.0001 farklı olan bir nüfustur — kaos bölgesinde iki eğrinin kısa sürede tamamen ayrıldığını gör.</p>
    </>}
    proof={<>
      <H>Model</H>
      <F>xₙ₊₁ = r · xₙ · (1 − xₙ)</F>
      <p>r·xₙ terimi büyümeyi, (1 − xₙ) terimi ise kaynak sınırını (kalabalıklaşma) temsil eder. Bu kadar basit bir kural, kaotik davranış üretebilir (Robert May, 1976).</p>
      <H>Sabit noktalar ve kararlılık</H>
      <p>Sabit nokta x* için x* = r·x*(1−x*) çözülürse x* = 0 veya <span className="font-mono text-secondary">x* = 1 − 1/r</span> bulunur. f(x) = rx(1−x) için türev f′(x) = r(1 − 2x). Bir sabit nokta |f′(x*)| &lt; 1 ise kararlıdır.</p>
      <F>f′(1 − 1/r) = 2 − r &nbsp;⇒&nbsp; kararlı ⇔ 1 &lt; r &lt; 3</F>
      <p>r = 3'te |f′| = 1 olur ve denge kararlılığını kaybeder: 2-periyotlu bir döngü doğar (periyot ikilenmesi). Ardışık çatallanma noktaları arasındaki mesafelerin oranı evrensel <b>Feigenbaum sabiti</b> δ ≈ 4.6692'ye yakınsar.</p>
      <p>r = 4'te x = sin²(θ) dönüşümüyle sistem θₙ₊₁ = 2θₙ olur: her adımda açı ikiye katlanır, yani başlangıçtaki küçük hata her adımda 2 katına çıkar. Bu, "başlangıç koşullarına hassas bağımlılık"ın — kaosun — matematiksel kalbidir.</p>
    </>} />;
}
