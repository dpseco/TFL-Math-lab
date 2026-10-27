import { useRef, useState } from "react";
import { ModuleShell, Panel, Slider, Stat, H, F, canvasCls } from "../ModuleShell";
import { useCanvas, COLORS } from "../useCanvas";
import { MODULES } from "@/lib/modules";

function Lab() {
  const [p, setP] = useState(0);
  const [play, setPlay] = useState(false);
  const [sides, setSides] = useState(6);
  const pr = useRef(0);
  const ref = useCanvas((ctx, w, h) => {
    if (play) { pr.current = Math.min(1, pr.current + 0.004); if (pr.current >= 1) setPlay(false); setP(pr.current); } else pr.current = p;
    const t = pr.current;
    ctx.clearRect(0, 0, w, h);
    const r = Math.min(w / 8.2, h / 5);
    const x0 = w / 2 - Math.PI * r; const yl = h * 0.62;
    // ruler ticks
    ctx.strokeStyle = COLORS.dim; ctx.beginPath(); ctx.moveTo(20, yl); ctx.lineTo(w - 20, yl); ctx.stroke();
    ctx.fillStyle = COLORS.muted; ctx.font = "12px JetBrains Mono";
    for (let k = 0; k <= 7; k++) { const x = x0 + k * r; ctx.fillRect(x, yl, 1, 8); ctx.fillText(String(k / 2 * 1), x - 6, yl + 22); }
    ctx.fillText("(çap birimi)", x0 + 7 * r + 8, yl + 22);
    const L = 2 * Math.PI * r * t; const cx = x0 + L; const cy = yl - r; const rot = t * 2 * Math.PI;
    // unrolled part
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4; ctx.shadowColor = COLORS.gold; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(x0, yl); ctx.lineTo(cx, yl); ctx.stroke();
    // remaining arc (touching point at bottom)
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI / 2, Math.PI / 2 + 2 * Math.PI * (1 - t)); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    // diameter
    ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(cx - r * Math.cos(rot), cy - r * Math.sin(rot)); ctx.lineTo(cx + r * Math.cos(rot), cy + r * Math.sin(rot)); ctx.stroke();
    // inscribed polygon (Archimedes)
    ctx.strokeStyle = COLORS.red; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= sides; i++) { const a = rot + i * 2 * Math.PI / sides; const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    ctx.fillStyle = COLORS.text; ctx.font = "16px JetBrains Mono";
    ctx.fillText(`açılan uzunluk = ${(2 * Math.PI * t).toFixed(4)} r = ${(Math.PI * t).toFixed(4)} · çap`, 24, 34);
  }, [play, p, sides]);
  const inscribed = sides * Math.sin(Math.PI / sides);
  const circ = sides * Math.tan(Math.PI / sides);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <canvas ref={ref} className={canvasCls} />
      <Panel className="space-y-5">
        <Slider label="Açılım" value={p} min={0} max={1} step={0.001} onChange={(v) => { setPlay(false); setP(v); }} fmt={(v) => `%${(v * 100).toFixed(1)}`} />
        <button onClick={() => { if (pr.current >= 1) { pr.current = 0; setP(0); } setPlay(!play); }} className="w-full rounded-full bg-primary py-2 font-medium text-primary-foreground hover:opacity-90">{play ? "Duraklat" : "Çemberi yuvarla"}</button>
        <Slider label="Arşimet çokgeni kenar sayısı" value={sides} min={3} max={96} onChange={setSides} />
        <div className="grid grid-cols-2 gap-2"><Stat label="İç çokgen" value={inscribed.toFixed(5)} /><Stat label="Dış çokgen" value={circ.toFixed(5)} /></div>
        <Stat label="π" value={Math.PI.toFixed(10)} />
        <p className="text-xs text-muted-foreground">π, iç ve dış çokgenin çevre/çap oranları arasına sıkışır.</p>
      </Panel>
    </div>
  );
}

export default function PiLab() {
  return <ModuleShell meta={MODULES[2]!} lab={<Lab />}
    guide={<>
      <H>Nasıl kullanılır?</H>
      <p><b>Çemberi yuvarla</b> düğmesine bas ya da açılım kaydırıcısını sürükle. Çember zemin üzerinde kaymadan yuvarlanır; altın renkli çizgi, çemberin çevresinin bir doğruya "açılmış" halidir. Mavi çizgi çaptır.</p>
      <p>Tam bir tur sonunda altın çizgi, alttaki cetvelde tam olarak <b>3.14159…</b> çap uzunluğuna ulaşır. Kırmızı çokgen, Arşimet'in yöntemini gösterir: kenar sayısını artırdıkça çokgen çembere yapışır.</p>
    </>}
    proof={<>
      <H>Amaç</H>
      <p>Her çemberin çevresinin çapına oranı aynıdır. Bu evrensel sabite π denir. Çember büyüse de küçülse de oran değişmez çünkü tüm çemberler birbirine benzerdir (benzerlik oranı k ise hem çevre hem çap k ile çarpılır).</p>
      <F>Ç = 2πr = π · d</F>
      <H>Arşimet'in sıkıştırma kanıtı</H>
      <p>Yarıçapı 1 olan bir çembere n kenarlı düzgün çokgen içten çizilsin. Merkezden her kenara bakan açı 2π/n, kenar uzunluğu 2·sin(π/n)'dir. Dıştan çizilen çokgenin kenarı 2·tan(π/n)'dir. Çevreler sırasıyla 2n·sin(π/n) ve 2n·tan(π/n) olur; çember bunların arasındadır:</p>
      <F>n · sin(π/n) &lt; π &lt; n · tan(π/n)</F>
      <p>n → ∞ iken sin(x)/x → 1 ve tan(x)/x → 1 olduğundan her iki sınır da π'ye yakınsar (sıkıştırma teoremi). Arşimet 96 kenarlı çokgenle 3.1408 &lt; π &lt; 3.1429 sonucuna ulaştı — kaydırıcıyı 96'ya getirip kendin gör!</p>
      <p>π irrasyoneldir (Lambert, 1761) ve hatta aşkındır (Lindemann, 1882): bu yüzden pergel-cetvelle çemberin karesini çizmek imkânsızdır.</p>
    </>} />;
}
