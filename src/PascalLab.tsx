import { useState } from "react";
import { ModuleShell, Panel, Slider, Stat, H, F, canvasCls } from "../ModuleShell";
import { useCanvas, COLORS } from "../useCanvas";
import { MODULES } from "@/lib/modules";

export function pascalRows(n: number) { const rows: number[][] = [[1]]; for (let i = 1; i < n; i++) { const p = rows[i - 1]!; const r = [1]; for (let k = 1; k < i; k++) r.push(p[k - 1]! + p[k]!); r.push(1); rows.push(r); } return rows; }

function Lab() {
  const [rows, setRows] = useState(32);
  const [mod, setMod] = useState(2);
  const [hover, setHover] = useState<{ n: number; k: number } | null>(null);
  const geom = { rows };
  const ref = useCanvas((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const s = Math.min((w - 40) / rows, (h - 40) / (rows * 0.866));
    const top = 20;
    let prev: number[] = [1 % mod];
    for (let n = 0; n < rows; n++) {
      const row = n === 0 ? prev : [1 % mod, ...prev.slice(1).map((v, i) => (prev[i]! + v) % mod), 1 % mod];
      prev = row;
      const y = top + n * s * 0.866; const x0 = w / 2 - (n * s) / 2;
      for (let k = 0; k <= n; k++) {
        const v = row[k]!; const x = x0 + k * s;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.002 - n * 0.15);
        if (v !== 0) {
          const hue = 80 + (v / mod) * 140;
          ctx.fillStyle = `oklch(${0.6 + 0.2 * pulse} 0.14 ${hue})`;
        } else ctx.fillStyle = "oklch(1 0 0 / 0.04)";
        if (hover && hover.n === n && hover.k === k) ctx.fillStyle = COLORS.text;
        ctx.beginPath(); ctx.arc(x, y + s / 2, s * 0.44, 0, 7); ctx.fill();
      }
    }
    if (rows <= 14) {
      const vals = pascalRows(rows); ctx.fillStyle = "oklch(0.15 0.01 285)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `${Math.max(9, s * 0.3)}px JetBrains Mono`;
      vals.forEach((r, n) => r.forEach((v, k) => ctx.fillText(String(v), w / 2 - (n * s) / 2 + k * s, top + n * s * 0.866 + s / 2)));
      ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
    }
  }, [rows, mod, hover]);
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect(); const w = r.width, h = r.height;
    const s = Math.min((w - 40) / geom.rows, (h - 40) / (geom.rows * 0.866));
    const n = Math.floor((e.clientY - r.top - 20) / (s * 0.866)); if (n < 0 || n >= rows) return setHover(null);
    const k = Math.round((e.clientX - r.left - (w / 2 - (n * s) / 2)) / s); setHover(k >= 0 && k <= n ? { n, k } : null);
  };
  const binom = (n: number, k: number) => { let r = 1n; for (let i = 1; i <= k; i++) r = (r * BigInt(n - k + i)) / BigInt(i); return r; };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <canvas ref={ref} className={canvasCls} onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
      <Panel className="space-y-5">
        <Slider label="Satır sayısı" value={rows} min={4} max={128} onChange={setRows} />
        <Slider label="Modül (renk = C(n,k) mod m)" value={mod} min={2} max={9} onChange={setMod} />
        <Stat label="Üzerine gelinen hücre" value={hover ? `C(${hover.n},${hover.k}) = ${binom(hover.n, hover.k).toString().slice(0, 18)}` : "—"} />
        <Stat label="Satır toplamı (son satır)" value={`2^${rows - 1}`} />
        <p className="text-xs text-muted-foreground">m = 2 iken tek sayılar renkli, çiftler karanlık kalır: Sierpinski üçgeni belirir. 14 satır veya daha azında sayılar hücrelerde görünür.</p>
      </Panel>
    </div>
  );
}

export default function PascalLab() {
  return <ModuleShell meta={MODULES[5]!} lab={<Lab />}
    guide={<>
      <H>Nasıl kullanılır?</H>
      <p><b>Satır sayısı</b> ile Pascal üçgeninin kaç satır çizileceğini seç. Az satırda (≤14) gerçek sayıları okuyabilirsin; satır sayısını 64 veya 128'e çıkardığında bir fraktal ortaya çıkar.</p>
      <p><b>Modül</b> kaydırıcısı her sayının m'ye bölümünden kalanına göre renklendirir. m = 2 klasik Sierpinski üçgenini, m = 3, 5, 7 gibi asal sayılar ise farklı kendine benzer desenleri verir. Fareyi bir hücrenin üzerine getirerek C(n,k) değerini gör.</p>
    </>}
    proof={<>
      <H>Kural</H>
      <F>C(n, k) = C(n−1, k−1) + C(n−1, k), &nbsp; C(n,0) = C(n,n) = 1</F>
      <p>Her sayı, üstündeki iki sayının toplamıdır. C(n,k) = n! / (k!(n−k)!) değeri, n elemanlı bir kümeden k eleman seçme sayısıdır ve <span className="font-mono text-secondary">(a+b)ⁿ</span> açılımının katsayılarını verir (Binom Teoremi). Bu yüzden n. satırın toplamı (1+1)ⁿ = 2ⁿ'dir.</p>
      <H>Neden Sierpinski üçgeni çıkıyor?</H>
      <p>Toplama kuralını mod 2'de yazarsak, yani 1 + 1 = 0 alırsak, kural XOR işlemine dönüşür. 2ᵏ satırlık bir blok düşünelim. Frobenius özelliği (a + b)² ≡ a² + b² (mod 2) ile şu elde edilir:</p>
      <F>(1 + x)^(2ᵏ) ≡ 1 + x^(2ᵏ) (mod 2)</F>
      <p>Yani 2ᵏ. satır, iki uçtaki 1 dışında tamamen çifttir. Bu sıfır satırından aşağı doğru üçgen iki kopyaya ayrılır ve aralarında boş (çift) bir ters üçgen kalır. 2ᵏ⁺¹ satırlık üçgen, 2ᵏ satırlık üçgenin 3 kopyasından oluşur — tam olarak Sierpinski'nin kendine benzerlik kuralı.</p>
      <p><b>Lucas Teoremi</b> bunu genelleştirir: C(n,k) tektir ⇔ k'nin ikili gösterimindeki her 1, n'nin ikili gösteriminde de 1'dir. Fraktalın boyutu log 3 / log 2 ≈ 1.585'tir.</p>
    </>} />;
}
