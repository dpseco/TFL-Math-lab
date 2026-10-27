import { useState } from "react";
import { ModuleShell, Panel, Slider, Stat, H, F, canvasCls } from "../ModuleShell";
import { useCanvas, COLORS } from "../useCanvas";
import { MODULES } from "@/lib/modules";

export const compound = (P: number, r: number, n: number, t: number) => P * Math.pow(1 + r / n, n * t);

function Lab() {
  const [P, setP] = useState(1000);
  const [rate, setRate] = useState(50);
  const [n, setN] = useState(4);
  const [T, setT] = useState(5);
  const [decay, setDecay] = useState(false);
  const r = (decay ? -1 : 1) * rate / 100;
  const ref = useCanvas((ctx, w, h, time) => {
    ctx.clearRect(0, 0, w, h);
    const pad = 50; const ymax = Math.max(P, P * Math.exp(r * T)) * 1.05;
    const X = (t: number) => pad + (w - 2 * pad) * t / T; const Y = (v: number) => h - pad - (h - 2 * pad) * v / ymax;
    ctx.strokeStyle = COLORS.dim; ctx.fillStyle = COLORS.muted; ctx.font = "11px JetBrains Mono";
    for (let i = 0; i <= 5; i++) { const y = pad + (h - 2 * pad) * i / 5; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke(); ctx.fillText(Math.round(ymax * (1 - i / 5)).toLocaleString("tr-TR"), 4, y + 4); }
    for (let i = 0; i <= T; i++) ctx.fillText(`${i}. yıl`, X(i) - 14, h - pad + 18);
    // discrete step curve
    ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(P));
    const steps = Math.min(2000, Math.round(n * T));
    for (let k = 1; k <= steps; k++) { const t = k / n; const v = compound(P, r, n, t); const prev = compound(P, r, n, (k - 1) / n); ctx.lineTo(X(Math.min(t, T)), Y(prev)); ctx.lineTo(X(Math.min(t, T)), Y(v)); }
    ctx.stroke();
    // continuous
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 2.5; ctx.shadowColor = COLORS.gold; ctx.shadowBlur = 12; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const t = T * i / 300; i ? ctx.lineTo(X(t), Y(P * Math.exp(r * t))) : ctx.moveTo(X(t), Y(P * Math.exp(r * t))); }
    ctx.stroke(); ctx.shadowBlur = 0;
    // moving dot
    const tt = ((time / 4000) % 1) * T; ctx.fillStyle = COLORS.gold; ctx.beginPath(); ctx.arc(X(tt), Y(P * Math.exp(r * tt)), 5, 0, 7); ctx.fill();
    ctx.fillStyle = COLORS.cyan; ctx.fillText(`— yılda ${n} kez bileşik`, pad + 8, pad - 22); ctx.fillStyle = COLORS.gold; ctx.fillText(`— sürekli: P·e^(rt)`, pad + 200, pad - 22);
  }, [P, r, n, T]);
  const disc = compound(P, r, n, T); const cont = P * Math.exp(r * T);
  const ns = [1, 2, 4, 12, 365, 8760, 1e6];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <canvas ref={ref} className={canvasCls} />
        <Panel className="space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-full border border-border p-1 text-sm">
            {["Büyüme", "Sönüm"].map((l, i) => <button key={l} onClick={() => setDecay(i === 1)} className={`rounded-full py-1.5 ${decay === (i === 1) ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>)}
          </div>
          <Slider label="Başlangıç miktarı P" value={P} min={100} max={10000} step={100} onChange={setP} fmt={(v) => v.toLocaleString("tr-TR")} />
          <Slider label={decay ? "Sönüm oranı" : "Yıllık faiz oranı"} value={rate} min={1} max={100} onChange={setRate} fmt={(v) => `%${v}`} />
          <Slider label="Yıllık bileşik sayısı n" value={n} min={1} max={365} onChange={setN} />
          <Slider label="Süre (yıl)" value={T} min={1} max={20} onChange={setT} />
          <div className="grid grid-cols-2 gap-2"><Stat label="Kesikli" value={disc.toFixed(2)} /><Stat label="Sürekli" value={cont.toFixed(2)} /></div>
          {decay && <Stat label="Yarılanma süresi ln2 / r" value={`${(Math.LN2 / Math.abs(r)).toFixed(3)} yıl`} />}
        </Panel>
      </div>
      <Panel>
        <p className="mb-3 text-sm text-muted-foreground">(1 + 1/n)ⁿ dizisinin e sayısına yakınsaması</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{ns.map((k) => <Stat key={k} label={`n = ${k.toLocaleString("tr-TR")}`} value={Math.pow(1 + 1 / k, k).toFixed(6)} />)}</div>
        <p className="mt-3 font-mono text-sm text-primary">e = 2.718281828459…</p>
      </Panel>
    </div>
  );
}

export default function EulerLab() {
  return <ModuleShell meta={MODULES[7]!} lab={<Lab />}
    guide={<>
      <H>Nasıl kullanılır?</H>
      <p>Bankaya P lira yatırdığını düşün. <b>Faiz oranı</b>, <b>yıllık bileşik sayısı n</b> ve <b>süre</b> kaydırıcılarını değiştir. Mavi basamaklı eğri, faizin yılda n kez eklendiği durumu; altın eğri ise faizin her an (sürekli) eklendiği durumu gösterir.</p>
      <p>n'yi 1'den 365'e çıkardıkça mavi basamakların altın eğriye yapıştığını gör. <b>Sönüm</b> moduna geçerek radyoaktif bozunma veya ilacın kandan atılması gibi üstel azalmayı incele ve yarılanma süresini oku. Alttaki tablo, (1+1/n)ⁿ'nin e'ye nasıl yaklaştığını gösterir.</p>
    </>}
    proof={<>
      <H>Amaç: e nereden çıkar?</H>
      <p>Yıllık %100 faizle 1 lira yatıralım. Faiz yılda bir eklenirse yıl sonunda 2 lira, yılda 2 kez %50 eklenirse (1.5)² = 2.25, yılda n kez eklenirse (1 + 1/n)ⁿ lira olur. Bu değer büyür ama sonsuza gitmez:</p>
      <F>e = lim (n→∞) (1 + 1/n)ⁿ ≈ 2.718281828</F>
      <H>Kanıt: Sınırlılık</H>
      <p>Binom açılımıyla (1 + 1/n)ⁿ = Σ C(n,k)/nᵏ. Her terim için C(n,k)/nᵏ = [n(n−1)…(n−k+1)]/(nᵏ·k!) ≤ 1/k! olduğundan:</p>
      <F>(1 + 1/n)ⁿ ≤ 1 + 1 + 1/2! + 1/3! + … ≤ 1 + 1 + 1/2 + 1/4 + … = 3</F>
      <p>Dizi artan (n büyüdükçe her terim büyür ve yeni terim eklenir) ve 3 ile sınırlı olduğundan, Monoton Yakınsaklık Teoremi gereği bir limiti vardır; bu limit e'dir ve e = Σ 1/k! olarak da yazılır.</p>
      <H>Sürekli büyüme</H>
      <p>Oran r, süre t ise: P(1 + r/n)^(nt) = P[(1 + r/n)^(n/r)]^(rt) → P·e^(rt). e^x'in en özel yanı türevinin kendisine eşit olmasıdır: d/dx eˣ = eˣ. Yani "büyüme hızı miktarla orantılı" olan her sistem (nüfus, faiz, bozunma, soğuma) dy/dt = ky denklemine uyar ve çözümü y = y₀·e^(kt)'dir. Sönümde k &lt; 0 ve yarılanma süresi ln 2 / |k| olur.</p>
    </>} />;
}
