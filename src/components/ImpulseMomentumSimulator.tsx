import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";

/* ========== constantes visuales ========== */
const CAR_VISUAL_WIDTH = 200;
const CAR_VISUAL_HEIGHT = 72;
const ROAD_PADDING = 24;
const ROAD_ALIGN_OFFSET = 16;
const DASH_TOP_OFFSET = 42;
const BUBBLE_OFFSET = 72;
const PIXELS_PER_METER = 40; // escala pixeles / metro

export default function ImpulseMomentumSimulator() {
  const navigate = useNavigate();

  // parámetros físicos
  const [mass] = useState(2.0); // kg (fijo)
  const [force, setForce] = useState(15); // N
  const [duration, setDuration] = useState(2); // s

  // UI / render state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [vxRender, setVxRender] = useState(0);
  const [xRender, setXRender] = useState(0);
  const [tAppliedRender, setTAppliedRender] = useState(0);

  // refs para simulación
  const vRef = useRef(0); // m/s
  const xRef = useRef(0); // px
  const tAppliedRef = useRef(0); // s
  const playingRef = useRef(false);
  const pausedRef = useRef(false);
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const roadRef = useRef<HTMLDivElement | null>(null);
  const [laneTop, setLaneTop] = useState<number>(130);

  // Cálculos teóricos
  const impulse = force * duration; // N·s
  const initialMomentum = 0; // asumimos reposo
  const finalMomentum = initialMomentum + impulse;
  const finalVelocity = finalMomentum / mass;
  const deltaMomentum = finalMomentum - initialMomentum;
  const kineticFinal = 0.5 * mass * finalVelocity * finalVelocity;

  /* ========== posicionar auto en resize ========== */
  useEffect(() => {
    const place = () => {
      const wrapW = containerRef.current?.clientWidth ?? 1000;
      const startX = wrapW * 0.15;
      xRef.current = startX;
      setXRender(startX);

      const road = roadRef.current;
      const wrap = containerRef.current;
      if (road && wrap) {
        const roadRect = road.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        const y =
          roadRect.top - wrapRect.top + roadRect.height / 2 - CAR_VISUAL_HEIGHT / 2;
        setLaneTop(y);
      }
    };

    place();
    let ro: any = null;
    if (typeof window !== "undefined" && (window as any).ResizeObserver) {
      ro = new (window as any).ResizeObserver(place);
      if (containerRef.current) ro.observe(containerRef.current);
    } else {
      window.addEventListener("resize", place);
    }
    return () => {
      if (ro) {
        try {
          if (containerRef.current) ro.unobserve(containerRef.current);
          ro.disconnect();
        } catch {}
      } else {
        window.removeEventListener("resize", place);
      }
    };
  }, []);

  /* ========== bloquear scroll para que no aparezca barra vertical ========== */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ========== controles: start / pause / reset ========== */
  const start = () => {
    if (playingRef.current && !pausedRef.current) return;

    if (playingRef.current && pausedRef.current) {
      pausedRef.current = false;
      setIsPaused(false);
      lastRef.current = performance.now();
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // inicio limpio
    vRef.current = 0;
    tAppliedRef.current = 0;
    const wrapW = containerRef.current?.clientWidth ?? 1000;
    const startX = wrapW * 0.15;
    xRef.current = startX;

    setVxRender(0);
    setXRender(startX);
    setTAppliedRender(0);

    playingRef.current = true;
    pausedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    lastRef.current = performance.now();
    if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
  };

  const pause = () => {
    if (!playingRef.current) return;
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
    setIsPlaying(playingRef.current && !pausedRef.current);
    if (!pausedRef.current) {
      lastRef.current = performance.now();
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
    }
  };

  const reset = () => {
    playingRef.current = false;
    pausedRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    vRef.current = 0;
    tAppliedRef.current = 0;
    lastRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const wrapW = containerRef.current?.clientWidth ?? 1000;
    const startX = wrapW * 0.15;
    xRef.current = startX;
    setXRender(startX);
    setVxRender(0);
    setTAppliedRender(0);
  };

  /* ========== loop RAF ========== */
  const loop = (ts: number) => {
    if (!lastRef.current) lastRef.current = ts;
    const dt = Math.min((ts - lastRef.current) / 1000, 0.05);
    lastRef.current = ts;

    if (playingRef.current && !pausedRef.current) {
      if (tAppliedRef.current < duration) {
        const a = force / mass; // m/s^2
        vRef.current += a * dt;
        tAppliedRef.current += dt;
      }

      xRef.current += vRef.current * PIXELS_PER_METER * dt;

      const wrapW = containerRef.current?.clientWidth ?? 1000;
      const rightLimit = wrapW - ROAD_PADDING - CAR_VISUAL_WIDTH / 2;
      if (xRef.current > rightLimit) {
        xRef.current = rightLimit;
        playingRef.current = false;
        setIsPlaying(false);
      }

      setVxRender(vRef.current);
      setXRender(xRef.current);
      setTAppliedRender(Math.min(tAppliedRef.current, duration));
    }

    if (playingRef.current && !pausedRef.current) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const xStyle = (x: number) => ({
    transform: `translateX(${x - CAR_VISUAL_WIDTH / 2}px)`,
  });

  const Bubble = ({ text }: { text: string }) => (
    <div
      className="absolute left-1/2 -translate-x-1/2 rounded-2xl bg-white/90 border border-black/10 px-3 py-1 text-xs shadow"
      style={{ top: -BUBBLE_OFFSET }}
    >
      {text}
    </div>
  );

  return (
    <div
      className="min-h-screen w-full text-slate-900 relative"
      style={{
        backgroundImage: 'url("/assets/bg/scene.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* botón volver */}
      <div className="absolute left-4 top-4 z-20">
        <Button
          variant="secondary"
          className="bg-white/90 hover:bg-white border"
          onClick={() => navigate("/nivel/2/intro")}
        >
          ← Volver a info
        </Button>
      </div>

      <h1 className="text-center pt-6 text-4xl font-extrabold">Impulso y Momento</h1>

      {/* Panel superior: ahora solo 2 tarjetas (Controles + Valores teoricos) */}
      <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-4 px-4 md:grid-cols-2">
        <div className="border-slate-300/60 bg-white/90 p-5 rounded-2xl border-4 shadow-[6px_8px_0_#000]">
          <h3 className="mb-2 font-semibold">Magnitud de la Fuerza (N)</h3>
          <div className="flex items-center gap-2">
            <Slider
              value={[force]}
              min={5}
              max={50}
              step={1}
              onValueChange={(v) => !isPlaying && setForce(v[0])}
              className="flex-1"
            />
            <span className="min-w-[3rem] text-right font-mono text-sm">{force}</span>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 font-semibold">Duración (s)</h3>
            <div className="flex items-center gap-2">
              <Slider
                value={[duration]}
                min={0.5}
                max={5}
                step={0.1}
                onValueChange={(v) => !isPlaying && setDuration(v[0])}
                className="flex-1"
              />
              <span className="min-w-[3rem] text-right font-mono text-sm">{duration.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="border-slate-300/60 bg-white/90 p-5 rounded-2xl border-4 shadow-[6px_8px_0_#000]">
          <h3 className="font-semibold mb-3">Valores (teóricos)</h3>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold mb-2">
            <div>Magnitud</div>
            <div className="text-right">Valor</div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border bg-white/70 px-2 py-2 text-sm">Impulso I = F·Δt</div>
              <div className="rounded-md border bg-white/70 px-2 py-2 text-sm text-right">{impulse.toFixed(1)} N·s</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border bg-white/70 px-2 py-2 text-sm">Δp</div>
              <div className="rounded-md border bg-white/70 px-2 py-2 text-sm text-right">{deltaMomentum.toFixed(1)} kg·m/s</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border bg-white/70 px-2 py-2 text-sm">v_final (teórico)</div>
              <div className="rounded-md border bg-white/70 px-2 py-2 text-sm text-right">{finalVelocity.toFixed(2)} m/s</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border bg-white/70 px-2 py-2 text-sm">K_final (J)</div>
              <div className="rounded-md border bg-white/70 px-2 py-2 text-sm text-right">{kineticFinal.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* escena / carretera (más grande y centrada) */}
      <div
        ref={containerRef}
        className="relative mx-auto mt-6 h-[320px] max-w-7xl overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-b from-sky-200/50 to-sky-300/50"
      >
        <div
          ref={roadRef}
          className="absolute left-0 right-0 h-40 bg-neutral-700"
          style={{
            top: `calc(50% + ${ROAD_ALIGN_OFFSET}px)`,
            transform: "translateY(-50%)",
            paddingLeft: ROAD_PADDING,
            paddingRight: ROAD_PADDING,
          }}
        >
          <div className="mx-8 flex h-1 justify-between" style={{ marginTop: DASH_TOP_OFFSET }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-1 w-24 bg-yellow-300" />
            ))}
          </div>
        </div>

        {/* burbuja de datos arriba del auto */}
        <div
          className="absolute pointer-events-none select-none"
          style={{
            top: laneTop,
            width: CAR_VISUAL_WIDTH,
            height: CAR_VISUAL_HEIGHT,
            ...xStyle(xRender),
          }}
        >
          <img
            src="/assets/cars/car-red.png"
            alt="Carro"
            className="h-full w-auto drop-shadow-lg"
            draggable={false}
          />
          <Bubble text={`m = ${mass.toFixed(1)} kg  •  v = ${vxRender.toFixed(2)} m/s`} />
        </div>
      </div>

      {/* barra inferior fija con controles */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-7xl px-4">
        <div className="flex items-center justify-center gap-4">
          <div className="hidden md:block rounded-md border bg-white/90 px-3 py-1 text-sm font-medium text-slate-800 shadow">
            {isPlaying ? (isPaused ? "Pausado" : "Simulando…") : "Listo."}
          </div>

          <Button onClick={start} className="bg-emerald-600 hover:bg-emerald-700">
            Inicio
          </Button>

          <Button onClick={pause} variant="secondary" className="bg-sky-200 hover:bg-sky-300" disabled={!isPlaying && !isPaused}>
            {isPaused ? "Reanudar" : "Pausa"}
          </Button>

          <Button onClick={reset} variant="destructive" className="bg-red-500 hover:bg-red-600">
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  );
}

