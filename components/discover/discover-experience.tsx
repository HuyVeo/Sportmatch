"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { DiscoverBoard, type DiscoverUser } from "@/components/discover/discover-board";
import { useDiscoverIntro } from "@/components/discover/discover-intro-provider";
import { cn } from "@/lib/utils";
import type { Weekday } from "@/lib/types";

type SportOption = { id: string; name: string; icon: string };

const SPORTS = ["🏸", "🏓", "⚽", "🏀", "🎾", "🏃", "🏋️", "🥇"];
const ORBITS = [
  {
    inset: "inset-0",
    spin: "motion-safe:animate-[spin_42s_linear_infinite]",
    counterSpin: "motion-safe:animate-[spin_42s_linear_infinite_reverse]",
    icons: ["🏸", "⚽", "🏀", "🏓"],
  },
  {
    inset: "inset-8",
    spin: "motion-safe:animate-[spin_30s_linear_infinite_reverse]",
    counterSpin: "motion-safe:animate-[spin_30s_linear_infinite]",
    icons: ["🎾", "🏃", "🏸", "🏋️"],
  },
  {
    inset: "inset-16",
    spin: "motion-safe:animate-[spin_20s_linear_infinite]",
    counterSpin: "motion-safe:animate-[spin_20s_linear_infinite_reverse]",
    icons: ["🏓", "🥇", "🎾"],
  },
];
const PARTICLES = Array.from({ length: 48 }, (_, index) => {
  const angle = (index / 48) * Math.PI * 2;
  const distance = 35 + ((index * 37) % 42);
  return {
    icon: SPORTS[index % SPORTS.length],
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    delay: `${(index % 8) * 18}ms`,
    size: 15 + (index % 4) * 5,
    rotation: `${(index % 2 ? 1 : -1) * (35 + (index % 6) * 12)}deg`,
  };
});

