import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES } from "@/lib/modules";

function NavList({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {MODULES.map((m) => {
        const active = path === `/modul/${m.slug}`;
        return (
          <Link key={m.slug} to="/modul/$slug" params={{ slug: m.slug }} onClick={onNav}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl border border-primary/30 bg-primary/10" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
            <span className={`relative font-mono text-xs ${active ? "text-primary" : ""}`}>{m.no}</span>
            <span className="relative flex-1 leading-tight">{m.title}</span>
            <span className="relative font-display text-lg text-primary/70">{m.symbol.length <= 2 ? m.symbol : ""}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="block">
      <div className="font-display text-3xl leading-none">TFL <span className="text-gradient italic">Math</span> Lab</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tarsus Fen Lisesi · Matematik Laboratuvarı</div>
    </Link>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col gap-8 border-r border-border bg-glass p-6 backdrop-blur-xl lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto"><NavList /></div>
        <p className="text-xs text-muted-foreground">8 modül · etkileşimli kanıtlar</p>
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/70 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Brand />
        <button onClick={() => setOpen(true)} aria-label="Menüyü aç" className="rounded-full border border-border px-4 py-2 text-sm">Menü</button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", bounce: 0.1 }} onClick={(e) => e.stopPropagation()}
              className="flex h-full w-80 flex-col gap-8 border-r border-border bg-popover p-6">
              <div className="flex items-start justify-between"><Brand /><button onClick={() => setOpen(false)} aria-label="Kapat" className="text-2xl text-muted-foreground">×</button></div>
              <NavList onNav={() => setOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
