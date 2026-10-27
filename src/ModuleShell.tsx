import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ModuleMeta } from "@/lib/modules";

const TABS = ["Laboratuvar", "Kullanım Kılavuzu & Nasıl Çalışır?", "Teoremin Amacı & Matematiksel Kanıtı"] as const;

export function ModuleShell({ meta, lab, guide, proof }: { meta: ModuleMeta; lab: ReactNode; guide: ReactNode; proof: ReactNode }) {
  const [tab, setTab] = useState(0);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-10 md:py-12">
      <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="font-mono text-xs tracking-[0.3em] text-primary">MODÜL {meta.no} · {meta.symbol}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight md:text-6xl">{meta.title}</h1>
        <p className="mt-2 text-muted-foreground">{meta.short}</p>
      </motion.header>
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`relative rounded-full px-4 py-2 text-sm transition-colors ${tab === i ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab === i && <motion.span layoutId={`tab-${meta.slug}`} className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.section key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="mt-6">
          {tab === 0 ? lab : <div className="glass prose-lab max-w-none space-y-4 p-6 leading-relaxed md:p-10">{tab === 1 ? guide : proof}</div>}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass p-5 ${className}`}>{children}</div>;
}

export function Slider({ label, value, min, max, step = 1, onChange, fmt }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <label className="block space-y-2">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-mono text-primary">{fmt ? fmt(value) : value}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl border border-border bg-glass p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="font-mono text-lg text-foreground">{value}</div></div>;
}

export function H({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-2xl text-primary">{children}</h3>;
}

export function F({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-border bg-muted/50 p-4 text-center font-mono text-secondary">{children}</div>;
}

export const canvasCls = "h-[420px] w-full rounded-2xl border border-border bg-background/60 md:h-[520px]";