export function DiscoverExperience({
  users,
  sports,
  myAvailability,
}: {
  users: DiscoverUser[];
  sports: SportOption[];
  myAvailability: Weekday[];
}) {
  const { hasSeenIntro, setHasSeenIntro } = useDiscoverIntro();
  const [introOpen, setIntroOpen] = useState(() => !hasSeenIntro);
  const [bursting, setBursting] = useState(false);
  const [particlesExploded, setParticlesExploded] = useState(false);
  const [fading, setFading] = useState(false);
  const [explosionOrigin, setExplosionOrigin] = useState({ x: 0, y: 0 });
  const timerIds = useRef<number[]>([]);
  const started = useRef(false);

  useEffect(
    () => () => {
      timerIds.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  function beginIntro(event: ReactMouseEvent<HTMLDivElement>) {
    if (started.current) return;
    started.current = true;
    const bounds = event.currentTarget.getBoundingClientRect();
    setExplosionOrigin(
      event.detail === 0
        ? { x: bounds.width / 2, y: bounds.height / 2 }
        : { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
    );
    setHasSeenIntro(true);
    setBursting(true);
    setParticlesExploded(true);
    timerIds.current.push(
      window.setTimeout(() => setParticlesExploded(false), 520),
      window.setTimeout(() => setFading(true), 780),
      window.setTimeout(() => {
        setIntroOpen(false);
        setBursting(false);
        setParticlesExploded(false);
        setFading(false);
        started.current = false;
      }, 1_250),
    );
  }

  function replayIntro() {
    timerIds.current.forEach((timer) => window.clearTimeout(timer));
    timerIds.current = [];
    started.current = false;
    setBursting(false);
    setParticlesExploded(false);
    setFading(false);
    setIntroOpen(true);
  }

  return (
    <>
      <main
        aria-hidden={introOpen}
        inert={introOpen}
        className={cn(introOpen && "h-[calc(100dvh-4rem)] overflow-hidden")}
      >
        <div className="fixed top-20 right-5 z-40 sm:right-8">
          <button
            type="button"
            onClick={replayIntro}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-lg backdrop-blur transition hover:border-orange-500/40 hover:text-orange-600"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Xem lại Intro</span>
            <span className="sm:hidden">Intro</span>
          </button>
        </div>
        <DiscoverBoard
          users={users}
          sports={sports}
          myAvailability={myAvailability}
        />
      </main>

      {introOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mở đầu SportMatch"
          className={cn(
            "intro fixed inset-x-0 top-16 bottom-0 z-40 flex cursor-pointer items-center justify-center overflow-hidden transition-[opacity,transform] duration-500 ease-in-out motion-reduce:duration-0",
            fading ? "pointer-events-none scale-95 -translate-y-3 opacity-0" : "opacity-100",
          )}
          onClick={beginIntro}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.10)_0%,rgba(255,255,255,0)_55%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.18)_0%,rgba(17,17,17,0)_55%)]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {PARTICLES.map((particle, index) => (
              <span
                key={`particle-${index}`}
                className={cn(
                  "absolute select-none transition-[transform,opacity] duration-[900ms] ease-out motion-reduce:duration-0",
                  particlesExploded ? "opacity-100" : "opacity-0",
                )}
                style={{
                  left: explosionOrigin.x,
                  top: explosionOrigin.y,
                  fontSize: particle.size,
                  transform: bursting
                    ? `translate(calc(-50% + ${particle.x}vw), calc(-50% + ${particle.y}vh)) rotate(${particle.rotation}) scale(1.2)`
                    : "translate(-50%, -50%) scale(0.1)",
                  transitionDelay: bursting ? particle.delay : "0ms",
                  filter: "drop-shadow(0 0 12px rgba(249,115,22,.95))",
                }}
              >
                {particle.icon}
              </span>
            ))}
          </div>
          <div className="relative flex flex-col items-center px-5 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-orange-700 dark:text-orange-200">
              <Sparkles className="size-3.5" />
              SPORTMATCH
            </span>
            <h1 className="font-heading max-w-2xl text-3xl font-extrabold tracking-tight text-[#111111] dark:text-white sm:text-5xl lg:text-6xl">
              Khám phá cộng đồng
              <span className="mt-1 block bg-gradient-to-r from-orange-700 via-orange-500 to-amber-600 bg-clip-text text-transparent dark:from-orange-200 dark:via-orange-400 dark:to-amber-200">
                thể thao quanh bạn
              </span>
            </h1>
            <p className="mt-4 text-sm text-black/60 dark:text-white/60 sm:text-base">
              Tìm đồng đội. Tạo trận. Cùng ra sân.
            </p>

            <div className="relative mt-10 flex size-64 items-center justify-center sm:size-80">
              {ORBITS.map((orbit, orbitIndex) => (
                <div
                  key={`orbit-${orbitIndex}`}
                  aria-hidden="true"
                  className={cn(
                    "absolute rounded-full border border-dashed border-orange-500/25 transition-[transform,opacity] duration-700 ease-out dark:border-orange-300/20",
                    orbit.inset,
                    orbit.spin,
                    bursting && "scale-150 opacity-0",
                    "motion-reduce:animate-none",
                  )}
                >
                  {orbit.icons.map((icon, iconIndex) => {
                    const angle = (iconIndex / orbit.icons.length) * Math.PI * 2;
                    const x = `${Math.round(50 + Math.cos(angle) * 50)}%`;
                    const y = `${Math.round(50 + Math.sin(angle) * 50)}%`;

                    return (
                      <span
                        key={`${orbitIndex}-${icon}-${iconIndex}`}
                        className="absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-orange-500/20 bg-background/80 text-xl shadow-[0_0_24px_rgba(249,115,22,0.2)] backdrop-blur-sm dark:border-orange-300/20 sm:size-11 sm:text-2xl"
                        style={{ left: x, top: y }}
                      >
                        <span
                          className={cn(orbit.counterSpin, "motion-reduce:animate-none")}
                        >
                          {icon}
                        </span>
                      </span>
                    );
                  })}
                </div>
              ))}

              <button
                type="button"
                aria-label="Bắt đầu khám phá SportMatch"
                className={cn(
                  "group relative z-10 flex size-28 items-center justify-center rounded-full outline-none transition-[transform,opacity] duration-700 ease-out focus-visible:ring-4 focus-visible:ring-orange-300/70 sm:size-32",
                  bursting ? "scale-[2.4] opacity-0" : "hover:scale-105 active:scale-95",
                )}
              >
                <span className="absolute inset-0 rounded-full bg-orange-500/25 blur-2xl transition group-hover:bg-orange-400/40" />
                <span className="absolute inset-1 rounded-full border border-orange-200/35 shadow-[0_0_45px_rgba(249,115,22,.3),inset_0_0_28px_rgba(249,115,22,.2)] motion-safe:animate-[spin_16s_linear_infinite] motion-reduce:animate-none" />
                <span className="absolute inset-4 rounded-full border border-dashed border-orange-100/35 motion-safe:animate-[spin_22s_linear_infinite_reverse] motion-reduce:animate-none" />
                <span className="relative size-16 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff7ed_0%,#fdba74_20%,#f97316_55%,#9a3412_100%)] shadow-[0_0_35px_rgba(249,115,22,.9),0_0_95px_rgba(249,115,22,.5)] sm:size-[4.5rem]" />
              </button>
            </div>

          </div>
        </div>
      ) : null}
    </>
  );
}
