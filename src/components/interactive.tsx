"use client";

import {
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useSpring, useTransform } from "motion/react";

/* ─────────────────────────────────────────────────────────
   PressButton — кнопка с пружинным нажатием + ripple-волна
───────────────────────────────────────────────────────── */

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface PressButtonProps {
  children: ReactNode;
  rippleColor?: string;
  scaleAmount?: number;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function PressButton({
  children,
  rippleColor = "rgba(124, 92, 255, 0.18)",
  scaleAmount = 0.95,
  className = "",
  onClick,
  disabled,
  type = "button",
}: PressButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const scale = useSpring(1, { stiffness: 500, damping: 30 });
  const ref = useRef<HTMLButtonElement>(null);

  const addRipple = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y, size }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };

  const handlePress = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    scale.set(scaleAmount);
    addRipple(e);
    onClick?.(e);
  };

  const handleRelease = () => {
    scale.set(1);
  };

  return (
    <motion.button
      ref={ref}
      style={{ scale }}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={() => !disabled && scale.set(scaleAmount)}
      onTouchEnd={handleRelease}
      disabled={disabled}
      className={`relative overflow-hidden select-none ${className}`}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full animate-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            background: rippleColor,
          }}
        />
      ))}
      {children}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   TiltCard — карточка с 3D-наклоном при наведении мышью
───────────────────────────────────────────────────────── */

export function TiltCard({
  children,
  className = "",
  intensity = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useSpring(0, { stiffness: 180, damping: 22 });
  const rawY = useSpring(0, { stiffness: 180, damping: 22 });
  const shadow = useSpring(0, { stiffness: 180, damping: 22 });

  const rotateX = useTransform(rawY, (v) => v);
  const rotateY = useTransform(rawX, (v) => v);
  const boxShadow = useTransform(
    shadow,
    (s) =>
      `0 ${8 + s * 1.5}px ${28 + s * 3}px rgba(31, 35, 64, ${0.06 + s * 0.008}), 0 0 0 1px rgba(124,92,255,${s * 0.012})`
  );

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rawX.set(dx * intensity);
    rawY.set(-dy * intensity);
    shadow.set(Math.abs(dx) * 10 + Math.abs(dy) * 10);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    shadow.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, boxShadow, transformStyle: "preserve-3d" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`cursor-default ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PressCard — карточка с пружинным нажатием + ripple
───────────────────────────────────────────────────────── */

export function PressCard({
  children,
  className = "",
  onClick,
  rippleColor = "rgba(124, 92, 255, 0.10)",
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  rippleColor?: string;
}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const scale = useSpring(1, { stiffness: 500, damping: 32 });
  const ref = useRef<HTMLDivElement>(null);

  const handleDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    scale.set(0.975);
    const rect = ref.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.8;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y, size }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
  };

  const handleUp = () => {
    scale.set(1);
    onClick?.();
  };

  return (
    <motion.div
      ref={ref}
      style={{ scale }}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={() => scale.set(1)}
      onTouchStart={() => scale.set(0.975)}
      onTouchEnd={() => { scale.set(1); onClick?.(); }}
      className={`relative overflow-hidden cursor-pointer select-none ${className}`}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full animate-ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size, background: rippleColor }}
        />
      ))}
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   GlowButton — кнопка со свечением при hover + нажатии
───────────────────────────────────────────────────────── */

export function GlowButton({
  children,
  className = "",
  glowColor = "rgba(124, 92, 255, 0.45)",
  onClick,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const scale = useSpring(1, { stiffness: 500, damping: 30 });
  const glow = useSpring(0, { stiffness: 300, damping: 25 });
  const boxShadow = useTransform(
    glow,
    (g) => `0 ${8 + g * 0.4}px ${20 + g * 0.8}px ${glowColor.replace("0.45", String(0.2 + g * 0.003))}`
  );

  return (
    <motion.button
      style={{ scale, boxShadow }}
      onMouseEnter={() => { if (!disabled) glow.set(60); }}
      onMouseLeave={() => { glow.set(0); scale.set(1); }}
      onMouseDown={() => { if (!disabled) scale.set(0.96); }}
      onMouseUp={() => { scale.set(1); }}
      onTouchStart={() => { if (!disabled) { scale.set(0.96); glow.set(60); } }}
      onTouchEnd={() => { scale.set(1); glow.set(0); onClick?.(); }}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden select-none ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   NavTab — нижняя навигация с пружиной и активным пузырём
───────────────────────────────────────────────────────── */

export function NavTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const scale = useSpring(1, { stiffness: 500, damping: 30 });

  return (
    <motion.button
      style={{ scale }}
      onMouseDown={() => scale.set(0.88)}
      onMouseUp={() => scale.set(1)}
      onMouseLeave={() => scale.set(1)}
      onTouchStart={() => scale.set(0.88)}
      onTouchEnd={() => { scale.set(1); onClick(); }}
      onClick={onClick}
      className="flex min-w-[52px] flex-1 flex-col items-center gap-1 select-none"
    >
      <motion.span
        animate={{
          backgroundColor: active ? "#efeaff" : "transparent",
          scale: active ? 1.08 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="grid h-10 w-10 place-items-center rounded-2xl"
      >
        <Icon className={`h-[18px] w-[18px] transition-colors duration-200 ${active ? "text-primary" : "text-dim"}`} />
      </motion.span>
      <motion.span
        animate={{ color: active ? "#7c5cff" : "#8f97ba" }}
        className="text-[11px] font-semibold"
      >
        {label}
      </motion.span>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   TransactionItem — строка операции с hover-свечением
   и кнопкой удаления с пружиной
───────────────────────────────────────────────────────── */

export function TransactionItem({
  children,
  onDelete,
  className = "",
}: {
  children: ReactNode;
  onDelete?: () => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const trashScale = useSpring(1, { stiffness: 500, damping: 28 });

  return (
    <motion.div
      animate={{
        backgroundColor: hovered ? "rgba(124,92,255,0.028)" : "rgba(255,255,255,0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative flex items-center transition-colors duration-150 ${className}`}
    >
      {children}
      {onDelete && (
        <motion.button
          style={{ scale: trashScale }}
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 6 }}
          transition={{ duration: 0.18 }}
          onMouseDown={() => trashScale.set(0.8)}
          onMouseUp={() => trashScale.set(1)}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="ml-3 shrink-0 rounded-xl p-1.5 text-[#c5cce5] hover:bg-red-soft hover:text-red"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
}
