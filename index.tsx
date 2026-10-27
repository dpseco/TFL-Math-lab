import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TFL Math Lab — Tarsus Fen Lisesi Matematik Laboratuvarı" },
      { name: "description", content: "Altın oran, Collatz, π, Pisagor, kaos teorisi, Pascal, Lorenz ve e sayısını etkileşimli simülasyonlarla keşfet." },
      { property: "og:title", content: "TFL Math Lab — Etkileşimli Matematik Laboratuvarı" },
      { property: "og:description", content: "Fen Lisesi öğrencileri için 8 etkileşimli matematik modülü: simülasyon, kılavuz ve kanıt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-10 md:py-20">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}>
        <p className="font-mono text-xs tracking-[0.3em] text-primary">TARSUS FEN LİSESİ · MATEMATİK LABORATUVARI</p>
        <h1 className="mt-4 font-display text-6xl leading-[0.95] md:text-8xl">Matematiğe <span className="text-gradient italic">dokun.</span></h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">Sekiz büyük fikir, sekiz canlı deney. Kaydırıcıları çek, fareyi gezdir, kuralları kendi ellerinle bük — sonra neden işe yaradığının kanıtını oku.</p>
      </motion.div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m, i) => (
          <motion.div key={m.slug} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06, duration: 0.6 }}>
            <Link to="/modul/$slug" params={{ slug: m.slug }} className="glass group flex h-56 flex-col justify-between p-5 transition-all hover:-translate-y-1 hover:border-primary/40">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-muted-foreground">{m.no}</span>
                <span className="font-display text-4xl text-primary/80 transition-transform group-hover:scale-110">{m.symbol}</span>
              </div>
              <div>
                <h2 className="font-display text-2xl leading-tight">{m.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{m.short}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
