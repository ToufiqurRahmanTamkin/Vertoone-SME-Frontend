import { motion, useReducedMotion } from "motion/react";

/**
 * Full-screen ambient backdrop for the centered auth layout: a tinted base
 * vignette with slowly drifting aurora orbs, a rotating conic sheen, a faint
 * grid masked to a soft vignette, and a hairline top glow. Every loop is
 * disabled when the user prefers reduced motion (the colour still tints).
 *
 * Colour comes entirely from the active theme's tokens (primary / accent /
 * secondary over `background`), so the auth screens match whatever preset the
 * app is running — Starry Night by default — in both light and dark mode.
 */
export function AuthAurora() {
  const reduce = useReducedMotion();

  const drift = (dx: number, dy: number, scale: number, duration: number) =>
    reduce
      ? undefined
      : {
          x: [0, dx, 0],
          y: [0, dy, 0],
          scale: [1, scale, 1],
          transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
        };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base radial vignette (navy) */}
      <div className="absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_-10%,color-mix(in_oklch,var(--primary)_14%,var(--background))_0%,var(--background)_46%,color-mix(in_oklch,var(--foreground)_6%,var(--background))_100%)]" />

      {/* Drifting brand aurora orbs */}
      <motion.div
        className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]"
        animate={drift(-40, 30, 1.15, 20)}
      />
      <motion.div
        className="absolute top-1/3 -left-28 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-[110px]"
        animate={drift(50, -30, 1.2, 24)}
      />
      <motion.div
        className="absolute -bottom-44 right-0 h-[32rem] w-[32rem] rounded-full bg-secondary/20 blur-[120px]"
        animate={drift(-30, -20, 1.15, 22)}
      />

      {/* Slowly rotating conic sheen behind the card */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-2xl [background:conic-gradient(from_180deg_at_50%_50%,transparent_0deg,color-mix(in_oklch,var(--primary)_18%,transparent)_90deg,transparent_180deg,color-mix(in_oklch,var(--accent)_14%,transparent)_270deg,transparent_360deg)]"
        animate={
          reduce ? undefined : { rotate: [0, 360], transition: { duration: 64, repeat: Infinity, ease: "linear" } }
        }
      />

      {/* Faint grid, masked to a soft centre vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_7%,transparent)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />

      {/* Hairline top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}
