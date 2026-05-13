"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; ox: number; oy: number; ph: number; sp: number; sz: number };
type Particle = { x: number; y: number; vx: number; vy: number; sz: number; a: number };

export default function AgentMeshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let dots: Dot[] = [];
    let particles: Particle[] = [];
    let rafId: number;
    const t0 = performance.now();

    function fit() {
      const r = container!.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas!.width = W * DPR; canvas!.height = H * DPR;
      canvas!.style.width = W + "px"; canvas!.style.height = H + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildText();
      buildParticles();
    }

    function buildText() {
      const off = document.createElement("canvas");
      const ow = Math.floor(W), oh = Math.floor(H);
      off.width = ow; off.height = oh;
      const o = off.getContext("2d")!;
      o.fillStyle = "#000"; o.fillRect(0, 0, ow, oh);
      o.fillStyle = "#fff";
      o.textAlign = "center"; o.textBaseline = "middle";
      const fs = Math.floor(Math.min(ow * 0.13, oh * 0.22));
      o.font = `800 ${fs}px "Geist Mono", ui-monospace, monospace`;
      o.fillText("MULTI-AGENT", ow / 2, oh / 2);
      const img = o.getImageData(0, 0, ow, oh).data;
      const step = Math.max(3, Math.round(fs / 14));
      dots = [];
      for (let y = 0; y < oh; y += step) {
        for (let x = 0; x < ow; x += step) {
          const i = (y * ow + x) * 4;
          if (img[i] > 120) {
            const jx = (Math.random() - 0.5) * 0.6;
            const jy = (Math.random() - 0.5) * 0.6;
            dots.push({ x: x + jx, y: y + jy, ox: x + jx, oy: y + jy, ph: Math.random() * Math.PI * 2, sp: 0.6 + Math.random() * 1.2, sz: 1 + Math.random() * 0.8 });
          }
        }
      }
    }

    function buildParticles() {
      particles = [];
      const N = Math.floor((W * H) / 9000);
      for (let i = 0; i < N; i++) {
        particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, sz: Math.random() * 1.1 + 0.2, a: Math.random() * 0.4 + 0.05 });
      }
    }

    function drawHex(cx: number, cy: number, r: number, rot: number, color: string, lw: number) {
      ctx!.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = rot + i * Math.PI / 3;
        i ? ctx!.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx!.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx!.closePath();
      ctx!.strokeStyle = color; ctx!.lineWidth = lw; ctx!.stroke();
    }

    function frame(now: number) {
      const t = (now - t0) / 1000;
      ctx!.clearRect(0, 0, W, H);

      const g = ctx!.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.7);
      g.addColorStop(0, "rgba(245,197,24,0.045)");
      g.addColorStop(0.5, "rgba(8,8,12,0)");
      g.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx!.fillStyle = g; ctx!.fillRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;
        ctx!.fillStyle = `rgba(220,220,230,${p.a})`; ctx!.fillRect(p.x, p.y, p.sz, p.sz);
      }

      const cx = W / 2, cy = H / 2;
      const baseR = Math.min(W, H) * 0.34;
      drawHex(cx, cy, baseR,         t * 0.18,       "rgba(255,255,255,0.07)", 1);
      drawHex(cx, cy, baseR * 0.78, -t * 0.22 + 0.3, "rgba(255,255,255,0.10)", 1);
      drawHex(cx, cy, baseR * 0.56,  t * 0.30 + 0.6, "rgba(245,197,24,0.18)",  1);
      drawHex(cx, cy, baseR * 1.12, -t * 0.12,       "rgba(255,255,255,0.04)", 1);

      for (let i = 0; i < 6; i++) {
        const a = t * 0.18 + i * Math.PI / 3;
        const nx = cx + Math.cos(a) * baseR, ny = cy + Math.sin(a) * baseR;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + i);
        ctx!.fillStyle = `rgba(245,197,24,${0.35 + pulse * 0.5})`;
        ctx!.beginPath(); ctx!.arc(nx, ny, 2 + pulse * 1.2, 0, Math.PI * 2); ctx!.fill();
        ctx!.strokeStyle = `rgba(245,197,24,${0.05 + pulse * 0.08})`; ctx!.lineWidth = 1;
        ctx!.beginPath(); ctx!.moveTo(cx, cy); ctx!.lineTo(nx, ny); ctx!.stroke();
      }

      for (const d of dots) {
        const wave = Math.sin(t * 1.6 + d.ox * 0.012) * 0.8;
        d.x = d.ox + Math.sin(t * 0.7 + d.ph) * 0.6 + wave * 0.4;
        d.y = d.oy + Math.cos(t * 0.9 + d.ph) * 0.6;
        const phase = (d.ox / W) - (t * 0.18 % 1);
        const wrap = ((phase % 1) + 1) % 1;
        const peak = Math.max(0, 1 - Math.abs(wrap - 0.5) * 2.4);
        const baseA = 0.42 + 0.18 * Math.sin(t * 1.2 + d.ph);
        const a = Math.min(1, baseA + peak * 0.55);
        ctx!.fillStyle = peak > 0.55 ? `rgba(245,197,24,${a})` : `rgba(232,232,238,${a})`;
        ctx!.fillRect(d.x, d.y, d.sz, d.sz);
      }

      rafId = requestAnimationFrame(frame);
    }

    const observer = new ResizeObserver(() => fit());
    observer.observe(container);
    fit();
    // Skip animation loop entirely if user prefers reduced motion — single static frame already drawn by fit()
    if (!prefersReduced) {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
