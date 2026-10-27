import { useRef, useState } from "react";
import { ModuleShell, Panel, Slider, Stat, H, F, canvasCls } from "../ModuleShell";
import { useCanvas, COLORS } from "../useCanvas";
import { MODULES } from "@/lib/modules";

const PHI = (1 + Math.sqrt(5)) / 2;

function fib(n: number) { const a = [1, 1]; while (a.length < n) a.push(a[a.length - 1]! + a[a.length - 2]!); return a.slice(0, n); }

function Lab() {
  const [n, setN] = useState(10);
  const [showSq, setShowSq] = useState(true);
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });
  const ref = useCanvas((ctx, w, h, t) => {
    const m = mouse.current;
    m.x += (m.tx - m.x) * 0.08; m.y += (m.ty - m.y) * 0.08;
    ctx.fillStyle = "rgba(10,10,12,0.35)"; ctx.fillRect(0, 0, w, h);
    const cx = m.x * w, cy = m.y * h;
    const ang = Math.atan2(m.y - 0.5, m.x - 0.5) + t * 0.0002;
    const H0 = Math.min(w, h) * 0.55;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    let x = -H0 * PHI * 0.62, y = -H0 * 0.62, rw = H0 * PHI, rh = H0;
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const d = i % 4; const hue = 80 + i * 12;
      ctx.strokeStyle = `oklch(0.8 0.13 ${hue} / 0.35)`;
      let sx = 0, sy = 0, s = 0, acx = 0, acy = 0, a0 = 0;
      if (d === 0) { s = rh; sx = x; sy = y; acx = x + s; acy = y + s; a0 = Math.PI; x += s; rw -= s; }
      else if (d === 1) { s = rw; sx = x; sy = y; acx = x; acy = y + s; a0 = 1.5 * Math.PI; y += s; rh -= s; }
      else if (d === 2) { s = rh; sx = x + rw - s; sy = y; acx = sx; acy = sy; a0 = 0; rw -= s; }
      else { s = rw; sx = x; sy = y + rh - s; acx = x + s; acy = sy; a0 = 0.5 * Math.PI; rh -= s; }
      if (showSq) ctx.strokeRect(sx, sy, s, s);
      ctx.beginPath(); ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 2.2;
      ctx.shadowColor = COLORS.gold; ctx.shadowBlur = 12;
      ctx.arc(acx, acy, s, a0, a0 + Math.PI / 2); ctx.stroke();
      ctx.shadowBlur = 0; ctx.lineWidth = 1;
    }
    ctx.restore();
    // sunflower phyllotaxis dots around cursor
    const GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < 220; i++) {
      const r = 4 * Math.sqrt(i); const a = i * GA + t * 0.0005;
      ctx.fillStyle = `oklch(0.72 0.13 195 / ${0.6 - i / 450})`;
      ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 1.4, 0, 7); ctx.fill();
    }
  });
  const f = fib(n + 1);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <canvas ref={ref} className={canvasCls + " cursor-crosshair"}
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mouse.current.tx = (e.clientX - r.left) / r.width; mouse.current.ty = (e.clientY - r.top) / r.height; }} />
      <Panel className="space-y-5">
        <Slider label="Kare sayısı" value={n} min={3} max={16} onChange={setN} />
        <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={showSq} onChange={(e) => setShowSq(e.target.checked)} /> Fibonacci karelerini göster</label>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Fₙ₊₁ / Fₙ" value={(f[n]! / f[n - 1]!).toFixed(6)} />
          <Stat label="φ" value={PHI.toFixed(6)} />
        </div>
        <Stat label="Hata |oran − φ|" value={Math.abs(f[n]! / f[n - 1]! - PHI).toExponential(2)} />
        <p className="font-mono text-xs leading-6 text-muted-foreground">{f.join(" · ")}</p>
      </Panel>
    </div>
  );
}

export default function GoldenLab() {
  return <ModuleShell meta={MODULES[0]!} lab={<Lab />}
    guide={<>
      <H>Nasıl kullanılır?</H>
      <p>Fareyi (veya parmağını) tuval üzerinde gezdir: sarmalın merkezi imlecini yumuşakça takip eder ve imlecin konumuna göre döner. İmlecin etrafındaki mavi noktalar ayçiçeği tohumlarının dizilişini (filotaksi) gösterir.</p>
      <p><b>Kare sayısı</b> kaydırıcısı ile Fibonacci karelerinin sayısını artır. Sağ paneldeki <b>Fₙ₊₁/Fₙ</b> oranının φ değerine nasıl hızla yaklaştığını ve hatanın üstel olarak küçüldüğünü izle.</p>
      <p>Her yeni kare, önceki iki karenin kenar uzunluklarının toplamı kadardır. Her karenin içine çizilen çeyrek çember yayları birleşerek altın sarmalı oluşturur.</p>
    </>}
    proof={<>
      <H>Amaç</H>
      <p>Bir doğru parçasını, büyük parçanın küçüğe oranı bütünün büyüğe oranına eşit olacak şekilde bölersek bu oran altın orandır: a/b = (a+b)/a = φ.</p>
      <F>φ² = φ + 1 ⇒ φ = (1 + √5) / 2 ≈ 1.6180339887</F>
      <H>Kanıt: Fₙ₊₁/Fₙ → φ</H>
      <p>Fibonacci dizisi Fₙ₊₁ = Fₙ + Fₙ₋₁ ile tanımlanır. Rₙ = Fₙ₊₁/Fₙ dersek, her iki tarafı Fₙ'ye bölerek Rₙ = 1 + 1/Rₙ₋₁ elde ederiz. Dizi yakınsıyorsa limiti L için L = 1 + 1/L, yani L² − L − 1 = 0 olur. Pozitif kök L = (1+√5)/2 = φ'dir.</p>
      <p>Binet formülü bunu kesinleştirir: <span className="font-mono text-secondary">Fₙ = (φⁿ − ψⁿ)/√5</span>, burada ψ = (1−√5)/2 ve |ψ| &lt; 1. n büyüdükçe ψⁿ → 0, böylece Fₙ₊₁/Fₙ → φ. Hata yaklaşık |ψ/φ|ⁿ hızında küçülür — paneldeki hatanın neden her adımda ≈2.6 kat azaldığını açıklar.</p>
      <H>Doğadaki karşılığı</H>
      <p>Altın açı 360°/φ² ≈ 137.5°'dir. Bitkiler yeni tohumu bu açıyla yerleştirdiğinde hiçbir tohum bir öncekiyle hizalanmaz ve alan en verimli biçimde dolar.</p>
    </>} />;
}
