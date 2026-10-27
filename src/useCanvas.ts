import { useEffect, useRef } from "react";

export type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

/** Resizes canvas to its box (DPR-aware) and runs draw every frame. Client-only via useEffect. */
export function useCanvas(draw: DrawFn, deps: unknown[] = []) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const loop = (t: number) => { drawRef.current(ctx, w, h, t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export const COLORS = {
  gold: "oklch(0.82 0.14 80)",
  cyan: "oklch(0.72 0.13 195)",
  red: "oklch(0.68 0.2 25)",
  dim: "oklch(1 0 0 / 0.08)",
  text: "oklch(0.95 0.01 85)",
  muted: "oklch(0.66 0.015 285)",
};
