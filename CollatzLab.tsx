import { useMemo, useRef, useState } from "react";
import { ModuleShell, Panel, Slider, Stat, H, F, canvasCls } from "../ModuleShell";
import { useCanvas, COLORS } from "../useCanvas";
import { MODULES } from "@/lib/modules";

export function collatz(n: number) { const s = [n]; while (n !== 1 && s.length < 5000) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; s.push(n); } return s; }

function Lab() {
  const [n, setN] = useState(27);
  const [log, setLog] = useState(false);
  const seq = useMemo(() => collatz(Math.max(1, Math.floor(n))), [n]);
  const start = useRef(0);
  const last = useRef(seq);
  const ref = useCanvas((ctx, w, h, t) => {
    if (last.current !== seq) { last.current = seq; start.current = t; }
    if (!start.current) start.current = t;
    const prog = Math.min(1, (t - start.current) / 1800);
    ctx.clearRect(0, 0, w, h);
    const pad = 40; const max = Math.max(...seq);
    const fy = (v: number) => log ? Math.log(v) / Math.log(max || 2) : v / max;
    ctx.strokeStyle = COLORS.dim; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) { const y = pad + (h - 2 * pad) * i / 5; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke(); }
    const count = Math.max(2, Math.floor(seq.length * prog));
    const X = (i: number) => pad + (w - 2 * pad) * i / Math.max(1, seq.length - 1);
    const Y = (v: number) => h - pad - (h - 2 * pad) * fy(v);
    const g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, COLORS.cyan); g.addColorStop(1, COLORS.gold);
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.shadowColor = COLORS.gold; ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let i = 0; i < count; i++) i ? ctx.lineTo(X(i), Y(seq[i]!)) : ctx.moveTo(X(i), Y(seq[i]!));
    ctx.stroke(); ctx.shadowBlur = 0;
    for (let i = 0; i < count; i++) { ctx.fillStyle = seq[i]! % 2 ? COLORS.red : COLORS.cyan; ctx.beginPath(); ctx.arc(X(i), Y(seq[i]!), seq.length > 150 ? 1.2 : 2.6, 0, 7); ctx.fill(); }
    ctx.fillStyle = COLORS.muted; ctx.font = "12px JetBrains Mono";
    ctx.fillText(`maks ${max}`, pad, pad - 12); ctx.fillText(`adım ${seq.length - 1}`, w - pad - 70, h - 14);
  }, [seq, log]);
  const max = Math.max(...seq);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <canvas ref={ref} className={canvasCls} />
        <Panel className="space-y-5">
          <label className="block space-y-2 text-sm text-muted-foreground">Başlangıç sayısı
            <input type="number" min={1} max={1000000} value={n} onChange={(e) => setN(Math.min(1e6, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full rounded-lg border border-input bg-muted px-3 py-2 font-mono text-lg text-foreground outline-none focus:border-primary" />
          </label>
          <Slider label="Hızlı seçim" value={Math.min(n, 1000)} min={1} max={1000} onChange={setN} />
          <div className="flex flex-wrap gap-2">{[7, 27, 97, 871, 77031].map((v) => <button key={v} onClick={() => setN(v)} className="rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary hover:text-primary">{v}</button>)}</div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={log} onChange={(e) => setLog(e.target.checked)} /> Logaritmik ölçek</label>
          <div className="grid grid-cols-2 gap-2"><Stat label="Adım sayısı" value={seq.length - 1} /><Stat label="En yüksek değer" value={max.toLocaleString("tr-TR")} /></div>
          <p className="text-xs text-muted-foreground"><span className="text-accent">●</span> tek (3x+1) &nbsp; <span className="text-secondary">●</span> çift (x/2)</p>
        </Panel>
      </div>
      <Panel><div className="flex max-h-40 flex-wrap gap-1.5 overflow-auto font-mono text-xs">{seq.map((v, i) => <span key={i} className={`rounded-md px-2 py-1 ${v % 2 ? "bg-accent/15 text-accent" : "bg-secondary/15 text-secondary"}`}>{v}</span>)}</div></Panel>
    </div>
  );
}

export default function CollatzLab() {
  return <ModuleShell meta={MODULES[1]!} lab={<Lab />}
    guide={<>
      <H>Nasıl kullanılır?</H>
      <p>Bir pozitif tam sayı yaz ya da kaydırıcıyı kullan. Grafik, sayının 1'e ulaşana kadar izlediği yolu (yörüngeyi) animasyonla çizer. Kırmızı noktalar tek sayılar, mavi noktalar çift sayılardır.</p>
      <p>27'yi dene: yalnızca 27'den başlayan dizi 111 adım sürer ve 9232'ye kadar tırmanır! Büyük sayılarda <b>logaritmik ölçek</b> grafiği okunur hale getirir. Alttaki çipler dizinin tamamını gösterir.</p>
    </>}
    proof={<>
      <H>Kural</H>
      <F>x çiftse → x/2 &nbsp;&nbsp; x tekse → 3x + 1</F>
      <p><b>Sanı (1937, Lothar Collatz):</b> Hangi pozitif tam sayıdan başlarsan başla, dizi her zaman 1'e ulaşır ve 4 → 2 → 1 döngüsüne girer.</p>
      <H>Neden kanıtlanamadı?</H>
      <p>Bu bir <i>sanı</i>dır, yani henüz kanıtlanmamıştır. Bilgisayarlarla 2⁶⁸'e kadar tüm sayılar kontrol edildi. Sezgisel bir argüman: Tek bir x için 3x+1 her zaman çifttir, dolayısıyla en az bir kez 2'ye bölünür. Ortalama olarak bir tek adımı yaklaşık 2 bölme izler; böylece ortalama çarpan (3/4) &lt; 1 olur ve dizi "beklenen" olarak küçülür.</p>
      <F>Ortalama büyüme ≈ 3 · (1/2)² = 3/4 &lt; 1</F>
      <p>Ancak "ortalamada küçülür" demek "her zaman 1'e ulaşır" demek değildir: sonsuza kaçan bir yörünge veya 1'i içermeyen başka bir döngü olmadığını göstermek gerekir. 2019'da Terence Tao, "neredeyse tüm" sayıların yörüngesinin keyfi olarak küçük değerlere indiğini kanıtladı — ama tam kanıt hâlâ yok. Paul Erdős'ün sözüyle: "Matematik bu tür problemlere henüz hazır değil."</p>
    </>} />;
}
