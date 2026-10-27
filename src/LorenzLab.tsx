import { useEffect, useRef, useState } from "react";
import { ModuleShell, Panel, Slider, Stat, H, F, canvasCls } from "../ModuleShell";
import { useCanvas } from "../useCanvas";
import { MODULES } from "@/lib/modules";

type P = { x: number; y: number; z: number; px?: number; py?: number };

function seed(n: number): P[] { return Array.from({ length: n }, (_, i) => ({ x: 1 + i * 1e-3, y: 1, z: 20 })); }

function Lab() {
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(8 / 3);
  const [count, setCount] = useState(300);
  const parts = useRef<P[] | null>(null);
  const mouse = useRef({ x: 0, y: 0, vx: 0, vy: 0, rot: 0, inside: false });
  const spread = useRef(0);
  const ref = useCanvas((ctx, w, h) => {
    if (!parts.current || parts.current.length !== count) parts.current = seed(count);
    const m = mouse.current;
    const speed = Math.min(40, Math.hypot(m.vx, m.vy)); m.vx *= 0.9; m.vy *= 0.9;
    m.rot += 0.003 + speed * 0.0008;
    ctx.fillStyle = "rgba(10,10,12,0.06)"; ctx.fillRect(0, 0, w, h);
    const sc = Math.min(w, h) / 70; const cos = Math.cos(m.rot), sin = Math.sin(m.rot);
    const dt = 0.006 * (1 + speed * 0.05);
    let sx = 0;
    for (const p of parts.current) {
      for (let s = 0; s < 2; s++) {
        const dx = sigma * (p.y - p.x), dy = p.x * (rho - p.z) - p.y, dz = p.x * p.y - beta * p.z;
        p.x += dx * dt; p.y += dy * dt; p.z += dz * dt;
      }
      let X = w / 2 + (p.x * cos - p.y * sin) * sc; let Y = h * 0.92 - p.z * sc;
      if (m.inside) { const ddx = X - m.x, ddy = Y - m.y; const d = Math.hypot(ddx, ddy); if (d < 80 && speed > 2) { p.x += (Math.random() - 0.5) * 0.4; p.y += (Math.random() - 0.5) * 0.4; } }
      const v = Math.min(1, Math.hypot(sigma * (p.y - p.x), p.x * (rho - p.z) - p.y) / 120);
      if (p.px !== undefined) { ctx.strokeStyle = `oklch(${0.6 + 0.3 * v} 0.16 ${195 - v * 115} / 0.95)`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(p.px, p.py!); ctx.lineTo(X, Y); ctx.stroke(); }
      p.px = X; p.py = Y; sx += p.x;
    }
    const mean = sx / count; let varr = 0; for (const p of parts.current) varr += (p.x - mean) ** 2;
    spread.current = Math.sqrt(varr / count);
  }, [sigma, rho, beta, count]);
  const [spr, setSpr] = useState(0);
  useEffect(() => { const id = setInterval(() => setSpr(spread.current), 300); return () => clearInterval(id); }, []);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <canvas ref={ref} className={canvasCls + " cursor-crosshair"}
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const m = mouse.current; const x = e.clientX - r.left, y = e.clientY - r.top; m.vx = x - m.x; m.vy = y - m.y; m.x = x; m.y = y; m.inside = true; setSpr(spread.current); }}
        onPointerLeave={() => (mouse.current.inside = false)} />
      <Panel className="space-y-5">
        <Slider label="σ (Prandtl)" value={sigma} min={1} max={30} step={0.1} onChange={setSigma} fmt={(v) => v.toFixed(1)} />
        <Slider label="ρ (Rayleigh)" value={rho} min={1} max={60} step={0.1} onChange={setRho} fmt={(v) => v.toFixed(1)} />
        <Slider label="β" value={beta} min={0.5} max={6} step={0.01} onChange={setBeta} fmt={(v) => v.toFixed(2)} />
        <Slider label="Parçacık sayısı" value={count} min={20} max={800} step={10} onChange={setCount} />
        <button onClick={() => { parts.current = seed(count); }} className="w-full rounded-full bg-primary py-2 font-medium text-primary-foreground hover:opacity-90">Parçacıkları sıfırla</button>
        <Stat label="Parçacık yayılımı (x std. sapma)" value={spr.toFixed(3)} />
      </Panel>
    </div>
  );
}

export default function LorenzLab() {
  return <ModuleShell meta={MODULES[6]!} lab={<Lab />}
    guide={<>
      <H>Nasıl kullanılır?</H>
      <p>Tüm parçacıklar neredeyse aynı noktadan (aralarında yalnızca 0.001 fark ile) başlar. İlk saniyelerde tek bir çizgi gibi hareket ederler, sonra kelebek kanatlarına benzeyen çekici üzerinde birbirlerinden tamamen ayrılırlar.</p>
      <p>Fareyi tuval üzerinde hızlıca hareket ettir: imlecin yakınındaki parçacıklar sarsılır, görüş açısı ve simülasyon hızı fare hızınla artar. Renkler parçacık hızını gösterir (mavi yavaş, altın hızlı). σ, ρ, β kaydırıcılarıyla sistemi değiştir: ρ &lt; 24.7 iken parçacıklar iki noktadan birine yerleşir, üstünde kaos başlar.</p>
    </>}
    proof={<>
      <H>Lorenz denklemleri (1963)</H>
      <F>dx/dt = σ(y − x) &nbsp;·&nbsp; dy/dt = x(ρ − z) − y &nbsp;·&nbsp; dz/dt = xy − βz</F>
      <p>Meteorolog Edward Lorenz, atmosferdeki ısı taşınımını modellerken bu 3 denkleme ulaştı. Bir gün hesaplamayı 0.506127 yerine 0.506 ile yeniden başlattığında sonuçların tamamen farklı çıktığını gördü: <b>kelebek etkisi</b>.</p>
      <H>Denge noktaları ve kararlılık</H>
      <p>Tüm türevler sıfır olduğunda: y = x, z = ρ − 1 ve x² = β(ρ − 1). ρ &gt; 1 için iki simetrik denge noktası çıkar:</p>
      <F>C± = ( ±√(β(ρ−1)), ±√(β(ρ−1)), ρ − 1 )</F>
      <p>Bu noktalar etrafındaki Jacobi matrisinin özdeğerleri incelendiğinde, σ = 10, β = 8/3 için ρ &gt; ≈24.74 olunca noktaların kararsızlaştığı görülür. Yörünge iki "kanat" arasında öngörülemez biçimde gidip gelir ama asla kendini tekrarlamaz ve sonsuza kaçmaz.</p>
      <p>Sistemin hacim değişim hızı div F = −σ − 1 − β &lt; 0'dır: her hacim zamanla sıfıra büzülür. Yani çekicinin hacmi sıfırdır ama yüzey de değildir — boyutu ≈2.06 olan bir <b>garip çekici</b>dir. Yakın iki yörünge arasındaki mesafe yaklaşık e^(0.9t) hızıyla açılır (Lyapunov üsteli ≈ 0.9).</p>
    </>} />;
}
